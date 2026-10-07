# WILD ADVENTURES — E-Commerce v1.0

A modern, responsive, and luxury-oriented e-commerce web application specializing in artisanal handcrafted leather goods, with primary initial focus on the **"Hand Bag"** category.

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Zustand**, Next.js **Route Middleware** authentication, and a decoupled **Repository Pattern** data architecture.

---

## Architecture & Technology Stack

- **Framework:** Next.js (App Router, latest stable)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (custom luxury palette, neutral stone & warm gold tones)
- **Icons:** Lucide React
- **Client State:** Zustand with localStorage persistence (Cart drawer, quantity controls)
- **Data Persistence:** Decoupled Repository Pattern (`IDataStore`) with local file-backed store (`.data/store.json`) ready for single-line drop-in migration to PostgreSQL / Supabase / Prisma.
- **Security & Route Protection:** Next.js Route Middleware (`middleware.ts`) enforcing encrypted, HTTP-only cookie-based sessions for all `/admin/*` routes.
- **Server Actions & APIs:** Full Next.js server actions and RESTful API route handlers (`/api/products`, `/api/categories`, `/api/stats`, `/api/admin/login`, `/api/admin/logout`).

---

## Directory Structure

```text
src/
├── app/
│   ├── (storefront)/        # Customer-facing shopping experience (STEALTH: No admin links)
│   │   ├── page.tsx         # Home: Hero, value pillars, handbag spotlight, interactive catalog
│   │   ├── categories/      # Category browsing & listing pages
│   │   │   └── [slug]/page.tsx
│   │   ├── products/        # Product detail page (PDP) with sticky mobile buy bar
│   │   │   └── [slug]/page.tsx
│   │   └── layout.tsx       # Storefront navigation, cart drawer, footer
│   ├── (admin)/             # Admin Dashboard route group
│   │   ├── admin/
│   │   │   ├── login/       # Dedicated authentication portal (/admin/login)
│   │   │   │   └── page.tsx
│   │   │   ├── (dashboard)/ # Protected dashboard routes
│   │   │   │   ├── dashboard/   # Overview stats (total products, active categories, low stock)
│   │   │   │   ├── products/    # Product table, search, category filter, Add/Edit/Delete modals
│   │   │   │   ├── categories/  # Category taxonomy manager
│   │   │   │   └── layout.tsx   # AdminShell with mobile drawer & logout
│   │   │   └── page.tsx     # Redirect to /admin/dashboard
│   ├── api/                 # REST endpoints (products, categories, stats, admin auth)
│   ├── actions.ts           # Next.js Server Actions with path revalidation & auth
│   ├── globals.css          # Design tokens, luxury scrollbars, styling, no-scrollbar
│   └── layout.tsx           # Root HTML layout and metadata
├── components/
│   ├── storefront/          # ProductCard, CategoryPills, FilterSidebar, HeroSection, CartDrawer, Navbar, Footer
│   ├── admin/               # AdminShell, AdminSidebar, ProductTableManager, CategoryTableManager, Modals
│   └── ui/                  # Reusable Button, Input, Badge, Modal components
├── lib/
│   ├── auth.ts              # Web Crypto HMAC-SHA256 session token generation and verification
│   ├── db/                  # Data access layer (IDataStore repository & JSON store)
│   │   ├── index.ts         # Repository singleton
│   │   └── seed.ts          # Pre-seeded categories and 13+ realistic products
│   ├── types/               # TypeScript models (Product, Category, Cart, Filters, Stats)
│   └── utils/               # Formatters (currency, slugify, classNames)
├── store/
│   └── useCartStore.ts      # Zustand shopping bag with localStorage persistence
├── middleware.ts            # Route protection for all /admin routes
└── public/
    └── images/products/handbags/ # High-resolution product images
```

---

## Authentication & Admin Security

- **Stealth Storefront:** No links or buttons to `/admin` exist anywhere in the public customer storefront navigation, header, or footer.
- **Route Protection:** All routes under `/admin/*` (except `/admin/login`) are protected at the server edge by `src/middleware.ts`.
- **Session Cookies:** Upon successful password verification, an encrypted `admin_session` cookie is issued (`httpOnly`, `sameSite: 'lax'`, `path: '/'`, 24-hour expiration).
- **Default Credentials:**
  - **Username:** `admin` (or defined in `ADMIN_USERNAME`)
  - **Password:** `admin123` (or defined in `ADMIN_PASSWORD`)
  - **Config File:** `.env.local`

---

## Mobile Responsiveness Features

- **Storefront Navigation:**
  - Hamburger menu with smooth slide-out drawer on screens `< 1024px`.
  - Integrated mobile search form, category links with generous touch targets (min 44x44px).
  - Background scroll lock when menu is active.
- **Responsive Grids:**
  - 1-column on phones (`320px–480px`), 2-columns on tablets (`sm`), 3-columns on laptops (`lg`), 4-columns on desktop (`xl`).
  - Category chips scroll horizontally with `.no-scrollbar` and touch pan support.
- **Product Detail Page (PDP):**
  - Image gallery stacks above product details on viewports `< lg`.
  - Sticky mobile bottom bar (`lg:hidden`) displaying product summary and touch-friendly "Add to Bag" button for effortless purchasing during scrolling.
- **Admin Mobile Workspace:**
  - Collapsible sidebar drawer toggled via mobile topbar hamburger icon.
  - Product management automatically renders adaptive mobile cards on phones and wide tables on desktops.
  - Modals and forms fit full width on mobile devices with smooth scroll containers.

---

## Getting Started

### 1. Run Development Server
```bash
npm run dev
```
- Storefront: [http://localhost:3000](http://localhost:3000)
- Admin Login: [http://localhost:3000/admin/login](http://localhost:3000/admin/login) (Credentials: `admin` / `admin123`)

### 2. Production Build
```bash
npm run build
npm start
```
