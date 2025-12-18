"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckoutButton } from "@/components/payment/CheckoutButton";
import { PaymentStatus } from "@/components/payment/PaymentStatus";
import { getPaymentStatus, validateCoupon } from "@/lib/api/payment";
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
  const [couponCode, setCouponCode] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

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

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setValidatingCoupon(true);
    setCouponError(null);

    try {
      const response = await validateCoupon({ code: couponCode.trim() });
      
      if (response.success && response.coupon) {
        setAppliedCoupon({
          code: response.coupon.code,
          discount: response.coupon.discount,
        });
        setCouponError(null);
      } else {
        setAppliedCoupon(null);
        setCouponError(response.error?.message || response.message || "Invalid coupon code");
      }
    } catch (err: any) {
      setAppliedCoupon(null);
      setCouponError(err.message || "Failed to validate coupon code");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
    setCouponError(null);
  };

  // Calculate final amount with discount
  const calculateFinalAmount = () => {
    if (appliedCoupon) {
      const discountAmount = (DEFAULT_AMOUNT * appliedCoupon.discount) / 100;
      return DEFAULT_AMOUNT - discountAmount;
    }
    return DEFAULT_AMOUNT;
  };

  const finalAmount = calculateFinalAmount();
  const discountAmount = appliedCoupon ? DEFAULT_AMOUNT - finalAmount : 0;

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
            <div className="space-y-2 border-b border-zinc-200 pb-4 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">
                  Premium Plan
                </span>
                <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  £{DEFAULT_AMOUNT}
                </span>
              </div>
              {appliedCoupon && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Discount ({appliedCoupon.code}): -{appliedCoupon.discount}%
                    </span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      -£{discountAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-zinc-200 pt-2 dark:border-zinc-700">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                      Total
                    </span>
                    <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                      £{finalAmount.toFixed(2)}
                    </span>
                  </div>
                </>
              )}
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

          {/* Coupon Code Section */}
          {!user?.paymentStatus && (
            <div className="space-y-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                Have a coupon code?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  disabled={!!appliedCoupon || validatingCoupon}
                  className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:bg-zinc-100 disabled:text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:disabled:bg-zinc-800"
                />
                {appliedCoupon ? (
                  <button
                    onClick={handleRemoveCoupon}
                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={handleApplyCoupon}
                    disabled={validatingCoupon || !couponCode.trim()}
                    className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
                  >
                    {validatingCoupon ? "..." : "Apply"}
                  </button>
                )}
              </div>
              {couponError && (
                <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                  {couponError}
                </p>
              )}
              {appliedCoupon && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  ✓ Coupon applied! You save {appliedCoupon.discount}%
                </p>
              )}
            </div>
          )}

          {user?.paymentStatus ? (
            <div className="rounded-lg bg-emerald-50 p-4 text-center dark:bg-emerald-900/20">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                ✓ You already have an active premium subscription
              </p>
            </div>
          ) : (
            <CheckoutButton
              userId={userId}
              amount={finalAmount}
              currency={DEFAULT_CURRENCY}
              couponCode={appliedCoupon?.code}
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

