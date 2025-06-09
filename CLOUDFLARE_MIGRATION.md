# Cloudflare Pages Migration Guide

## Migration Status
✅ Database: Migrated from MemStorage to PostgreSQL  
✅ API Structure: Created serverless functions in `/functions`  
✅ Routing: Configured with `_routes.json`  
✅ Build Config: Set up `wrangler.toml`  

## Cloudflare Pages Architecture

### Files Created:
- `functions/_middleware.ts` - CORS handling for all API requests
- `functions/api/dashboard.ts` - Main dashboard data endpoint
- `functions/api/auth/login.ts` - Authentication endpoint
- `functions/api/admin/tasks/[householdId].ts` - Task management
- `functions/api/tasks/[id]/complete.ts` - Task completion
- `_routes.json` - Function routing configuration
- `wrangler.toml` - Cloudflare Pages configuration

### Database Connection:
- PostgreSQL database is configured and seeded
- DatabaseStorage replaces MemStorage
- All data persists between requests

## Deployment Steps:

1. **Connect to Cloudflare Pages:**
   - Go to Cloudflare Dashboard > Pages
   - Connect your GitHub repository
   - Select "Chorly" repository

2. **Configure Build Settings:**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/` (leave empty)

3. **Environment Variables:**
   Add these to Cloudflare Pages settings:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `NODE_ENV` - Set to `production`

4. **Deploy:**
   - Cloudflare will automatically build and deploy
   - Functions will be available at `/api/*` routes
   - Static files served from CDN

## Benefits of Cloudflare Pages:
- **Free Tier:** 100,000 requests/month, 500 builds/month
- **Global CDN:** Fast worldwide delivery
- **Serverless Functions:** No server management
- **Custom Domains:** Free SSL certificates
- **Git Integration:** Auto-deploy on commits

## Cost Comparison:
- **Render.com:** 750 hours/month free (sleeps after 15min)
- **Cloudflare Pages:** 100k requests/month, no sleep
- **Vercel:** Limited function execution time
- **Railway:** $5/month minimum

Cloudflare Pages provides the best free tier for this application size.