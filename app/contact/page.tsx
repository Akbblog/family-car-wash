// Contact Us Page - matching your dashboard theme (dark, neon accent, upscale UI)
// This will integrate perfectly with your existing design system.
// Tech used: React Server Component (Next.js 14+), TailwindCSS, matching component patterns.

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] p-6 md:p-12">
      <div className="max-w-[900px] mx-auto">
        {/* Header */}
        <div className="mb-12 pb-6 border-b border-white/10">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
            Contact <span className="text-[#ff3366]">Support</span>
          </h1>
            </div>

        {/* Contact Info Cards */}
        {/* <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#111] border border-white/5 p-6 rounded-xl">
            <h3 className="text-white uppercase tracking-widest font-bold mb-2">Email</h3>
            <p className="text-[#999] text-sm">support@familycarwash.com.au</p>
          </div>

          <div className="bg-[#111] border border-white/5 p-6 rounded-xl">
            <h3 className="text-white uppercase tracking-widest font-bold mb-2">Phone</h3>
            <p className="text-[#999] text-sm">(555) 123-4567</p>
          </div>

          <div className="bg-[#111] border border-white/5 p-6 rounded-xl">
            <h3 className="text-white uppercase tracking-widest font-bold mb-2">Hours</h3>
            <p className="text-[#999] text-sm">Mon - Fri / 8am - 6pm</p>
          </div>
        </div> */}

        {/* Contact Form */}
        <div className="bg-[#111] border border-white/5 p-6 rounded-xl">
          <h3 className="text-white uppercase tracking-widest font-bold mb-6">Send Us a Message</h3>

          <form className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-[11px] text-[#999] uppercase tracking-widest mb-2">Your Name</label>
              <input 
                type="text"
                required
                className="w-full bg-black border border-white/10 px-4 py-3 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#ff3366] transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] text-[#999] uppercase tracking-widest mb-2">Email Address</label>
              <input 
                type="email"
                required
                className="w-full bg-black border border-white/10 px-4 py-3 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#ff3366] transition-colors"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-[11px] text-[#999] uppercase tracking-widest mb-2">Message</label>
              <textarea
                rows={5}
                required
                className="w-full bg-black border border-white/10 px-4 py-3 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#ff3366] transition-colors"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-[#ff3366] hover:text-white transition-all rounded-md"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Footer Note */}
        {/* <p className="text-center text-[#555] text-xs mt-12">
          We usually respond within 24 hours.
        </p> */}
      </div>
    </main>
  );
}
