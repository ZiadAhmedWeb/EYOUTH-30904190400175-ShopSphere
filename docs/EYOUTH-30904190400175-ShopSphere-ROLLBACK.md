# Rollback Plan — ShopSphere

**Project:** EYOUTH-30904190400175-ShopSphere
**Last updated:** 2026-08-25

## Detection

UptimeRobot monitors:
- GET https://eyouth-30904190400175-shop-sphere.vercel.app/health
  → Expects: { "status": "ok", "postgres": "up", "mongo": "up" }
  → Alert if status != "ok" or response time > 5s

Vercel dashboard:
- Function execution errors, response times, and deployment status

## Rollback Steps

### 1. Revert to last known-good deployment (Vercel)

Each Vercel project keeps a deployment history.

**Backend:**
1. Go to Vercel Dashboard → Backend project → Deployments
2. Find the last deployment marked with a green checkmark (before the broken one)
3. Click the 3-dot menu → "Promote to Production"
4. Verify: curl https://eyouth-30904190400175-shop-sphere.vercel.app/health

**Frontend:**
1. Same steps on the Frontend project
2. Verify: open https://eyouth-30904190400175-shop-sphere-g.vercel.app

**Reviews Service:**
1. Same steps on the Reviews project
2. Verify: curl https://eyouth-30904190400175-shop-sphere-r.vercel.app/api/reviews/1

### 2. If code rollback is needed (GitHub)

```
git log --oneline -10        # find the last good commit
git revert <bad-commit-hash> # create a revert commit
git push origin main         # triggers CI/CD pipeline → auto-deploys
```

### 3. If environment variable issue

1. Go to Vercel Dashboard → project → Settings → Environment Variables
2. Check for typos, missing variables, or wrong values
3. Redeploy after fixing

### 4. Emergency: Disable automatic deploys

If a broken build keeps deploying:
1. Vercel Dashboard → project → Settings → Git
2. Disconnect the Git integration temporarily
3. Fix the issue, then reconnect

## Monitoring After Rollback

- Watch UptimeRobot dashboard for 15 minutes
- Check Vercel function logs for errors
- Test the full user journey: register → browse → add to cart → checkout → review
