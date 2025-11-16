"use client";

import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import { authenticate } from "@/app/actions/login";

export default function LoginForm() {
  const router = useRouter();

  const [state, action] = useFormState(authenticate, {
    success: false,
    error: null,
  });

  // Redirect after login
  if (state.success) {
    router.push("/dashboard");
  }

  return (
    <form action={action}>
      {/* inputs here */}
    </form>
  );
}
