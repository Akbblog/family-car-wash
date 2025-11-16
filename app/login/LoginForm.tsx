"use client";

import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import { authenticate } from "@/app/actions/login";

export default function LoginForm() {
  const router = useRouter();
  const [state, action] = useFormState(authenticate, {});

  if (state.success) {
    router.push("/dashboard"); 
  }

  return (
    <form action={action} className="space-y-6">
      <input
        type="email"
        name="email"
        className="w-full p-3 rounded bg-[#111] border border-white/10"
        placeholder="Email"
        required
      />

      <input
        type="password"
        name="password"
        className="w-full p-3 rounded bg-[#111] border border-white/10"
        placeholder="Password"
        required
      />

      {state.error && (
        <p className="text-red-500 text-sm">{state.error}</p>
      )}

      <button
        type="submit"
        className="w-full py-3 bg-[#ff3366] rounded font-bold uppercase tracking-wider"
      >
        Log In
      </button>
    </form>
  );
}
