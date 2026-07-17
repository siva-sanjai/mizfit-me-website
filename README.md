# InkTee - Custom Printed T-Shirt Ecommerce

A full-stack custom T-shirt ecommerce website built with React, TypeScript, Tailwind CSS, Supabase, and Vercel Serverless Functions.

Customers can select T-shirts, upload their own designs, customize placement, and place orders. Admin manages orders through a secure dashboard.

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, React Router v7
- **Backend:** Node.js Vercel Serverless Functions
- **Database:** Supabase PostgreSQL
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage (private bucket)
- **Email:** Nodemailer + SMTP (Gmail App Password)
- **Deployment:** Vercel (single project)

## Project Structure

```
custom-tshirt-store/
├── api/                     # Vercel Serverless Functions
│   ├── _lib/
│   │   └── supabase-admin.ts
│   ├── create-order.ts
│   ├── send-order-email.ts
│   ├── get-orders.ts
│   ├── update-order.ts
│   └── delete-design.ts
├── src/                     # React Frontend
│   ├── components/          # Header, Footer
│   ├── pages/               # All page components
│   │   └── admin/           # Admin pages
│   ├── layouts/             # MainLayout, AdminLayout
│   ├── hooks/               # useCart
│   ├── services/            # Supabase, API, Products
│   ├── utils/               # Cart, Helpers
│   └── types/               # TypeScript types
├── supabase/
│   └── schema.sql           # Database schema
├── public/                  # Static assets
├── vercel.json              # Vercel deployment config
├── .env.example             # Environment variables template
└── package.json
```

## Local Installation

### Prerequisites

- Node.js 20+
- npm
- Supabase account (free tier works)
- Gmail account with App Password

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **anon public key** (Settings → API)
3. Note your **service_role key** (Settings → API → service_role key)

### Step 3: Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Open `supabase/schema.sql` from this project
3. Copy the entire contents and paste into SQL Editor
4. Click **Run** to create all tables, indexes, and security policies

### Step 4: Create Storage Bucket

1. In Supabase dashboard, go to **Storage**
2. Create a new bucket named `customer-designs`
3. Set it as **Private** (not public)
4. Go to **Storage → Policies** and add a policy to allow authenticated uploads:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload designs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'customer-designs');
```

### Step 5: Create Admin User

In Supabase dashboard, go to **Authentication → Users → Add User** and create an admin account.

After creating the user, go to **SQL Editor** and run:

```sql
-- Set admin role (replace with your admin's email)
UPDATE auth.users SET raw_app_meta_data = 
  jsonb_set(COALESCE(raw_app_meta_data, '{}'), '{role}', '"admin"')
WHERE email = 'admin@example.com';
```

### Step 6: Set Up Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in the values:

```env
# Frontend - Supabase (publishable keys)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key

# Backend - Supabase (secret - never expose to browser)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
ADMIN_EMAIL=admin@example.com

# Design file retention period in days
DESIGN_RETENTION_DAYS=7
```

### Step 7: Set Up Gmail App Password

1. Go to your Google Account → Security → 2-Step Verification (must be enabled)
2. Go to App Passwords (search in Google Account settings)
3. Select "Mail" and "Windows Computer" or choose "Other" and name it "InkTee"
4. Copy the 16-character password
5. Use this as `SMTP_PASSWORD` in your `.env.local` file

### Step 8: Run Locally

```bash
npm run dev
```

The app will start at `http://localhost:3000`.

### Step 9: Add Sample Products

Use Supabase SQL Editor to add sample products:

```sql
INSERT INTO products (name, description, base_price, images, available_colors, available_sizes, fit_type, material)
VALUES 
  ('Classic Cotton Tee', 'Premium 100% cotton regular fit T-shirt', 399, ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab'], ARRAY['White', 'Black', 'Navy', 'Gray'], ARRAY['S','M','L','XL','XXL'], 'regular', '100% Cotton'),
  ('Oversized Street Tee', 'Trendy oversized fit for street style', 499, ARRAY['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a'], ARRAY['Black', 'White', 'Olive'], ARRAY['S','M','L','XL','XXL'], 'oversized', '100% Cotton'),
  ('Premium Heavyweight Tee', 'Thick 240 GSM heavyweight fabric', 599, ARRAY['https://images.unsplash.com/photo-1576566588028-4147f3842f27'], ARRAY['White', 'Black', 'Army Green'], ARRAY['M','L','XL','XXL'], 'regular', '100% Cotton');
```

## GitHub Setup

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/custom-tshirt-store.git
git push -u origin main
```

## Vercel Deployment

### Method 1: Deploy from GitHub

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and click **Add New → Project**
3. Import your GitHub repository
4. Vercel will auto-detect Vite and the API folder

### Method 2: Deploy with Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

### Environment Variables in Vercel

After importing your project in Vercel, add all the environment variables from `.env.example`:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon key |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service_role key |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | Your Gmail address |
| `SMTP_PASSWORD` | Your Gmail App Password |
| `ADMIN_EMAIL` | Email to receive order notifications |
| `DESIGN_RETENTION_DAYS` | `7` |

**Important:** In Vercel, go to Project Settings → Build & Development and ensure:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### Custom Domain

1. In Vercel dashboard, go to your project → **Settings → Domains**
2. Enter your custom domain
3. Follow Vercel's DNS configuration instructions

## Features

### Customer Features

- Browse T-shirt products with filters
- Customize T-shirts with uploaded designs
- Drag, resize, and reposition designs on T-shirt preview
- Shopping cart management
- Secure checkout (COD / UPI)
- Order tracking with status timeline
- Responsive design (mobile, tablet, desktop)

### Admin Features

- Secure admin login with Supabase Auth
- Dashboard with order statistics
- Order management with search and filters
- Order status updates (Pending → Confirmed → Printing → Packed → Shipped → Delivered)
- Design file preview and download
- Email notifications for new orders

### Security

- Supabase Row Level Security (RLS)
- Admin-only order management APIs
- Service role key never exposed to browser
- File type and size validation
- Input sanitization
- Private storage bucket for designs

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/create-order` | Create new order | Public |
| POST | `/api/send-order-email` | Send order email | Internal |
| GET | `/api/get-orders` | List orders | Admin |
| PATCH | `/api/update-order` | Update order status | Admin |
| DELETE | `/api/delete-design` | Clean up old designs | Admin |

## Email Notifications

When a customer places an order:
1. Design files are uploaded to Supabase Storage
2. Order is saved in the database
3. Admin receives an email with:
   - Complete order details
   - Customer information
   - All design files attached with clear filenames
4. If email fails, the order is still saved with `email_sent = false`

## Design File Retention

Old design files can be cleaned up by calling the `DELETE /api/delete-design` endpoint (configurable via `DESIGN_RETENTION_DAYS`, default 7 days). This can be set up as a cron job in Vercel:

```json
// vercel.json (add this)
{
  "crons": [{
    "path": "/api/delete-design",
    "schedule": "0 0 * * *"
  }]
}
```

## License

MIT
