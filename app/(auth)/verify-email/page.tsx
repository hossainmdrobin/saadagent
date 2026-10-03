import { VerifyOtpForm } from "@/components/auth/verify-otp-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { maskEmail } from "@/lib/format";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  const emailMasked =
    typeof email === "string" && email.includes("@")
      ? maskEmail(email.trim().toLowerCase())
      : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify your email</CardTitle>
        <CardDescription>
          Enter the 6-digit code we emailed you. It can only be used once.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <VerifyOtpForm emailMasked={emailMasked} />
      </CardContent>
    </Card>
  );
}
