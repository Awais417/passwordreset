 "use client";

import { FormEvent, useEffect, useState } from "react";

export function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Read token & email from the URL on the client to ensure
  // they are always available, even in static deployments.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const emailFromUrl = params.get("email") || "";
    const tokenFromUrl = params.get("token") || "";
    setEmail(emailFromUrl);
    setToken(tokenFromUrl);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !token) {
      setError("Invalid or missing reset link. Please request a new one.");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("https://serverapis.vercel.app/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          token,
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          (data && (data.message || data.error)) ||
          "Failed to reset password. Please try again.";
        throw new Error(message);
      }

      setSuccess("Your password has been reset successfully. You can now log in.");
      setPassword("");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <p className="mb-4 text-center text-sm text-zinc-500 dark:text-zinc-400 break-all">
        {email
          ? `Resetting password for: ${decodeURIComponent(email)}`
          : "Missing email in reset link."}
      </p>

      {(!email || !token) && (
        <p className="mb-4 text-sm text-red-600">
          Invalid reset link. Please make sure you opened the full link from your email.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
          >
            New Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            placeholder="Enter your new password"
            disabled={loading || !email || !token}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="text-sm text-emerald-600" role="status">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !email || !token}
          className="flex w-full items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </>
  );
}


