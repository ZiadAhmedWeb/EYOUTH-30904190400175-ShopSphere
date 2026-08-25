# ADR-001: Extract Reviews into a Separate Microservice

**Date:** 2026-08-25
**Status:** Accepted
**Project:** EYOUTH-30904190400175-ShopSphere

## Context

ShopSphere (ZeeCrumb) is an e-commerce platform deployed on Vercel. The monolithic Backend serves all routes — auth, products, cart, categories, reviews, stats — from a single Express app bundled into one Vercel serverless function. Reviews use MongoDB (Mongoose) while all other data uses PostgreSQL (Prisma), creating a dual-database dependency within a single deployment unit.

As part of DECI Level 5, we need to demonstrate application modernization by extracting a bounded context into an independent service.

## Decision

Extract `reviews.js` and `Review.js` from the monolithic Backend into a standalone **reviews-service** with:

- Its own codebase (`reviews-service/`)
- Its own Vercel serverless function (`api/reviews.js`)
- Its own MongoDB connection (same Atlas cluster, isolated connection lifecycle)
- Its own deployment and URL
- JWT verification handled internally (no dependency on Backend's auth middleware)

The main Backend retains a **thin REST proxy** at `/api/reviews/*` that forwards requests to the reviews service URL via `REVIEWS_SERVICE_URL` env var. This keeps the frontend contract unchanged — no frontend code changes needed.

Additionally, the welcome email (`utils/mailer.js`) is extracted into its own Vercel serverless function (`api/send-welcome-email.js`). The auth register route now fires a background `fetch()` to this function instead of calling `sendWelcomeEmail()` synchronously.

## What was extracted

| Before (monolith) | After (microservice) |
|---|---|
| `Backend/routes/reviews.js` | `reviews-service/api/reviews.js` (serverless) |
| `Backend/models/Review.js` | `reviews-service/models/Review.js` |
| `Backend/mongo/connection.js` | `reviews-service/lib/mongo.js` |
| `Backend/middleware/auth.js` (JWT verify) | `reviews-service/lib/auth.js` |
| `Backend/utils/mailer.js` (sync call) | `Backend/api/send-welcome-email.js` (serverless) |

## Why

1. **Bounded context separation** — Reviews are a self-contained domain (CRUD on one collection, one model). They don't join with PostgreSQL data. Natural seam for extraction.

2. **Independent scaling** — Reviews are write-heavy during product launches. Isolating them lets the reviews function scale independently via Vercel's serverless concurrency without scaling the entire API.

3. **Reduced cold-start surface** — The reviews serverless function bundles only mongoose + jsonwebtoken (~15 MB) vs the full Express app (~40 MB with Prisma, pg, multer, nodemailer, bcrypt).

4. **Fault isolation** — A MongoDB outage no longer risks bringing down product listings, cart, or auth. The proxy returns 502 for reviews while the rest of the app stays healthy.

5. **Serverless background workload** — Welcome emails are now truly async: fire-and-forget fetch to `api/send-welcome-email.js`. No blocking the registration response.

## Consequences

- **Positive:** Smaller, faster deployments for reviews. Clear ownership boundary. Frontend contract preserved via proxy.
- **Negative:** Two Vercel projects to deploy. One extra env var (`REVIEWS_SERVICE_URL`) per environment. MongoDB connection overhead doubles (one per service).
- **Risk:** If `REVIEWS_SERVICE_URL` is misconfigured, reviews return 503/502. Mitigated by the proxy error handling and the health check.

## Rollback

Remove the proxy in `Backend/index.js`, restore the original `routes/reviews.js` and `models/Review.js`, remove `REVIEWS_SERVICE_URL` env var. No frontend changes required either way.
