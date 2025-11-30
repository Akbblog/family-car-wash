"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn, useSession } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const { update } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Call next-auth signIn client-side so cookies are set in the browser
      const res: any = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      // signIn returns an object with error/ok/url in v4/v5
      if (!res || (res as any).error) {
        setLoading(false);
        console.error("Login error response:", (res as any)?.error);
        setError("Invalid email or password.");
        return;
      }

      // Keep loading state active during navigation
      // Refresh session and navigate to dashboard
      await update();
      router.push("/dashboard");
    } catch (err) {
      setLoading(false);
      console.error("Login exception:", err);
      setError("Invalid email or password.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-6 pt-24 relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,_rgba(255,51,102,0.1),_transparent_50%)]"></div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-[#0a0a0a]/95 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            {/* Spinner */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-[#ff3366] rounded-full animate-spin"></div>
            </div>
            {/* Loading Text */}
            <p className="text-white font-bold uppercase tracking-widest text-sm animate-pulse">
              Accessing Dashboard...
            </p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-[#111] p-10 rounded-xl border border-white/5 relative z-10 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-white uppercase tracking-wider mb-2">
            Welcome <span className="text-[#ff3366]">Back</span>
          </h1>
          <p className="text-[#999] text-sm uppercase tracking-widest">
            Access Your Garage
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 text-sm text-center mb-6">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="block text-[11px] text-[#999] uppercase tracking-widest mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="JOHN@EXAMPLE.COM"
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#ff3366] transition-colors"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[11px] text-[#999] uppercase tracking-widest">
                Password
              </label>

              <Link
                href="/forgot-password"
                className="text-[10px] text-[#666] uppercase tracking-widest hover:text-[#ff3366] transition-colors"
              >
                Forgot?
              </Link>
            </div>

            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#ff3366] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#ff3366] text-white font-bold uppercase tracking-widest text-sm hover:bg-[#ff1149] hover:shadow-[0_10px_30px_rgba(255,51,102,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Accessing..." : "Enter Garage"}
          </button>
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
