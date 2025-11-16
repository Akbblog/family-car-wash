import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthProvider from "./SessionProvider"; // ← USE ONLY THIS

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Family Car Wash | Premium Doorstep Service",
  description: "We wash, you relax. Bi-weekly car care subscription.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased bg-[#0a0a0a] text-white`}>
        
        {/* ONE global session provider */}
        <AuthProvider>
          <Navbar />

          <div className="pt-[80px] min-h-[calc(100vh-1px)] flex flex-col justify-between">
            <div>{children}</div>
            <Footer />
          </div>
        </AuthProvider>

      </body>
    </html>
  );
}
