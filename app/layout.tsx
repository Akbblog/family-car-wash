import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
// We only need this ONE provider
import AppSessionProvider from './SessionProvider'; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Family Car Wash | Premium Doorstep Service",
  description: "We wash, you relax. Bi-weekly car care subscription.",
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased bg-[#0a0a0a] text-white`}>
        {/* We only wrap with the ONE, correct provider */}
        <AppSessionProvider>
          <Navbar />
          <div className="pt-[80px] min-h-[calc(100vh-1px)] flex flex-col justify-between">
            <div>
              {children}
            </div>
            <Footer />
          </div>
        </AppSessionProvider>
      </body>
    </html>
  );
}