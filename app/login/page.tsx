"use client";

import { authenticate } from "@/app/actions/login";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [state, dispatch] = useFormState(authenticate, { error: null, success: false });

  if (state.success) {
  router.refresh();                // refresh next.js cache
  window.location.href = "/dashboard";  // FULL RELOAD for instant navbar update
}


  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-6 relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,_rgba(255,51,102,0.1),_transparent_50%)]"></div>

      <div className="w-full max-w-md bg-[#111] p-10 rounded-xl border border-white/5 relative z-10 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-white uppercase tracking-wider mb-2">
            Welcome <span className="text-[#ff3366]">Back</span>
          </h1>
          <p className="text-[#999] text-sm uppercase tracking-widest">Access Your Garage</p>
        </div>

        {state.error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 text-sm text-center mb-6">
            {state.error}
          </div>
        )}

        <form action={dispatch} className="space-y-6">
          <div>
            <label className="block text-[11px] text-[#999] uppercase tracking-widest mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              required
              placeholder="JOHN@EXAMPLE.COM"
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#ff3366] transition-colors"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[11px] text-[#999] uppercase tracking-widest">Password</label>

              <Link
                href="/forgot-password"
                className="text-[10px] text-[#666] uppercase tracking-widest hover:text-[#ff3366] transition-colors"
              >
                Forgot?
              </Link>
            </div>

            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#ff3366] transition-colors"
            />
          </div>

          <LoginButton />
        </form>

        <p className="text-center mt-8 text-[#999] text-sm">
          New here?{" "}
          <Link href="/register" className="text-[#ff3366] font-semibold hover:underline">
            Start Membership
          </Link>
        </p>
      </div>
    </main>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-4 bg-[#ff3366] text-white font-bold uppercase tracking-widest text-sm hover:bg-[#ff1149] hover:shadow-[0_10px_30px_rgba(255,51,102,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Accessing..." : "Enter Garage"}
    </button>
  );
}
