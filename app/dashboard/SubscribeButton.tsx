"use client";

import { useState } from "react";

export default function SubscribeButton() {
  const [loading, setLoading] = useState(false);

  // Read waitlist status from environment
  const WAITLIST_ENABLED =
    process.env.NEXT_PUBLIC_WAITLIST_ENABLED === "true";

  const handleSubscribe = async () => {
    if (WAITLIST_ENABLED) return; // just in case

    try {
      setLoading(true);

      const response = await fetch("/api/checkout", {
        method: "POST",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Subscription error:", error);
      alert("Failed to start checkout. Please check console.");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // WAITLIST MODE UI
  // ----------------------------
  if (WAITLIST_ENABLED) {
    return (
      <button
        disabled
        className="w-full py-4 bg-gray-600 text-white font-bold uppercase tracking-widest text-sm rounded opacity-60 cursor-not-allowed"
      >
        FULLY BOOKED
      </button>
    );
  }

  // ----------------------------
  // NORMAL MODE
  // ----------------------------
  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className="w-full py-4 bg-[#ff3366] text-white font-bold uppercase tracking-widest text-sm hover:bg-[#ff1149] hover:shadow-[0_10px_30px_rgba(255,51,102,0.3)] transition-all disabled:opacity-50"
    >
      {loading ? "INITIALIZING..." : "ACTIVATE PLAN ($249/mo)"}
    </button>
  );
}
