"use client";

import { useState } from "react";
import { createCheckoutSession } from "@/lib/api/payment";

interface CheckoutButtonProps {
  userId: string;
  amount: number;
  currency?: string;
  couponCode?: string;
  onSuccess?: () => void;
  className?: string;
  disabled?: boolean;
}

export function CheckoutButton({
  userId,
  amount,
  currency = "usd",
  couponCode,
  onSuccess,
  className = "",
  disabled = false,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!userId || disabled) return;

    setLoading(true);
    setError(null);

    try {
      const response = await createCheckoutSession({
        userId,
        amount,
        currency,
        couponCode,
      });

      // Redirect to Stripe checkout
      if (response.url) {
        window.location.href = response.url;
        onSuccess?.();
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err: any) {
      setError(err.message || "Failed to start checkout. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleCheckout}
        disabled={loading || disabled || !userId}
        className={`flex w-full items-center justify-center gap-2 rounded-md bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200 ${className}`}
      >
        {loading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-black dark:border-t-transparent"></div>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span>
              Pay {currency === "gbp" ? "£" : "$"}{amount.toFixed(2)}
            </span>
          </>
        )}
      </button>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}


