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

    return {
      success: true,
      triggerUpdate: true,
      error: null,
    };

  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        triggerUpdate: false,
        error: "Invalid email or password.",
      };
    }

    return {
      success: false,
      triggerUpdate: false,
      error: "Something went wrong.",
    };
  }
}