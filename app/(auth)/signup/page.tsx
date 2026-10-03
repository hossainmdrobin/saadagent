import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth/signup-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { peekAuthenticatedUser } from "@/lib/auth/session";

export default async function SignupPage() {
  const user = await peekAuthenticatedUser();

  if (user?.isEmailVerified) {
    redirect("/dashboard");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Sign up with your email and password, then confirm the code we send you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm />
      </CardContent>
    </Card>
  );
}
