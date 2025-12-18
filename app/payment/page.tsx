"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckoutButton } from "@/components/payment/CheckoutButton";
import { PaymentStatus } from "@/components/payment/PaymentStatus";
import { getPaymentStatus } from "@/lib/api/payment";
import type { User } from "@/types/user";

// Default pricing - you can make this configurable
const DEFAULT_AMOUNT = 20;
const DEFAULT_CURRENCY = "gbp";

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get userId from URL params
  useEffect(() => {
    const userIdParam = searchParams.get("userId") || searchParams.get("id");
    if (userIdParam) {
      setUserId(userIdParam);
    } else {
      setError("User ID is required. Please provide userId in the URL parameters.");
    }
  }, [searchParams]);

  const handleStatusChange = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleCheckoutSuccess = () => {
    // Status will be updated via webhook, but we can refresh it
    if (userId) {
      setTimeout(() => {
        getPaymentStatus(userId)
          .then((response) => setUser(response.user))
          .catch(() => {});
      }, 2000);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 font-sans dark:bg-black">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Upgrade to Premium
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Unlock all premium features with a one-time payment
          </p>
        </div>

        {/* Error message if userId is missing */}
        {error && !userId && (
          <div className="rounded-xl bg-red-50 p-6 shadow-md dark:bg-red-900/20">
            <p className="text-sm font-medium text-red-700 dark:text-red-400">
              {error}
            </p>
            <p className="mt-2 text-xs text-red-600 dark:text-red-500">
              Please access this page with a valid userId parameter: /payment?userId=YOUR_USER_ID
            </p>
          </div>
        )}

        {/* Payment Status */}
        {userId && (
          <div className="rounded-xl bg-white p-6 shadow-md dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Current Status
            </h2>
            <PaymentStatus userId={userId} onStatusChange={handleStatusChange} />
          </div>
        )}

        {/* Payment Card */}
        <div className="rounded-xl bg-white p-8 shadow-md dark:bg-zinc-900">
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
              <span className="text-zinc-600 dark:text-zinc-400">
                Premium Plan
              </span>
              <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                £{DEFAULT_AMOUNT}
              </span>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                What&apos;s included:
              </h3>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Full access to all premium features</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Priority support</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>One-time payment, lifetime access</span>
                </li>
              </ul>
            </div>
          </div>

          {user?.paymentStatus ? (
            <div className="rounded-lg bg-emerald-50 p-4 text-center dark:bg-emerald-900/20">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                ✓ You already have an active premium subscription
              </p>
            </div>
          ) : (
            <CheckoutButton
              userId={userId}
              amount={DEFAULT_AMOUNT}
              currency={DEFAULT_CURRENCY}
              onSuccess={handleCheckoutSuccess}
              disabled={!userId}
            />
          )}
        </div>

        {/* Security Note */}
        <div className="rounded-xl bg-zinc-100 p-4 text-center text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
          <p>
            🔒 Secure payment powered by Stripe. Your payment information is
            never stored on our servers.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 font-sans dark:bg-black">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-300"></div>
        </div>
      }
    >
      <PaymentPageContent />
    </Suspense>
  );
}

