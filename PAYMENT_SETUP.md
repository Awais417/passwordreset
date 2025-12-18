# Payment Flow Setup Guide

This document explains the payment integration setup for the application.

## Overview

The payment flow integrates with your backend API to handle Stripe payments. Users can upgrade to premium, and their payment status is tracked in the database.

## File Structure

```
├── types/
│   └── user.ts                    # User type definitions
├── lib/
│   └── api/
│       └── payment.ts             # API client functions
├── components/
│   └── payment/
│       ├── PaymentStatus.tsx      # Display payment status
│       └── CheckoutButton.tsx     # Payment button component
└── app/
    └── payment/
        ├── page.tsx               # Main payment page
        └── success/
            └── page.tsx           # Payment success page
```

## Environment Variables

Create a `.env.local` file in the root directory with:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://serverapis.vercel.app

# Frontend URL (for redirects)
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000

# Optional: Stripe Publishable Key (if needed for frontend)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Note:** The secret keys (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) should only be in your backend `.env` file, never in the frontend.

## API Endpoints Used

The frontend calls these backend endpoints:

1. **POST** `/payment/create-checkout-session`
   - Creates a Stripe checkout session
   - Body: `{ userId, amount, currency }`
   - Returns: `{ sessionId, url }`

2. **GET** `/payment/status/:userId`
   - Gets user payment status
   - Returns: `{ message, user }`

3. **POST** `/payment/verify-session`
   - Verifies payment after redirect
   - Body: `{ sessionId }`
   - Returns: `{ success, message, user? }`

## Usage

### 1. Payment Page

Visit `/payment` to see the payment page where users can:
- View their current payment status
- See pricing and features
- Click to start checkout

### 2. Payment Status Component

Use the `PaymentStatus` component anywhere to display user payment status:

```tsx
import { PaymentStatus } from "@/components/payment/PaymentStatus";

<PaymentStatus 
  userId="user123" 
  onStatusChange={(user) => console.log(user)} 
/>
```

### 3. Checkout Button

Use the `CheckoutButton` component to trigger payments:

```tsx
import { CheckoutButton } from "@/components/payment/CheckoutButton";

<CheckoutButton
  userId="user123"
  amount={29.99}
  currency="usd"
  onSuccess={() => console.log("Redirecting...")}
/>
```

### 4. Payment Success Page

After payment, Stripe redirects to `/payment/success?session_id=...`

The success page automatically:
- Verifies the payment session
- Updates the UI with payment confirmation
- Shows payment details

## User Authentication Integration

**Important:** The current implementation uses `localStorage` for `userId` as a demo. In production, you should:

1. Get `userId` from your authentication system (e.g., NextAuth, Auth0, custom JWT)
2. Remove the userId input field from the payment page
3. Pass `userId` from your auth context/session

Example with auth context:

```tsx
// In your auth context/provider
const { user } = useAuth();

// In PaymentPage
<CheckoutButton userId={user.id} amount={29.99} />
```

## Payment Flow

1. User visits `/payment`
2. User clicks "Pay $29.99"
3. Frontend calls `/payment/create-checkout-session`
4. User is redirected to Stripe checkout
5. User completes payment on Stripe
6. Stripe redirects to `/payment/success?session_id=...`
7. Frontend calls `/payment/verify-session` to confirm
8. Backend webhook also updates `paymentStatus = true` automatically
9. User sees success confirmation

## Checking Payment Status

To check if a user has premium access:

```tsx
import { getPaymentStatus } from "@/lib/api/payment";

const response = await getPaymentStatus(userId);
if (response.user.paymentStatus) {
  // User has premium access
  showPremiumContent();
} else {
  // User is on free plan
  showUpgradePrompt();
}
```

## Styling

All components use Tailwind CSS with dark mode support. The styling matches your existing design system (zinc colors, rounded corners, etc.).

## Testing

1. Set up your backend with Stripe webhook
2. Add test user ID to localStorage (or integrate with auth)
3. Visit `/payment`
4. Click checkout button
5. Use Stripe test card: `4242 4242 4242 4242`
6. Complete payment
7. Verify redirect to success page
8. Check that payment status updates

## Troubleshooting

### "Failed to create checkout session"
- Check that `NEXT_PUBLIC_API_URL` is correct
- Verify backend is running and accessible
- Check browser console for detailed error

### "No session ID found"
- Ensure Stripe redirect URL includes `?session_id=...`
- Check your Stripe dashboard webhook configuration

### Payment status not updating
- Verify webhook is set up in Stripe dashboard
- Check backend webhook handler logs
- Manually call `/payment/status/:userId` to verify

## Next Steps

1. Integrate with your authentication system
2. Add loading states and error boundaries
3. Customize pricing/features display
4. Add analytics tracking
5. Set up email notifications (backend)
6. Add payment history page (optional)

