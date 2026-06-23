# AB Store - Project Documentation

## 1. Project Architecture & Stack

**Frontend**:
- Vite + React + React Router
- Communicates with the backend through an API proxy (`vite.config.js` proxies `/api` to `http://localhost:8081`).
- All API calls are abstracted in `src/services/api.js`.

**Backend**:
- Java 17 + Spring Boot 3+
- Spring Data JPA + PostgreSQL for data persistence.
- Layered Architecture: Controllers -> Services -> Repositories -> Entities.
- Stateless JWT Authentication (Admin only).

---

## 2. Image Management (Cloudinary Integration)

Because an e-commerce platform generates a large amount of visual data, the system is integrated with **Cloudinary**.
Whenever an admin creates or updates a product, the images (`frontImage` and `backImage`) are uploaded directly to your Cloudinary storage bucket, and Cloudinary returns a secure URL.

This ensures:
1. High-speed image delivery (Cloudinary CDN).
2. Your backend database and server do not get bloated with binary file storage.

The **home page hero video** is also hosted on Cloudinary at:
`https://res.cloudinary.com/doyhwx0l8/video/upload/v1782125847/abstore/hero_video.mp4`

This means **all media assets** (product images, category images, and the hero video) are served from the Cloudinary CDN — nothing is stored locally on the server.

> **IMPORTANT**: To activate this, you must edit `application.properties` in the backend and replace `your_cloud_name`, `your_api_key`, and `your_api_secret` with your actual Cloudinary credentials.

---

## 3. Searching, Filtering & Pagination (Backend-Driven)

It is crucial to understand that **search and filtering logic happens entirely on the Backend, not the Frontend**. 

When a user searches for a product or applies a filter (e.g., Min Price, Brand, Category), the frontend simply passes these parameters in the URL query string:
`GET /api/products?search=shoes&minPrice=50&categoryId=2&page=0&size=10`

The backend leverages **JPA Specifications** (`ProductSpecification.java`) to dynamically build an optimized SQL query against PostgreSQL. 
This means:
- The frontend never downloads the entire product catalog (which would crash the browser for a large database).
- Database handles the heavy lifting, ensuring high performance even with hundreds of thousands of products.

---

## 4. API Endpoints Reference

### Authentication (Admin)
- **`POST /api/auth/login`**: Accepts `{username, password}`. Returns a JWT token.
- **`PUT /api/auth/password`**: Admin-only backend endpoint. Changes the authenticated admin password.
- **`POST /api/auth/forgot-password`**: Backend-only manual reset endpoint. It does not require login, but it requires the private `X-Admin-Reset-Key` header matching the server `ADMIN_RESET_KEY` environment variable. Do not expose this in the frontend.

Manual password reset example:
```bash
curl -X POST http://localhost:8081/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -H "X-Admin-Reset-Key: your-private-reset-key" \
  -d '{"username":"admin","newPassword":"new-password"}'
```

### Categories
- **`GET /api/categories`**: Public. Returns all categories.
- **`GET /api/categories/{id}`**: Public. Returns category by ID.
- **`POST /api/categories`**: Admin. Creates a new category.
- **`PUT /api/categories/{id}`**: Admin. Updates a category.
- **`DELETE /api/categories/{id}`**: Admin. Deletes a category.

### Products
- **`GET /api/products`**: Public. Searches products. Accepts query params: `search`, `categoryId`, `minPrice`, `maxPrice`, `brand`, `productStatus`, `isNew`, `isPromotion`, `page`, `size`.
- **`GET /api/products/{id}`**: Public. Returns a product by ID.
- **`POST /api/products`**: Admin. Creates a product. Requires `multipart/form-data` with `product` (JSON blob), `frontImage` (file), and `backImage` (file).
- **`PUT /api/products/{id}`**: Admin. Updates a product.
- **`DELETE /api/products/{id}`**: Admin. Deletes a product.

### Orders
- **`POST /api/orders`**: Public (Guest Checkout). Creates a new order. Deducts stock quantities securely.
- **`GET /api/orders`**: Admin. Returns all orders.
- **`GET /api/orders/{id}`**: Admin. Returns order by ID.
- **`PUT /api/orders/{id}/status`**: Admin. Updates order status (e.g., PENDING -> SHIPPED).

### Feedbacks (Reviews)
- **`POST /api/feedback`**: Public. Submits a product review. Automatically recalculates the product's average rating.
- **`GET /api/feedback/product/{id}`**: Public. Returns visible feedbacks for a product.
- **`GET /api/feedback/all`**: Admin. Returns all feedbacks.
- **`PUT /api/feedback/{id}/visibility`**: Admin. Toggles whether a feedback is visible to the public.

### Contact (Inquiries)
- **`POST /api/contact`**: Public. Submits a contact form message.
- **`GET /api/contact`**: Admin. Returns all messages.
- **`PUT /api/contact/{id}/read`**: Admin. Marks a message as read.
