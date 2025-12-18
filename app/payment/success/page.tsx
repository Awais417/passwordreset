"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifySession } from "@/lib/api/payment";
import type { User } from "@/types/user";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setError("No session ID found in URL");
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await verifySession({ sessionId });

        if (response.success && response.user) {
          setUser(response.user);
          setVerified(true);
        } else {
          throw new Error(response.message || "Payment verification failed");
        }
      } catch (err: any) {
        setError(err.message || "Failed to verify payment. Please contact support.");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 font-sans dark:bg-black">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md dark:bg-zinc-900">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-300"></div>
            <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
              Verifying your payment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 font-sans dark:bg-black">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md dark:bg-zinc-900">
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                <svg
                  className="h-6 w-6 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-center text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Payment Verification Failed
            </h1>
            <p className="text-center text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
            <button
              onClick={() => router.push("/payment")}
              className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (verified && user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 font-sans dark:bg-black">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md dark:bg-zinc-900">
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900/30">
                <svg
                  className="h-8 w-8 text-emerald-600 dark:text-emerald-400"
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
              </div>
            </div>
            <div className="text-center">
              <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                Payment Successful!
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Your premium subscription is now active.
              </p>
            </div>

            {user.paymentDate && (
              <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">
                      Payment Date:
                    </span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">
                      {new Date(user.paymentDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">
                      Status:
                    </span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => router.push("/")}
              className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 font-sans dark:bg-black">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-300"></div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}

