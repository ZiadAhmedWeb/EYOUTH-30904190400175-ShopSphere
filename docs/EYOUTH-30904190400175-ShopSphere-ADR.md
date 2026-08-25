# ADR-001: Reviews Microservice Extraction

**Date:** 2026-08-25 | **Status:** Accepted | **Project:** EYOUTH-30904190400175-ShopSphere

## Context & Decision

The monolithic Backend serves all routes from one Vercel serverless function. Reviews use MongoDB (Mongoose) while everything else uses PostgreSQL (Prisma) -- a dual-DB dependency in a single deployment unit. Extract reviews into a standalone service with its own codebase, deployment, and MongoDB connection. The main Backend keeps a thin REST proxy at `/api/reviews/*` so the frontend contract stays unchanged. The welcome email is also extracted into a Vercel serverless function (`api/send-welcome-email.js`) for async fire-and-forget delivery.

**What moved:** `routes/reviews.js` + `models/Review.js` + `mongo/connection.js` + auth middleware JWT verify -> `reviews-service/`. Welcome email -> `Backend/api/send-welcome-email.js` (serverless).

## Why

1. **Bounded context** -- Reviews are self-contained CRUD on one collection. No joins with Postgres. Natural extraction seam.
2. **Independent scaling** -- Write-heavy during launches; scales via Vercel concurrency without scaling the whole API.
3. **Smaller cold-start** -- Reviews function bundles ~15 MB (mongoose + jwt) vs ~40 MB full app (Prisma, pg, multer, nodemailer, bcrypt).
4. **Fault isolation** -- MongoDB outage no longer risks auth, products, or cart. Proxy returns 502 for reviews only.
5. **Async workload** -- Welcome emails are now fire-and-forget; no blocking the registration response.

## Consequences

- **+** Smaller/faster deployments, clear ownership boundary, zero frontend changes.
- **-** Two Vercel projects to deploy, one extra env var per environment, doubled MongoDB connection overhead.
- **Risk:** Misconfigured `REVIEWS_SERVICE_URL` causes 502 on reviews. Mitigated by proxy error handling and health check.

## Rollback

Remove proxy in `Backend/index.js`, restore `routes/reviews.js` and `models/Review.js`, delete `REVIEWS_SERVICE_URL` env var. No frontend changes required.
