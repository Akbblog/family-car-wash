
# Family Car Wash – Premium Door‑step Service

A small, full‑stack Next.js 13 + App Router portfolio site that demonstrates:
- Server‑rendered pages (Navbar, Footer, layout)
- Email‑contact form (client + `/api/contact` handler)
- Simple user login (`next‑auth` with MongoDB & Credentials provider)
- Dark‑theme UI crafted with Tailwind CSS  
- Framer Motion entrance animations
- TypeScript throughout the stack

> Deployed on Vercel (Turbopack) – fully compatible with any Node 14+ environment.

---

## Table of Contents
1. [Tech Stack](#tech-stack)
2. [Getting Started](#getting-started)
3. [License](#license)

---

## Tech Stack

| Layer          | Library / Tool |
|----------------|----------------|
| Framework      | Next.js 13 (App Router) |
| Styling        | Tailwind CSS 3 |
| Animations     | Framer Motion |
| Authentication | `next-auth` (MongoDB adapter) |
| Email          | Nodemailer (Hostinger SMTP) |
| TypeScript     | Strict mode |
| Linting        | ESLint + Prettier |
| Build          | Vercel (Turbopack) |

---

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/<YOUR-USERNAME>/family-car-wash.git
cd family-car-wash

# 2. Install dependencies
npm install            # or yarn, pnpm

# 3. Create a .env.local file (see next section)

# 4. Run locally
npm run dev            # http://localhost:3000

License
MIT © 2025 Family Car Wash
