# Project Guidelines - Mongolian Tourism Booking System

## 📌 Goals
- Build a production-ready Node.js backend for booking yurts, multi-day countryside travels, and managing products for tourists.

## ✅ Stack
- Language: TypeScript
- Framework: Express.js
- ORM: Prisma
- Database: MySQL
- Auth: JWT-based
- Validation: Joi
- Docs: OpenAPI (Swagger)
- Tests: Jest or equivalent
- Deployment: Docker + docker-compose

## 🔒 Security
- Use bcrypt with at least 12 salt rounds.
- Secure API with Helmet.
- Rate-limit auth endpoints to prevent brute force attacks.
- Validate all inputs with Joi before reaching controllers.

## 🌍 API Design
- Graphql (queries and mutations)
- Include pagination, sorting, filtering

## 🏕 Yurt Booking Rules
- Prevent double-booking on overlapping dates.
- Allow cancellation with status updates.
- Calculate total price = nights * price_per_night.

## 🚐 Travel Booking Rules
- Support multi-day itinerary with dynamic start dates.
- Store number of people per booking and calculate total price.

## 🛒 Products & Orders
- Manage stock; reduce quantity on successful order.
- Support multiple products per order.
- Store shipping details securely.

## 🧑‍💻 User Management
- Support roles: customer, admin.
- Admin can CRUD yurts, travels, products.
- Customers can book yurts, travels, order products.

## 📦 Deployment
- Use Docker with a multi-stage build for smaller images.
- Provide docker-compose.yml with services:
    - app
    - mysql

## 🛠 Testing
- Write tests for booking endpoints, auth flows, and product ordering.
- Include DB seeding scripts for test environments.

## ✨ Admin Panel
- Scaffold a basic Next.js or React admin UI.
- Include views for listing and managing users, bookings, and products.

## 📚 Documentation
- Generate Swagger docs for all endpoints.
- Include README with:
    - Setup instructions
    - Running tests
    - Deploying with Docker

## 🚨 Error Handling
- Centralized error middleware.
- Return consistent JSON error responses:
  ```json
  { "error": "message", "details": [] }
