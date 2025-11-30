// app/contact/page.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ContactPage() {
  /* ---------------- State ---------------- */
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "success" | "error" | "invalid"
  >("idle");
  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    email?: string;
    message?: string;
  }>({});

  /* ---------- client‑side validation ---------- */
  const validate = (data: {
    name: string;
    phone: string;
    email: string;
    message: string;
  }) => {
    const errs: typeof errors = {};

    if (!data.name.trim()) errs.name = "Name required";
    if (!/^[\d\s()+-]{7,15}$/.test(data.phone))
      errs.phone = "Valid phone number required";
    if (!data.email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(data.email))
      errs.email = "Valid e‑mail required";
    if (!data.message.trim()) errs.message = "Message required";

    return errs;
  };

  /* ---------- submit handler ---------- */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setStatus("idle");

    /* ---- grab form data safely ---- */
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      message: formData.get("message") as string,
    };

    /* ---- validation ---- */
    const validationErrors = validate(data);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      setStatus("invalid");
      setLoading(false);
      return;
    }

    /* ---- API call ---- */
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] p-6 md:p-12 pt-32 md:pt-36">
      <div className="max-w-[900px] mx-auto">
        {/* HEADER */}
        <div className="flex flex-wrap justify-between items-end mb-12 pb-6 border-b border-white/10">
          <div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
              Contact <span className="text-[#ff3366]">Support</span>
            </h1>
            <p className="text-[#999] uppercase tracking-widest text-sm">
              We're here to help — reach out anytime
            </p>
          </div>
        </div>

        {/* CONTACT FORM */}
        <motion.div
          className="bg-[#111] border border-white/5 p-8 rounded-2xl shadow-xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h3 className="text-white uppercase tracking-widest font-bold mb-6">
            Send Us a Message
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NAME */}
            <div className={cn("relative", errors.name && "animate-shake")}>
              <label htmlFor="name" className="block text-[11px] text-[#999] uppercase tracking-widest mb-2">
                
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Full Name"
                className={cn(
                  "w-full bg-black border border-white/10 px-4 py-3 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#ff3366] focus:ring-2 focus:ring-accent transition-colors",
                  errors.name && "border-red-500"
                )}
              />
              {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
            </div>

            {/* PHONE */}
            <div className={cn("relative", errors.phone && "animate-shake")}>
              <label htmlFor="phone" className="block text-[11px] text-[#999] uppercase tracking-widest mb-2">
                
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="Phone Number"
                className={cn(
                  "w-full bg-black border border-white/10 px-4 py-3 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#ff3366] focus:ring-2 focus:ring-accent transition-colors",
                  errors.phone && "border-red-500"
                )}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone}</p>}
            </div>

            {/* EMAIL */}
            <div className={cn("relative", errors.email && "animate-shake")}>
              <label htmlFor="email" className="block text-[11px] text-[#999] uppercase tracking-widest mb-2">
                
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Email Address"
                className={cn(
                  "w-full bg-black border border-white/10 px-4 py-3 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#ff3366] focus:ring-2 focus:ring-accent transition-colors",
                  errors.email && "border-red-500"
                )}
              />
              {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
            </div>

            {/* MESSAGE */}
            <div className={cn("relative", errors.message && "animate-shake")}>
              <label htmlFor="message" className="block text-[11px] text-[#999] uppercase tracking-widest mb-2">
                
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                placeholder="Your Message"
                className={cn(
                  "w-full bg-black border border-white/10 px-4 py-3 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#ff3366] focus:ring-2 focus:ring-accent transition-colors",
                  errors.message && "border-red-500"
                )}
              />
              {errors.message && <p className="mt-1 text-sm text-red-400">{errors.message}</p>}
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full py-3 rounded-md font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2",
                loading
                  ? "bg-[#444] text-white/50 cursor-not-allowed"
                  : "bg-white text-black hover:bg-[#ff3366] hover:text-white"
              )}
            >
              {loading ? (
                <>
                  <svg className="animate-spin-slow w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Sending…
                </>
              ) : (
                "Send Message"
              )}
            </button>
          </form>

          {/* STATUS MESSAGES */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={
              status === "success"
                ? { opacity: 1 }
                : status === "error" || status === "invalid"
                  ? { opacity: 1 }
                  : { opacity: 0 }
            }
            transition={{ duration: 0.3 }}
          >
            {status === "success" && (
              <p className="text-green-400 text-sm mt-4 animate-fadeIn">
                ✓ Your message has been sent. We'll get back to you shortly.
              </p>
            )}
            {status === "error" && (
              <p className="text-red-400 text-sm mt-4 animate-fadeIn">
                ⚠ Something went wrong. Please try again later.
              </p>
            )}
            {status === "invalid" && (
              <p className="text-red-400 text-sm mt-4 animate-fadeIn">
                ⚠ Please fix the highlighted errors above.
              </p>
            )}
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}