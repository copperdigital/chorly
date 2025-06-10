# Chorly - Family Chore Management

A family chore management web application with gamification features, converted to Cloudflare Pages for zero cold-start delays.

## Deployment Instructions

1. Download this project as a ZIP
2. Upload to your GitHub repository
3. Connect GitHub repo to Cloudflare Pages
4. Set environment variable: `DATABASE_URL` = your Neon PostgreSQL connection string
5. Deploy

## Environment Variables Required

- `DATABASE_URL`: PostgreSQL connection string

## Architecture

- **Frontend**: React with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Cloudflare Functions (serverless)
- **Database**: Neon PostgreSQL
- **Performance**: ~100ms cold start, instant subsequent requests

## Features

- Family authentication with profiles
- Task management with multiple assignees
- Streak tracking and points system
- Admin controls for family settings
- Real-time task completion with celebrations
- Mobile-responsive design