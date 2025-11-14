import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"; // <-- 1. Import Footer
import AuthProvider from "@/components/AuthProvider";
import AppSessionProvider from './SessionProvider';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Family Car Wash | Premium Doorstep Service",
  description: "We wash, you relax. Bi-weekly car care subscription.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased bg-[#0a0a0a] text-white`}>
        <AppSessionProvider>        
        <Navbar />
        {/* 2. Wrap children in a min-height container */}
        <div className="pt-[80px] min-h-[calc(100vh-1px)] flex flex-col justify-between">
            <div>
                {children}
              
            </div>
            <Footer /> {/* <-- 3. Add Footer here */}
          
        </div>
      </AppSessionProvider>
      </body>
    </html>
  );
}