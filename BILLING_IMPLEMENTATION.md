# Billing System Implementation Guide

## Overview
The billing system in Tiki is built using **Stripe** for payment processing, with a React/Next.js frontend and Express.js backend. It handles subscriptions, invoices, payment methods, and webhook events.

---

## Architecture

### Frontend (Tiki)
- **Location**: `src/app/(main)/(org-panel)/organization/billing/`
- **Main Components**:
  - `page.tsx` - Main billing dashboard
  - `api.tsx` - API functions for billing operations
  - `context.ts` - Billing state management
  - `chockout.tsx` - Payment form component

### Backend (Express-Tiki)
- **Location**: `src/v1/controllers/organization/`
- **Key Files**:
  - `auth.controller.ts` - `processPurchase()` function
  - `card.controller.ts` - Card management (create, update, delete)
  - `organization.controller.ts` - License management
  - `webhook.ts` - Stripe webhook handler

---

## Frontend Implementation

### 1. Billing Page Structure (`page.tsx`)

```typescript
// Main billing dashboard shows:
- Account Status (pending/active/locked)
- Balance Due (calculated from apps, storage, licenses)
- Available Credit
- Renewal Date
- User Licenses table
- Pending Storage Plans
- Pending Apps list
- Invoices view
```

**Key Features:**
- Uses React Context (`BillingContext`) for state management
- Calculates total balance from:
  - Installed apps with pending payments
  - Storage plan costs
  - User license costs
- Displays invoices fetched from Stripe

### 2. API Functions (`api.tsx`)

**Main Functions:**

```typescript
// Get pending payment apps
getInstalledAppPaymentPending(axiosAuth)

// Get subscription details
getSubscriptionDetails(axiosAuth)

// Process billing/purchase
processBilling({ axiosAuth, body: { appIds, licenses } })

// Get invoices
getInvoices(axiosAuth)

// Cancel subscription
cancelSubscription({ axiosAuth })
```

### 3. Payment Form (`chockout.tsx`)

**Flow:**
1. User clicks "Pay Balance"
2. Modal shows total due amount
3. User selects payment card
4. Calls `processBilling()` API
5. Backend processes payment via Stripe

---

## Backend Implementation

### 1. Card Management (`card.controller.ts`)

**Create Card Flow:**
```typescript
async function create(req: Request, res: Response) {
  1. Create Card record in database
  2. Create Stripe Customer
  3. Create Stripe Subscription with:
     - Storage plan item
     - License item (quantity: 0 initially)
     - 14-day trial period
  4. Save subscription ID to organization
  5. Update OrganizationStoragePlan and UserLicense with subItemId
}
```

**Key Points:**
- Uses Stripe Payment Methods API
- Creates subscription with trial period
- Stores `subItemId` for each subscription item (storage, license, apps)

### 2. Process Purchase (`auth.controller.ts`)

**Flow:**
```typescript
async function processPurchase(req: Request, res: Response) {
  1. Get organization and existing subscription
  2. Build updatedItems array:
     - Storage plan updates (if changed)
     - App additions (if appIds provided)
     - License quantity updates (if licenses > 0)
  3. Update Stripe subscription:
     stripe.subscriptions.update(subscriptionId, {
       items: updatedItems,
       proration_behavior: "create_prorations"
     })
  4. If account is active, create and pay invoice immediately
  5. Save subItemIds back to database
  6. Update payment status to "paid"
}
```

**Important:**
- Uses **proration** for mid-cycle changes
- Each item (storage, app, license) has its own `subItemId` in Stripe
- Updates are reflected immediately if account is active

### 3. Stripe Webhook Handler (`webhook.ts`)

**Handled Events:**

1. **`customer.created`**
   - Sends welcome email
   - 14-day trial starts

2. **`customer.subscription.updated`**
   - Updates organization `accountPaymentStatus` to "active"
   - Sends notification email

3. **`invoice.payment_succeeded`**
   - Handles recurring payments
   - Syncs user licenses with subscription
   - Updates renewal dates
   - Handles subscription updates

4. **`invoice.payment_failed`**
   - Tracks failed payment attempts
   - After 3 failures, locks account
   - Sends notification emails

5. **`subscription_schedule.expiring`**
   - Sends expiry warning (7 days before)

**Key Features:**
- Idempotency checking (prevents duplicate processing)
- Failed payment tracking
- Automatic account locking after max failures
- Email notifications for all events

---

## Data Models

### Organization
```typescript
{
  subscriptionId: string,        // Stripe subscription ID
  accountPaymentStatus: "trial" | "active" | "pending" | "locked",
  storagePlan: ObjectId,
  userLicense: ObjectId,
  stripeCustomerId: string
}
```

### OrgSubscription
```typescript
{
  organization: ObjectId,
  currentSubscriptionId: string,
  stripeCustomerId: string,
  nextRenewalAt: Date,
  latestInvoice: string,         // PDF URL
  isCancelled: boolean
}
```

### OrganizationStoragePlan
```typescript
{
  organization: ObjectId,
  storagePlan: ObjectId,
  paymentStatus: "pending" | "paid",
  subItemId: string,            // Stripe subscription item ID
  status: "active" | "expired",
  renewalAt: Date
}
```

### UserLicense
```typescript
{
  organization: ObjectId,
  quantity: number,
  pricePerLicense: number,
  paymentStatus: "pending" | "paid",
  subItemId: string,            // Stripe subscription item ID
  dueQuantity: number
}
```

### OrgInstalledApp
```typescript
{
  organization: ObjectId,
  app: ObjectId,
  paymentStatus: "pending" | "paid",
  subItemId: string,            // Stripe subscription item ID
  renwalAt: Date
}
```

---

## Payment Flow

### 1. **Initial Setup (First Time)**
```
User adds payment card
  → Create Stripe Customer
  → Create Subscription with:
     - Storage plan (free tier initially)
     - License (quantity: 0)
  → 14-day trial starts
  → accountPaymentStatus = "trial"
```

### 2. **Adding Apps/Licenses/Storage**
```
User modifies licenses or adds apps
  → Frontend calls processPurchase()
  → Backend updates Stripe subscription items
  → If active account: immediate charge with proration
  → If trial: changes queued for after trial
  → subItemIds saved to database
```

### 3. **Recurring Billing**
```
Stripe webhook: invoice.payment_succeeded
  → Check if subscription_cycle
  → Sync user licenses
  → Update renewal date
  → Send confirmation email
```

### 4. **Payment Failure**
```
Stripe webhook: invoice.payment_failed
  → Increment failure counter
  → After 3 failures:
     - Lock account (accountPaymentStatus = "locked")
     - Disable users
     - Send deactivation email
```

---

## Key Implementation Details

### Proration
- When updating subscription mid-cycle, Stripe automatically calculates prorated charges
- Enabled with `proration_behavior: "create_prorations"`

### Subscription Items
- Each billable item (storage, app, license) is a separate subscription item
- Each has a unique `subItemId` stored in database
- Allows independent management of each item

### Trial Period
- 14-day free trial on initial subscription creation
- During trial: `accountPaymentStatus = "trial"`
- After trial: automatically converts to "active" if payment method exists

### Invoice Management
- Invoices fetched from Stripe API
- Displayed in frontend with download links
- PDFs stored in Stripe, accessed via `invoice_pdf` URL

### License Sync
- On each billing cycle, system syncs user count with license quantity
- Disables excess users if licenses reduced
- Re-enables users if licenses increased

---

## API Endpoints

### Frontend → Backend

```
POST /organization/processPurchase
  Body: { licenses?: number, appIds?: string[] }
  → Updates subscription items

GET /organization/app/paymentPendingApps
  → Returns apps with pending payment

GET /organization/card/list
  → Returns saved payment cards

GET /organization/card/getInvoices
  → Returns Stripe invoices

POST /organization/card/create
  Body: { paymentMethodId, cardNumber, ... }
  → Creates card and initial subscription

POST /organization/cancelSubscription
  → Cancels subscription
```

### Stripe → Backend (Webhooks)

```
POST /stripe/webhook
  → Handles all Stripe events
  → Updates database based on events
```

---

## Security Considerations

1. **Webhook Verification**: All webhooks verified using Stripe signature
2. **Idempotency**: Events tracked to prevent duplicate processing
3. **Payment Method Security**: Card details never stored, only Stripe payment method IDs
4. **Authentication**: All endpoints require authenticated organization user

---

## Error Handling

### Frontend
- Uses React Query for error handling
- Toast notifications for user feedback
- Loading states during payment processing

### Backend
- Try-catch blocks around Stripe API calls
- Specific error handling for:
  - Card declined
  - Insufficient funds
  - Invalid payment method
  - Network errors

---

## Testing Recommendations

1. **Test Stripe Webhooks**: Use Stripe CLI to test webhook events locally
2. **Test Payment Flows**: Use Stripe test cards
3. **Test Proration**: Verify mid-cycle subscription updates
4. **Test Failure Handling**: Simulate payment failures
5. **Test License Sync**: Verify user enable/disable on license changes

---

## Common Issues & Solutions

### Issue: Subscription not updating
- **Check**: Verify `subItemId` is saved correctly
- **Check**: Ensure subscription ID matches in database

### Issue: Webhook not firing
- **Check**: Webhook endpoint is publicly accessible
- **Check**: Webhook secret is correct
- **Check**: Event is registered in Stripe dashboard

### Issue: Payment processing but status not updating
- **Check**: Webhook handler is processing events
- **Check**: Database updates are being saved
- **Check**: Idempotency not blocking legitimate events

---

## Future Enhancements

1. **Credit System**: Implement account credits
2. **Multiple Payment Methods**: Support multiple cards
3. **Billing History**: Enhanced invoice management
4. **Usage-Based Billing**: Track and bill based on usage
5. **Discounts/Coupons**: Support promotional codes

