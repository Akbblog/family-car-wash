"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 py-12 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="flex items-center mb-4">
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-br from-white to-[#ff3366] bg-clip-text text-transparent">
              FAMILY WASH
            </span>
          </Link>
          <p className="text-[#999] text-sm leading-relaxed max-w-sm">
            Redefining premium car care with doorstep convenience.
            Bi-weekly washes, interior detailing, and hassle-free subscriptions.
          </p>
        </div>

        <div>
          <h4 className="text-white uppercase tracking-widest font-bold mb-4 text-xs">Menu</h4>
          <ul className="space-y-2">
            <li><Link href="/" className="text-[#999] text-sm hover:text-[#ff3366] transition-colors">Home</Link></li>
            <li><Link href="/#services" className="text-[#999] text-sm hover:text-[#ff3366] transition-colors">Services</Link></li>
            <li><Link href="/dashboard" className="text-[#999] text-sm hover:text-[#ff3366] transition-colors">My Garage</Link></li>
            <li><Link href="/contact" className="text-[#999] text-sm hover:text-[#ff3366] transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          
          <ul className="space-y-2">
            
          </ul>
        </div>
      </div>

      <div className="text-center pt-8 border-t border-white/5">
        <p className="text-[#666] text-xs uppercase tracking-widest">
          © {new Date().getFullYear()} Family Car Wash. All rights reserved.
        </p>
      </div>
    </footer>
  );
}