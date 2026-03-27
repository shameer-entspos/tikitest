# How presigned attachments work (Tiki frontend)

## Is everything ready?

**Backend:** Yes. The presigned URL endpoint is ready.

**Frontend:** Partially.

- **Project Files (Files section)** – Ready. View and Download already use presigned URLs.
- **Other screens** (chats, submissions with photos, etc.) – Still use the raw S3 URL. They keep working only while the bucket is **public**. After you make the bucket **private**, those screens will break unless you switch them to presigned URLs too.

---

## How it works (flow)

1. Your app stores attachment URLs in the DB (e.g. `https://tiki-image.s3.../userId/file.png`). Those are S3 keys in URL form.
2. When the user wants to **view** or **download** a file, the frontend must **not** use that stored URL directly. Instead it:
   - Calls the backend: `GET /v1/user/file/presigned-url?key=<that-url-or-just-the-key>` (with auth).
   - Backend returns `{ url: "https://...?X-Amz-...", expiresIn: 60 }`.
   - Frontend uses that `url` for `<img src>`, `<a href>`, or download. After ~60 seconds the URL expires.
3. Backend and S3 are configured so the bucket is **private**. The only way to access a file is with a fresh presigned URL from your API.

So: **stored URL = identifier**. **Presigned URL = temporary link used for display/download.**

---

## What you need to do

### 1. Make the S3 bucket private (when you’re ready)

- In AWS Console: S3 → your bucket → **Permissions**.
- Turn **Block public access** on.
- Remove any bucket policy that allows public `GetObject`.

Until you do this, old direct S3 links still work. After you do it, only presigned URLs work.

### 2. Use the app (Project Files)

- Go to **Projects** → a project → **Files**.
- Upload a file, then click **View** (image) or **Download**.
- The frontend will call the presigned API and then show/download using the temporary URL. No extra steps.

### 3. (Optional) Use presigned URLs in other screens

Anywhere you currently use a stored attachment URL (e.g. `media.url`, `file.location`) for:

- `<img src={...}>`
- `<video><source src={...}>`
- `<a href={...} download>`

you should switch to:

1. Get a presigned URL when the user views or downloads:
   ```ts
   import { getPresignedFileUrl } from '@/app/(main)/(user-panel)/user/file/api';
   // when you need to show/download (e.g. on click or when opening a modal):
   const url = await getPresignedFileUrl(axiosAuth, storedUrlOrKey);
   if (url) setImageUrl(url);  // or link.href = url; link.click();
   ```
2. Use that `url` only for display/download. Don’t store it in DB; it expires in ~60 seconds.

Example places that still use raw URLs and would need this pattern after the bucket is private:

- **Chats:** `MessageCard` – `message.media?.url` for img/video/download.
- **JSA / Safety Hub / other apps** – any component that sets `src` or `href` from an attachment URL from the API.

---

## Quick test (before making the bucket private)

1. Backend running, frontend running, user logged in.
2. Open a project → Files → upload a file.
3. Click **View** or **Download** on that file.
4. It should open/download. In network tab you should see a request to `user/file/presigned-url?key=...` and then a request to S3 with query params (the presigned URL).

If that works, the flow is correct. Making the bucket private only removes access via old direct links; presigned URLs still work.
