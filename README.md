# Tu Gusto — على مزاجك

Premium espresso machines, grinders, and beans, made to your taste.

A fast, bilingual (English / Arabic, RTL) coffee store with a full admin dashboard.

## Features

- **Storefront** — product catalog, search, categories, product pages, cart, and checkout
- **Bilingual** — full English + Arabic (RTL) support with a language switcher
- **Admin dashboard** — manage products, stock, and orders; email notifications on new orders
- **Login** — admin sign-in via Supabase Auth (email + password), password change, rate-limited
- **Lucky wheel** — spin-to-win discount popup with instant-copy codes
- **Images** — product photos uploaded to Supabase Storage
- **PWA-ready** — manifest, icons, service worker, push notifications
- **Mobile-first** — no horizontal overflow from 360px up, safe-area aware

## Tech Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Supabase (Postgres, Auth, Storage) · Nodemailer · web-push

## Getting Started

```bash
npm install
npm run dev
```

1. Create a Supabase project and run [`supabase-schema.sql`](supabase-schema.sql) in the SQL Editor (tables + storage bucket).
2. Copy `.env` values: Supabase URL/key, SMTP for emails, Bosta keys for shipping, VAPID keys for push, and `ADMIN_SESSION_SECRET`.
3. Create the admin user in Supabase → **Authentication → Users → Add user**.
4. Open `http://localhost:3000/admin` and sign in.

## Scripts

| Command             | Description                     |
| ------------------- | ------------------------------- |
| `npm run dev`       | Start the dev server            |
| `npm run build`     | Production build                |
| `npm start`         | Start the production server     |
| `node scripts/migrate-images.mjs` | Move local product images to Supabase Storage |

## Project Structure

```
app/            Routes (storefront + /admin + API)
components/     UI components (Header, Footer, ProductCard, Wheel, …)
infrastructure/ Data, auth, notifications, security
application/    Use cases (products, orders, settings)
dictionaries/   EN/AR translations
public/         Images, videos, icons, service worker
scripts/        Migrations
```
