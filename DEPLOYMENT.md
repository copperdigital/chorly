# Deployment Guide

## GitHub + Cloudflare Pages + Neon Database

### 1. Create Neon Database

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project
3. Copy the connection string (DATABASE_URL)

### 2. Setup GitHub Repository

1. Create a new GitHub repository
2. Push this code to the repository:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/chorly.git
git push -u origin main
```

### 3. Deploy to Cloudflare Pages

1. Go to [Cloudflare Pages](https://pages.cloudflare.com)
2. Connect your GitHub repository
3. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave empty)

4. Add environment variables:
   - `DATABASE_URL`: Your Neon connection string
   - `SESSION_SECRET`: Generate a secure random string
   - `NODE_ENV`: `production`

### 4. Run Database Migrations

After deployment, run migrations using Drizzle Kit:

```bash
# Local development
npm run db:generate  # Generate migration files
npm run db:migrate   # Apply migrations to database

# Or use Drizzle Studio for database management
npm run db:studio
```

### 5. Alternative: Railway Deployment

For simpler full-stack deployment:

1. Go to [Railway](https://railway.app)
2. Connect GitHub repository
3. Add Neon database URL as environment variable
4. Railway will auto-deploy on every push

### Environment Variables

Required for production:

```env
DATABASE_URL=postgresql://username:password@hostname:5432/database
SESSION_SECRET=your-very-secure-random-string-here
NODE_ENV=production
```

### Database Schema

The application will automatically create these tables:
- households (families with email/password auth)
- family_members (parents and children)
- tasks (chores with scheduling)
- task_assignments (who does what)
- task_completions (tracking completion)
- rewards (family reward system)
- reward_claims (claimed rewards)

### Demo Account

Test the deployed app with:
- Email: jas.suttie@gmail.com
- Password: password123