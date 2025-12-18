"use client";

import { useEffect, useState } from "react";
import type { User } from "@/types/user";
import { getPaymentStatus } from "@/lib/api/payment";

interface PaymentStatusProps {
  userId: string;
  onStatusChange?: (user: User) => void;
}

export function PaymentStatus({ userId, onStatusChange }: PaymentStatusProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getPaymentStatus(userId);
        setUser(response.user);
        onStatusChange?.(response.user);
      } catch (err: any) {
        setError(err.message || "Failed to load payment status");
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [userId, onStatusChange]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-300"></div>
        <span>Loading payment status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
          user.paymentStatus
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${
            user.paymentStatus ? "bg-emerald-500" : "bg-zinc-400"
          }`}
        ></span>
        {user.paymentStatus ? "Premium Active" : "Free Plan"}
      </div>

      {user.paymentStatus && user.paymentDate && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Paid on: {new Date(user.paymentDate).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}


