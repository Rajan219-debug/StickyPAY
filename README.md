# 🛒 StickyPAY — Scan, Pay & Go

> A full-stack self-checkout web app that lets customers scan product barcodes, manage their cart, and pay instantly — no cashier needed.

---

## 🚀 Features

- 📷 **Barcode/QR Scanning** — Scan products directly from your phone camera
- 🛒 **Cart Management** — Add, update, and remove items in real-time
- 💳 **UPI Payments** — Seamless checkout with payment confirmation
- 🏪 **Store Detection** — Auto-detect store from QR code scan
- 📜 **Order History** — View past purchases and receipts
- 👤 **User Profiles** — Phone-based login, no password required

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS, Framer Motion |
| Backend | Node.js, Express.js |
| Database | Supabase (PostgreSQL) |
| Auth | Phone-based (custom JWT) |
| QR/Barcode | html5-qrcode, qrcode.react |
| Deployment | Vercel (Frontend), Render (Backend) |

---

## 📁 Project Structure

```
StickyPAY/
├── StickyPAY-Frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # App pages (Login, Scanner, Cart, etc.)
│   │   └── lib/                 # Supabase client, utilities
│   └── package.json
│
├── StickyPAY-Backend/           # Node.js + Express backend
│   ├── routes/                  # API route handlers
│   ├── config/                  # Supabase config
│   └── server.js                # Entry point
│
└── README.md
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- A [Supabase](https://supabase.com) project

### 1. Clone the repo
```bash
git clone https://github.com/Rajan219-debug/StickyPAY.git
cd StickyPAY
```

### 2. Setup Backend
```bash
cd StickyPAY-Backend
npm install
```

Create a `.env` file:
```env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Start the server:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd StickyPAY-Frontend
npm install
```

Create a `.env` file:
```env
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Start the frontend:
```bash
npm run dev
```

### 4. Setup Database
Run the SQL schema in your **Supabase SQL Editor**:
- Tables: `profiles`, `stores`, `products`, `store_products`, `cart`, `orders`, `order_items`, `payments`, `payment_items`

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/profiles/login` | Login or register user |
| GET | `/api/products/:barcode` | Get product by barcode |
| GET | `/api/stores/:storeName` | Get store by QR name |
| GET | `/api/cart/:user_id` | Get user's cart |
| POST | `/api/cart` | Add/update cart item |
| POST | `/api/orders/checkout` | Place an order |
| POST | `/api/payments/confirm` | Confirm payment |
| GET | `/api/orders/:user_id` | Get order history |

---

## 🔒 Security

- `.env` files are **gitignored** — credentials are never committed
- Supabase Row Level Security (RLS) can be enabled for production
- Service role key is backend-only; anon key is used on frontend

---

## 📄 License

MIT © [Rajan Kumar](https://github.com/Rajan219-debug)
