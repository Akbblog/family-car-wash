import Link from "next/link";
import { auth } from "@/auth";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import HeroCarousel from "@/components/HeroCarousel";
import LimitedSlotsPopup from "@/components/LimitedSlotsPopup";



export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth(); 
  const buttonHref = session ? "/dashboard" : "/register";
  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen">

        

      {/* --- HERO SECTION --- */}
      <section id="home" className="relative min-h-screen overflow-hidden bg-black flex items-center py-20 lg:py-0">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 opacity-20 animate-spin-slow" style={{
            background: 'conic-gradient(from 180deg at 50% 50%, #ff3366 0deg, #000 60deg, #ff3366 120deg, #000 180deg, #ff3366 240deg, #000 300deg, #ff3366 360deg)',
            filter: 'blur(100px)',
        }}></div>
        <LimitedSlotsPopup enabled={true} />

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 grid lg:grid-cols-2 items-center gap-12 lg:gap-0 h-full">
            <div className="flex flex-col justify-center pt-10 lg:pt-0">
                <Reveal>
                    <div className="inline-block px-5 py-2 bg-[#ff3366]/10 border border-[#ff3366] text-[#ff3366] text-[11px] uppercase tracking-[3px] mb-8 rounded-full">
                        Doorstep Service 2025
                    </div>
                </Reveal>
                <Reveal delay={0.1}>
                    <h1 className="text-[clamp(40px,7vw,90px)] font-black leading-[1.1] mb-6">
                        <span className="block">Redefine</span>
                        <span className="block">Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff3366] to-[#ff6690] italic pr-2">Drive.</span></span>
                    </h1>
                </Reveal>
                <Reveal delay={0.2}>
                    <p className="text-lg text-[#999] mb-10 max-w-lg leading-relaxed">
                        Discover the ultimate convenience where premium car care meets your driveway.
                        You relax. We wash. Always drive a clean car again.
                    </p>
                </Reveal>

            <Reveal delay={0.3}>
                <div className="flex gap-12 mb-12">
                    <div>
                        <span className="block text-5xl font-black text-[#ff3366] mb-1">2x</span>
                        <span className="text-sm uppercase tracking-[2px] text-[#999]">Visits Per Month</span>
                    </div>
                    <div>
                        <span className="block text-5xl font-black text-[#ff3366] mb-1">100%</span>
                        <span className="text-sm uppercase tracking-[2px] text-[#999]">Hassle Free</span>
                    </div>
                </div>
            </Reveal>

                <Reveal delay={0.4}>
                    <div className="flex flex-wrap gap-5">
                        <Link href={buttonHref} className="px-8 md:px-10 py-4 bg-[#ff3366] text-white uppercase tracking-[2px] font-bold text-[13px] rounded-sm hover:translate-y-[-2px] hover:shadow-[0_20px_40px_rgba(255,51,102,0.3)] transition-all">
                            Start Membership
                        </Link>
                        <Link href="#services" className="px-8 md:px-10 py-4 bg-transparent text-white border border-white/30 uppercase tracking-[2px] font-bold text-[13px] rounded-sm backdrop-blur-md hover:bg-white/10 hover:border-white transition-all">
                            View Services
                        </Link>
                    </div>
                </Reveal>
            </div>

            {/* Hero Image Section */}
            <div className="hidden lg:flex h-full items-center justify-center relative p-8 animate-fadeIn delay-600">
                <HeroCarousel />
            </div>
</div>
      </section>

      {/* --- SERVICES SECTION --- */}
      <section id="services" className="py-32 px-6 md:px-12 max-w-[1400px] mx-auto">
          {/* ... (Section Header is unchanged) ... */}
           <Reveal>
              <div className="text-center mb-20">
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-5">Premium Services</h2>
                  <div className="w-20 h-1 bg-[#ff3366] mx-auto mb-6"></div>
                  <p className="text-[#999] text-lg uppercase tracking-[3px]">Included in your subscription</p>
              </div>
          </Reveal>

          {/* --- 3. Grid of Services Updated --- */}
          {/* --- IMPORTANT ---
          Add 3 images to `public/images/`:
          1. service-exterior.jpg
          2. service-interior.jpg
          3. service-wheels.jpg
          */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
              {/* Service Card 1 */}
              <Reveal delay={0.1} className="h-full">
                  <div className="group bg-[#111] border border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-2 hover:border-[#ff3366]/50 transition-all duration-500 h-full flex flex-col">
                      <div className="h-[250px] bg-[#1a1a1a] flex items-center justify-center relative overflow-hidden">
                          <Image src="/images/ExteriorWash.jpg" alt="Exterior Wash" fill className="object-cover opacity-30 group-hover:opacity-50 transition-opacity" />
                          <div className="absolute inset-0 bg-gradient-to-br from-[#ff3366]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </div>
                      <div className="p-8 flex flex-col flex-grow">
                          <span className="inline-block self-start px-3 py-1 bg-[#ff3366]/10 text-[#ff3366] text-[10px] font-bold uppercase tracking-wider mb-4 rounded-full">Bi-Weekly</span>
                          <h3 className="text-2xl font-bold mb-3">Exterior Wash</h3>
                          <p className="text-[#999] text-sm leading-relaxed">Meticulous hand wash, premium soap, spot-free rinse, and microfiber hand dry for a swirl-free shine.</p>
                      </div>
                  </div>
              </Reveal>

              {/* Service Card 2 */}
              <Reveal delay={0.2} className="h-full">
                  <div className="group bg-[#111] border border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-2 hover:border-[#ff3366]/50 transition-all duration-500 h-full flex flex-col">
                      <div className="h-[250px] bg-[#1a1a1a] flex items-center justify-center relative overflow-hidden">
                           <Image src="/images/InteriorDetailing.jpg" alt="Interior Detail" fill className="object-cover opacity-30 group-hover:opacity-50 transition-opacity" />
                           <div className="absolute inset-0 bg-gradient-to-br from-[#ff3366]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </div>
                      <div className="p-8 flex flex-col flex-grow">
                           <span className="inline-block self-start px-3 py-1 bg-[#ff3366] text-white text-[10px] font-bold uppercase tracking-wider mb-4 rounded-full">Most Popular</span>
                          <h3 className="text-2xl font-bold mb-3">Interior Detail</h3>
                          <p className="text-[#999] text-sm leading-relaxed">Thorough vacuuming of carpets and seats, wipe down of all surfaces, dash, and console. Interior windows cleaned.</p>
                      </div>
                  </div>
              </Reveal>

              {/* Service Card 3 */}
              <Reveal delay={0.3} className="h-full">
                   <div className="group bg-[#111] border border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-2 hover:border-[#ff3366]/50 transition-all duration-500 h-full flex flex-col">
                      <div className="h-[250px] bg-[#1a1a1a] flex items-center justify-center relative overflow-hidden">
                          <Image src="/images/WheelCleaning.jpg" alt="Wheels & Tires" fill className="object-cover opacity-30 group-hover:opacity-50 transition-opacity" />
                          <div className="absolute inset-0 bg-gradient-to-br from-[#ff3366]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </div>
                      <div className="p-8 flex flex-col flex-grow">
                           <span className="inline-block self-start px-3 py-1 bg-[#ff3366]/10 text-[#ff3366] text-[10px] font-bold uppercase tracking-wider mb-4 rounded-full">Deep Clean</span>
                          <h3 className="text-2xl font-bold mb-3">Wheels & Tires</h3>
                          <p className="text-[#999] text-sm leading-relaxed">Brake dust removal, wheel face cleaning, and premium tire shine application for a showroom finish.</p>
                      </div>
                  </div>
              </Reveal>

              {/* ... (Pricing Card is unchanged) ... */}
              <Reveal delay={0.4} className="h-full">
                   <div className="group bg-gradient-to-br from-[#ff3366] to-[#b30038] rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(255,51,102,0.4)] transition-all duration-500 flex flex-col items-center justify-center text-center p-8 h-full relative bg-noise">
                      <h3 className="text-xl font-black uppercase tracking-[4px] mb-6 relative z-10">Family Plan</h3>
                      <div className="text-7xl font-black mb-2 relative z-10">$249<span className="text-2xl font-bold">/mo</span></div>
                      <div className="w-12 h-1 bg-white/50 mb-6 relative z-10"></div>
                      <p className="text-white/90 font-medium mb-8 relative z-10">+ $50 per extra vehicle</p>
                      <Link href={buttonHref} className="px-10 py-4 bg-white text-[#ff3366] font-bold uppercase tracking-[2px] text-sm rounded-full hover:scale-105 transition-all shadow-xl relative z-10">
                          Subscribe Now
                      </Link>
                  </div>
              </Reveal>
          </div>
      </section>

    </div>
  );
}