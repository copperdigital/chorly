# Cloudflare Pages Deployment Instructions

## Prerequisites
- Cloudflare account (free)
- GitHub repository with your code
- Database URL from your PostgreSQL provider

## Step 1: Push Code to GitHub
Ensure all files are committed and pushed to your GitHub repository.

## Step 2: Connect to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click "Pages" in the left sidebar
3. Click "Create a project"
4. Select "Connect to Git"
5. Choose "GitHub" and authorize Cloudflare
6. Select your "chorly" repository
7. Click "Begin setup"

## Step 3: Configure Build Settings

**Build Configuration:**
- Project name: `chorly`
- Production branch: `main` (or your default branch)
- Build command: `npx vite build`
- Build output directory: `dist/public`
- Root directory: `/` (leave empty)

## Step 4: Set Environment Variables

Click "Environment variables" and add:
- `DATABASE_URL`: Your PostgreSQL connection string
- `NODE_ENV`: `production`

**To get your DATABASE_URL:**
Your current database URL is already configured in this Replit environment.

## Step 5: Deploy

1. Click "Save and Deploy"
2. Cloudflare will build and deploy your app
3. Build process takes 2-3 minutes
4. You'll get a URL like `chorly-abc.pages.dev`

## Step 6: Custom Domain (Optional)

1. In your Pages project, go to "Custom domains"
2. Click "Set up a custom domain"
3. Enter your domain name
4. Follow DNS configuration instructions
5. SSL certificate is automatically provided

## Step 7: Test Deployment

Visit your Pages URL and verify:
- Login works with `test@family.com` / `password`
- Dashboard shows family members and tasks
- Task completion functions properly
- Admin panel accessible

## Troubleshooting

**Build Fails:**
- Check build logs in Cloudflare dashboard
- Ensure all dependencies are in package.json
- Verify build command is correct

**Database Connection Issues:**
- Verify DATABASE_URL environment variable
- Check if your database allows external connections
- Ensure database is accessible from Cloudflare's IP ranges

**Functions Not Working:**
- Check Functions tab in Cloudflare dashboard
- Verify _routes.json is configured correctly
- Check function logs for errors

## Benefits Achieved

✅ **Zero Cost**: Free tier covers typical family usage  
✅ **Global Performance**: CDN accelerates worldwide access  
✅ **No Sleep**: Unlike Render, app stays always active  
✅ **Auto SSL**: Secure HTTPS with custom domains  
✅ **Git Integration**: Auto-deploy on code changes