# ZeeCrumb — Full-Stack E-Commerce Platform

GitHub Repository:
https://github.com/ZiadAhmedWeb/EYOUTH-30904190400175-ShopSphere

## OVERVIEW

ZeeCrumb is a full-stack e-commerce web application supporting customer
and admin roles. Customers can browse products, search, filter, and sort
products, manage a shopping cart, complete checkout, and leave product
reviews. Administrators can manage products and categories through a
dedicated dashboard and monitor store statistics.

## TECH STACK

Frontend:

* React (Vite)
* React Router
* Axios
* Context API (authentication state)
* Vitest + React Testing Library + MSW (component testing)

Backend:

* Node.js + Express.js
* PostgreSQL + Prisma ORM (primary application data)
* MongoDB Atlas + Mongoose (request logging and product reviews)
* JWT authentication + bcrypt password hashing
* Multer (image upload)
* Jest + Supertest (unit + integration testing)

DevOps:

* Docker (separate Dockerfiles for frontend/backend)
* Docker Compose (orchestrates frontend, backend, and PostgreSQL)

## FEATURES

Authentication & Authorization:

* User registration and login with JWT authentication
* Password hashing with bcrypt
* Role-based access control (customer vs admin)
* Protected routes on both frontend and backend
* User profile page displaying account information

Product Catalog:

* Full product CRUD (admin only)
* Product image upload (admin)
* Category management with separate Category model
* Product search by name
* Filter by category
* Sort by price (ascending/descending) and name
* Pagination
* Product detail page with category, description, stock, and pricing

Shopping & Checkout:

* Shopping cart (add, update quantity, remove items)
* Cart stored per authenticated user in PostgreSQL
* Checkout with delivery address
* Automatic stock validation and deduction using database transactions

Reviews & Ratings:

* Reviews stored in MongoDB using Mongoose
* One review per user per product
* Star rating (1–5) and optional written comment
* Reviews persist after refresh
* Average rating and review count displayed
* Reviewer email and comment displayed for every review

Admin Dashboard:

* Product management (create, update, delete)
* Product image upload
* Category management
* Store Statistics dashboard displaying:

  * Total users
  * Total products
  * Total categories
  * Total reviews
* All admin routes protected by role-based middleware

Home Page:

* Hero banner
* Category quick links
* Featured products carousel
* About section
* Contact section
* Founder card

Logging & Monitoring:

* Every API request is logged to MongoDB Atlas using Mongoose,
  including HTTP method, endpoint, status code, user ID, and timestamp.

Design:

* Responsive desktop and mobile layout
* Consistent custom color palette and styling

## HOW TO RUN — DOCKER (RECOMMENDED)

Requirements:

* Docker Desktop

1. Clone the repository.

2. Create a `.env` file in the project root containing:

   MONGO_URI="your-mongodb-atlas-connection-string"

3. Run:

   docker-compose up --build

4. Wait for all containers to start.

5. Open:

   http://localhost:5173

## HOW TO RUN — LOCAL

Requirements:

* Node.js
* PostgreSQL
* MongoDB Atlas

Backend:

1. cd Backend
2. npm install
3. Create Backend/.env

DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ecommerce_db"
JWT_SECRET="your-secret"
MONGO_URI="your-mongodb-atlas-connection-string"
PORT=5000

4. Generate Prisma Client:

   npx prisma generate

5. Run migrations:

   npx prisma migrate dev

6. Start backend:

   npm run dev

Frontend:

1. cd Frontend
2. npm install
3. npm run dev

Open:

http://localhost:5173

## RUNNING TESTS

Backend:

cd Backend
npm test

Frontend:

cd Frontend
npm test

## PROJECT URLS

Frontend:
http://localhost:5173

Backend API:
http://localhost:5000/api

Prisma Studio:

npx prisma studio

## PRODUCTION DEPLOYMENT

Student ID: EYOUTH-30904190400175

Repository:
https://github.com/ZiadAhmedWeb/EYOUTH-30904190400175-ShopSphere

Frontend (PaaS — Vercel):
https://eyouth-30904190400175-shop-sphere-g.vercel.app

Backend API (PaaS — Vercel):
https://eyouth-30904190400175-shop-sphere.vercel.app

Reviews Service (PaaS — Vercel, separate microservice):
https://eyouth-30904190400175-shop-sphere-r.vercel.app/api/reviews/:productId

Databases (SaaS):
- PostgreSQL: Supabase (hosted, serverless Postgres)
- MongoDB: MongoDB Atlas (hosted, managed NoSQL)

Health Check:
https://eyouth-30904190400175-shop-sphere.vercel.app/health

Architecture:
- Frontend serves the React SPA via Nginx on Vercel
- Backend is a Vercel serverless function (Express + Prisma + PostgreSQL)
- Reviews service is a SEPARATE Vercel serverless function (Mongoose + MongoDB)
- Backend proxies /api/reviews/* to the reviews service via REVIEWS_SERVICE_URL
- Welcome emails are sent via a dedicated serverless function (api/send-welcome-email.js)
- All secrets stored as Vercel environment variables (never in repo)
- CORS, Helmet, and rate limiting are active on the backend

## TEST ACCOUNTS

Admin

Email:
[admin@zeecrumb.com](mailto:admin@zeecrumb.com)

Password:
admin123

Customer

Register a new account from the Register page.

## KNOWN LIMITATIONS / FUTURE IMPROVEMENTS

* JWT is stored in localStorage. A production deployment should use
  httpOnly cookies.
* Frontend testing uses Vitest instead of Jest because the project is
  built with Vite.
* Checkout currently validates stock and clears the cart but does not
  maintain a complete order history.

## AUTHOR

Ziad Ahmed
