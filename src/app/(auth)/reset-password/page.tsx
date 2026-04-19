import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = { title: "Reset Password" };

export default function ResetPasswordPage() {
  return <AuthForm mode="reset" />;
}
