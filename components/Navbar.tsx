'use client';

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";



// --- We are adding the icons directly as components ---
const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
// ---------------------------------------------------


export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav id="navbar" className="fixed w-full z-[1000] px-5 py-5 md:px-12 bg-black/95 backdrop-blur-md border-b border-white/10 transition-all duration-300">
      
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        
        {/* Logo Area */}
        <Link href="/" className="flex items-center no-underline transition-transform duration-300 hover:scale-105">
          <svg
            id="Layer_2"
            data-name="Layer 2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20.75 22.17"
            className="w-10 h-10 mr-2.5 fill-current text-[#ff3366]"
          >
            <path d="M10.79,12.77C9.47,11.44,9.23,9.66,8.64,8a9.47,9.47,0,0,1-2.23,4.86c-1.3,1.33-3.06,1.67-4.78,2.26,4.13.51,6.38,2.85,7,7,.59-4.14,2.88-6.4,6.92-6.93C13.91,14.43,12.12,14.13,10.79,12.77Z" transform="translate(-1.63 -0.91)" />
            <path d="M17.81,10.21c.56-2.49,1.83-4.16,4.56-4.47A5.29,5.29,0,0,1,17.8,1.13a5,5,0,0,1-4.53,4.6A5,5,0,0,1,17.81,10.21Z" transform="translate(-1.63 -0.91)" />
            <path d="M19,16.35a4,4,0,0,1-3.46,3.38c2.15.17,2.94,1.61,3.52,3.36a3.77,3.77,0,0,1,3.32-3.41A3.86,3.86,0,0,1,19,16.35Z" transform="translate(-1.63 -0.91)" />
            <path d="M6.17,6.22a4.14,4.14,0,0,1,.88-1.78,10.87,10.87,0,0,1,1.75-1A3,3,0,0,1,6.12.91,3,3,0,0,1,3.54,3.45,3.35,3.35,0,0,1,6.17,6.22Z" transform="translate(-1.63 -0.91)" />
          </svg>

          <span className="text-3xl font-black tracking-tighter bg-gradient-to-br from-white to-[#ff3366] bg-clip-text text-transparent">
            FAMILY CAR WASH
          </span>
        </Link>

        {/* --- MOBILE MENU BUTTON --- */}
        <button
          className="md:hidden text-white hover:text-[#ff3366] transition-all"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {/* --- We now use the SVG components --- */}
          {menuOpen ? <XIcon /> : <MenuIcon />}
        </button>

        {/* Desktop Navigation Links */}
        <ul className="hidden md:flex items-center gap-8 list-none">
          <li><Link href="/" className="text-white/70 text-[13px] tracking-[2px] uppercase hover:text-white transition-all">Home</Link></li>
          <li><Link href="/#services" className="text-white/70 text-[13px] tracking-[2px] uppercase hover:text-white transition-all">Services</Link></li>

          {session ? (
            <li>
              <Link href="/dashboard" className="bg-[#ff3366] text-white px-6 py-2.5 rounded-full font-semibold text-[13px] tracking-[1px] uppercase hover:bg-[#ff1149] transition-all shadow-lg shadow-[#ff3366]/20">
                Your Garage
              </Link>
            </li>
          ) : (
            <li>
              <Link href="/login" className="text-white/70 text-[13px] tracking-[2px] uppercase hover:text-white transition-all mr-4">
                Log In
              </Link>
              <Link href="/register" className="bg-[#ff3366] text-white px-6 py-2.5 rounded-full font-semibold text-[13px] tracking-[1px] uppercase hover:bg-[#ff1149] transition-all shadow-lg shadow-[#ff3366]/20">
                Join Now
              </Link>
            </li>
          )}
        </ul>
      </div>

      {/* --- MOBILE MENU DROPDOWN --- */}
      {menuOpen && (
        <div className="md:hidden mt-4 bg-black/95 border-t border-white/10 backdrop-blur-md">
          <ul className="flex flex-col items-center gap-4 py-5">
            <li><Link href="/" onClick={() => setMenuOpen(false)} className="text-white/80 uppercase text-sm hover:text-[#ff3366]">Home</Link></li>
            <li><Link href="/#services" onClick={() => setMenuOpen(false)} className="text-white/80 uppercase text-sm hover:text-[#ff3366]">Services</Link></li>

            {session ? (
              <li>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="bg-[#ff3366] text-white px-5 py-2 rounded-full font-semibold text-sm uppercase hover:bg-[#ff1149] transition-all">
                  Your Garage
                </Link>
              </li>
            ) : (
              <>
                <li>
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="text-white/80 uppercase text-sm hover:text-[#ff3366]">Log In</Link>
                </li>
                <li>
                  <Link href="/register" onClick={() => setMenuOpen(false)} className="bg-[#ff3366] text-white px-5 py-2 rounded-full font-semibold text-sm uppercase hover:bg-[#ff1149] transition-all">
                    Join Now
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}