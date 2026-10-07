# abStore — E-commerce Platform

Full-stack online store for mobile devices and accessories, with a public storefront (catalog, cart, wishlist, checkout) and an **admin dashboard** for products, orders, contacts, and analytics. Built for the Algerian market (wilaya-based delivery context) with **Arabic/French/English** UI support.

**Deployment:** React SPA on Netlify, API on Render (`abstore-y9p6.onrender.com` — see `netlify.toml` for CSP and `/api` proxy)

## Features

### Storefront
- Product catalog with categories, filters, and product detail pages
- Cart, wishlist, and order placement flow
- Customer feedback and contact forms
- Responsive UI with Tailwind CSS and Framer Motion

### Admin
- JWT-secured admin area
- Product CRUD with image upload (Cloudinary)
- Order management and status tracking
- Stats dashboard (Recharts) and export helpers (Excel/PDF utilities on frontend)

### Backend
- Spring Boot REST API, JPA, PostgreSQL
- JWT authentication, rate limiting, hardened production config
- Actuator health endpoint for deployment checks

## Tech stack

| Layer | Technologies |
|-------|----------------|
| Frontend | React 19, Vite, React Router, Tailwind |
| Backend | Java 17, Spring Boot 4, Spring Security, JWT |
| Data | PostgreSQL |
| Media | Cloudinary |
| Hosting | Netlify (SPA) + Render (API) |

## Repository layout

```
abStore/
├── ab-store-front/     # React SPA
├── ab-store-back/      # Spring Boot API
├── netlify.toml        # CSP, redirects, API proxy
└── Dockerfile          # Container build for backend
```

## Local development

### Backend

```bash
cd ab-store-back
./mvnw spring-boot:run
```

Configure `application.properties` (or env vars) for database, JWT secret, Cloudinary, and CORS.

### Frontend

```bash
cd ab-store-front
npm install
npm run dev
```

Set `VITE_API_URL` to your local API (e.g. `http://localhost:8080/api`).

## Production configuration

- Backend: use `application-prod.properties` with secrets from environment (`JWT_SECRET`, `DATABASE_URL`, `CLOUDINARY_*`, `CORS_ALLOWED_ORIGINS`).
- Frontend: `VITE_API_URL` points to the deployed API; Netlify proxies `/api/*` to Render when configured in `netlify.toml`.

## Author

**Kennouche Abderrahmane**

## License

Private / portfolio project — see repository for usage terms.
