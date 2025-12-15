import { ResetPasswordForm } from "./ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 font-sans dark:bg-black">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-md dark:bg-zinc-900">
        <h1 className="mb-4 text-center text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Reset Password
        </h1>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
