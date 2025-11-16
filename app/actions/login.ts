"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function authenticate(prevState: any, formData: FormData) {
  try {
    await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirect: false,
      });

      return { success: true, triggerUpdate: true };

  
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "Invalid email or password." };
    }

    return { success: false, error: "Something went wrong. Please try again." };
  }
}
