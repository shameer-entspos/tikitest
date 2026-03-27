// pages/api/create-payment-method.js
import Stripe from 'stripe';
import type { NextApiRequest, NextApiResponse } from 'next';
const stripe = new Stripe(process.env.STP_KEY || '');

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  const {
    cardNumber,
    expiryMonth,
    expiryYear,
    cvc,
    firstName,
    lastName,
    email,
    addressLineOne,
    addressLineTwo,
    city,
    state,
    postalCode,
    country,
  } = req.body;
  console.log(req.body);
  try {
    // Create PaymentMethod with raw card data
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: cardNumber || '4242424242424242',
        exp_month: parseInt(expiryMonth) || 12,
        exp_year: parseInt(expiryYear) || 2026,
        cvc: cvc || '123',
      },
      billing_details: {
        name: `${firstName} ${lastName}`,
        email,
        address: {
          line1: addressLineOne || '',
          line2: addressLineTwo || '',
          city: city || '',
          state: state || '',
          postal_code: postalCode || '',
          country: country || 'US',
        },
      },
    });
    console.log(paymentMethod);
    return res.status(200).json({ paymentMethod });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
}
