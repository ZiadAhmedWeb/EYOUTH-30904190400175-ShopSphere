# Task 2 — Cloud Service Classification

**Student:** Ziad Ahmed Soliman
**Student ID:** EYOUTH-30904190400175
**Project:** ShopSphere Enterprise Production and Cloud Modernization

---

## Service Classification

| Service | Type | Classification | One-Line Reason |
|---|---|---|---|
| **Frontend Hosting** | Static SPA hosting | **PaaS** | Vercel handles build, CDN, TLS, and serverless edge — you just push code |
| **Backend Hosting** | Serverless function hosting | **PaaS** | Vercel manages runtime, auto-scaling, TLS termination, and deployments — no OS/infra to manage |
| **PostgreSQL Database** | Managed relational database | **SaaS** | Supabase provides a fully managed Postgres instance with connection pooling, backups, and dashboard — zero server administration |

---

## IaaS vs PaaS vs SaaS (reference)

- **IaaS** (Infrastructure as a Service): You manage OS, runtime, apps on virtual machines (e.g. EC2, GCE)
- **PaaS** (Platform as a Service): Provider manages OS + runtime, you only manage your code (e.g. Vercel, Heroku)
- **SaaS** (Software as a Service): Fully managed application — you just use it (e.g. Supabase, MongoDB Atlas, Gmail)
