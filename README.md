# Mamoa Mall

An online shopping mall. Business owners **rent a space** (monthly subscription), open their own store,
upload products and manage orders. Shoppers browse every store, fill one cart and check out once.
The mall owner runs everything from an admin panel.

- **Frontend:** React 19, Vite, Redux Toolkit (RTK Query), Tailwind CSS, React Router
- **Backend:** Node.js, Express 5, MongoDB (Mongoose), JWT auth, Multer image uploads
- **Payments:** a fake card gateway for development (`backend/src/utils/fakePayment.js`)

## Who can do what

| Role | Where | What they can do |
|---|---|---|
| **Shopper** (`user`) | the mall site | Browse stores & products, search, review, cart, checkout, track orders |
| **Store owner** (`vendor`) | `/dashboard/store` | Rent a space, set up the store page (logo, banner, colour), add/edit/hide products with photos, ship orders, pay rent, switch plans |
| **Mall admin** (`admin`) | `/dashboard/admin` | Approve/reject/suspend stores, give free days, manage users & roles, set rental plans and prices, see all orders and rent collected |

Any shopper becomes a store owner by going to **Sell on Mamoa → Get started**.

### How renting works
1. Owner picks a plan (Starter R199 / Business R499 / Premium R999 by default — the admin can change these).
2. Pays the first month (fake card). The store is created as **pending**.
3. The mall admin approves it — it appears in the mall. (Set `AUTO_APPROVE_STORES=true` to skip approval.)
4. Each plan has a product limit. Rent lasts 30 days; owners renew or switch plan from **Subscription**.
5. If rent runs out, the store and its products are hidden from shoppers until it's paid.

### How checkout works
One payment covers the whole cart. The server re-checks every price and stock level, takes the payment,
then saves **one order per store** so each owner only sees and ships their own items. Cancelling an order puts the stock back.

## Run it locally

You need **Node.js 18+** and a MongoDB database (a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster, or MongoDB installed locally).

```bash
# 1. backend
cd backend
cp .env.example .env        # then edit .env: DB_URL and JWT_SECRET_KEY
npm install
npm run seed                # demo plans, stores, products and accounts
npm run start:dev           # http://localhost:3000

# 2. frontend (new terminal)
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

### Demo accounts (created by `npm run seed`)

| Role | Email | Password |
|---|---|---|
| Mall admin | admin@mamoa.co.za | Admin123! (or what you set in `.env`) |
| Store owner (Mamoa Skincare) | thandi@mamoa.co.za | Password123! |
| Store owner (Kasi Couture) | lerato@mamoa.co.za | Password123! |
| Store owner (Gold & Glow) | sipho@mamoa.co.za | Password123! |
| Store owner (pending approval) | kabelo@mamoa.co.za | Password123! |
| Shopper | shopper@mamoa.co.za | Password123! |

`npm run seed:reset` wipes the database and seeds again.

### Test cards (fake gateway — no money moves)
- `4242 4242 4242 4242`, any future expiry, any CVC → approved
- `4000 0000 0000 0002` → declined

## API overview

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register` · `login` · `logout` · `GET /me` · `PATCH /edit-profile` · admin: `GET/PUT/DELETE /users` |
| Plans | `GET /api/plans` · admin: `POST`, `PATCH /:id`, `DELETE /:id` |
| Stores | `GET /api/stores` · `GET /categories` · `GET /:slug` · owner: `POST /` (open store), `GET/PATCH /mine`, `POST /mine/subscription`, `GET /mine/payments`, `GET /mine/stats` |
| Products | `GET /api/products` (filters: `store, category, color, minPrice, maxPrice, q, sort, page, limit`) · `GET /meta/filters` · `GET /:id` · `GET /related/:id` · owner: `GET /mine/list`, `POST /create-product`, `PATCH /update-product/:id`, `DELETE /:id` |
| Reviews | `POST /api/reviews` |
| Orders | `POST /api/orders/checkout` · `GET /mine` · `GET /checkout/:id` · owner: `GET /store`, `PATCH /:id/status` · admin: `GET /` |
| Uploads | `POST /api/uploads/image` (multipart field `image`, max 5 MB) |
| Admin | `GET /api/admin/stats` · `GET /stores` · `PATCH /stores/:id/status` · `POST /stores/:id/extend` · `GET /payments` |

## Going live — checklist
- **Rotate secrets.** An old commit contained `backend/.env`. Change the MongoDB password and `JWT_SECRET_KEY`.
- **Real payments:** replace `backend/src/utils/fakePayment.js` with PayFast, Paystack or Stripe. For rent, use the gateway's recurring billing and a webhook to extend `subscription.currentPeriodEnd`.
- **Paying store owners:** today the mall collects shoppers' money. You'll need payouts to stores (e.g. Paystack subaccounts / Stripe Connect) or a manual settlement process.
- **Images:** uploads are saved to `backend/uploads`, which most hosts wipe on redeploy. Move to Cloudinary or S3.
- Set `NODE_ENV=production`, `CLIENT_URL`, `SERVER_URL`, and `VITE_API_URL` (frontend) to your real domains.
