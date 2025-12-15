import { ResetPasswordForm } from "./ResetPasswordForm";

// Ensure this page is rendered dynamically so searchParams (token, email)
// are available per-request, not at build time.
export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: {
    token?: string;
    email?: string;
    [key: string]: string | string[] | undefined;
  };
};

export default function ResetPasswordPage({ searchParams }: PageProps) {
  const rawToken = searchParams.token;
  const rawEmail = searchParams.email;

  const token = Array.isArray(rawToken) ? rawToken[0] : rawToken || "";
  const email = Array.isArray(rawEmail) ? rawEmail[0] : rawEmail || "";

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 font-sans dark:bg-black">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-md dark:bg-zinc-900">
        <h1 className="mb-2 text-center text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Reset Password
        </h1>
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

        <ResetPasswordForm email={email} token={token} />
      </div>
    </div>
  );
}

