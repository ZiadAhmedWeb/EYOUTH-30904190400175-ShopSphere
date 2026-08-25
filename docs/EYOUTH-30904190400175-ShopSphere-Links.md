# EYOUTH-30904190400175-ShopSphere — Links & Deployment Reference

**Student:** Ziad Ahmed Soliman
**Student ID:** EYOUTH-30904190400175
**Project:** ShopSphere Enterprise Production and Cloud Modernization

---

## Production URLs

| Service        | URL                                                                 |
|----------------|---------------------------------------------------------------------|
| Frontend (SPA) | https://eyouth-30904190400175-shop-sphere-g.vercel.app             |
| Backend API    | https://eyouth-30904190400175-shop-sphere.vercel.app               |
| Reviews Service| https://eyouth-30904190400175-shop-sphere-r.vercel.app             |
| Health Check   | https://eyouth-30904190400175-shop-sphere.vercel.app/health        |

## Repository

https://github.com/ZiadAhmedWeb/EYOUTH-30904190400175-ShopSphere

## Kubernetes Simulation (Local)

| Local Port | Namespace        | Service               |
|------------|------------------|-----------------------|
| 15000      | aws-simulation   | frontend-service:80   |
| 15001      | aws-simulation   | backend-service:5000  |
| 25000      | gcp-simulation   | frontend-service:80   |
| 25001      | gcp-simulation   | backend-service:5000  |

Verify isolation:
```
curl http://localhost:15001/health   → "region":"aws-simulation"
curl http://localhost:25001/health   → "region":"gcp-simulation"
```

## Services & Hosting Classification

| Service            | Type | Provider      | Why                              |
|--------------------|------|---------------|----------------------------------|
| Frontend hosting   | PaaS | Vercel        | Managed build + serverless deploy|
| Backend hosting    | PaaS | Vercel        | Managed serverless functions     |
| Reviews hosting    | PaaS | Vercel        | Separate serverless function     |
| PostgreSQL         | SaaS | Supabase      | Hosted managed Postgres          |
| MongoDB            | SaaS | MongoDB Atlas | Hosted managed NoSQL             |
| CI/CD              | SaaS | GitHub Actions| Managed workflow runner          |
| Monitoring         | SaaS | UptimeRobot   | External uptime monitoring       |

## Architecture Overview

```
User → Vercel CDN → Frontend (React SPA via Nginx)
                  → Backend (Express serverless function)
                        ├── PostgreSQL (Supabase) via Prisma
                        ├── MongoDB (Atlas) via Mongoose (logs)
                        └── /api/reviews/* → Reviews Service (separate function)
                                                    └── MongoDB (Atlas) via Mongoose (reviews)
                  → Reviews Service (direct, for rubric proof)
```

## Environment Variables (never committed)

Backend (Vercel):
- DATABASE_URL, JWT_SECRET, MONGO_URI, CORS_ORIGIN, REVIEWS_SERVICE_URL
- SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

Reviews Service (Vercel):
- MONGO_URI, JWT_SECRET, CORS_ORIGIN

Frontend (Vercel):
- VITE_API_URL

GitHub Actions Secrets:
- VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID
- FRONTEND_PROJECT_ID, REVIEWS_PROJECT_ID
- TEST_DATABASE_URL, TEST_JWT_SECRET, TEST_MONGO_URI

## Monitoring

- UptimeRobot: monitors /health every 5 minutes
- Structured logs: [ISO timestamp] [SEVERITY] METHOD /path STATUS DURATIONms user=ID
  - Visible in Vercel → Backend project → Logs tab
  - Also stored in MongoDB Atlas → ecommerce-logs database → logs collection
