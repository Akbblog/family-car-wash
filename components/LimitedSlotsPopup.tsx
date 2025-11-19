"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function LimitedSlotsPopup({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem("limitedPopupShown");

    if (!alreadyShown) {
      setVisible(true);
      sessionStorage.setItem("limitedPopupShown", "true");
    }
  }, []);

  const CTA_HREF = isLoggedIn ? "/dashboard" : "/register";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* POPUP CARD */}
          <motion.div
            className="relative bg-[#111] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
            initial={{ scale: 0.85, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 120, damping: 12 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE BUTTON */}
            <button
              className="absolute top-4 right-4 text-white/40 hover:text-white transition text-xl"
              onClick={() => setVisible(false)}
            >
              ×
            </button>

            {/* TITLE */}
            <h2 className="text-3xl font-black text-white mb-4 leading-tight">
              Only <span className="text-[#ff3366]">60 Membership Slots</span>
            </h2>

            {/* SUBTEXT */}
            <p className="text-[#999] text-sm leading-relaxed mb-8">
              Our premium bi-weekly detailing service is limited to{" "}
              <span className="font-semibold text-white">60 exclusive members</span>.
              Slots fill fast — secure your place before the route closes.
            </p>

            {/* CTA BUTTON */}
            <Link
              href={CTA_HREF}
              onClick={() => setVisible(false)}
              className="block w-full py-4 bg-[#ff3366] text-white font-bold uppercase tracking-[2px] text-sm rounded-md hover:shadow-[0_10px_30px_rgba(255,51,102,0.4)] hover:-translate-y-1 transition-all"
            >
              Secure Your Spot
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
