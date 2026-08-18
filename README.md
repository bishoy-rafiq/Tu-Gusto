# Tu Gusto

Full-stack bilingual e-commerce platform for premium coffee products — built with Next.js 16, Supabase, and Tailwind CSS v4.

[Live Demo](https://tu-gusto.vercel.app/) · [Admin Panel](https://tu-gusto.vercel.app/admin)

## Highlights

- **Bilingual storefront** — English + Arabic with full RTL support
- **PWA** — installable, offline-ready, service worker, push notifications
- **Admin dashboard** — product/order/inventory management, real-time stats
- **OTP login** — email-based customer authentication (no third-party auth)
- **Spin-to-win wheel** — gamified discount system with instant promo codes
- **Shipping integration** — Bosta API for live delivery tracking
- **Email notifications** — order confirmations + bulk marketing via Nodemailer
- **Mobile-first** — responsive from 360px, safe-area aware, bottom nav

## Tech Stack

`Next.js 16` `React 19` `TypeScript` `Tailwind CSS v4` `Supabase` `PostgreSQL` `Nodemailer` `web-push` `PWA`

## Architecture

```
app/                App Router (storefront + admin + API routes)
components/         Reusable UI (Header, Cart, ProductCard, Wheel, …)
domain/             Entities, repository interfaces
application/        Use cases (products, orders, customers)
infrastructure/     Supabase persistence, auth, notifications, security
dictionaries/       EN/AR translation JSONs
```

## Quick Start

```bash
npm install
cp .env.example .env   # fill Supabase + SMTP keys
npx supabase # run supabase-schema.sql in SQL Editor
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Production server |
