# Chorly - Family Chore Management App

A gamified family chore management web application built with React, Express, and TypeScript.

## Features

- **Family Management**: Create profiles for all family members with custom avatars
- **Task Scheduling**: Flexible recurring tasks (daily, weekly, monthly, custom intervals)
- **Gamification**: Points, streaks, and progress tracking
- **Dashboard Views**: Individual and family-wide task views
- **Admin Controls**: Task creation, editing, and family management
- **Date Navigation**: Browse tasks across different days and weeks

## Free Deployment Guide

### Option 1: Render.com (Recommended - 100% Free)

1. **Push to GitHub**: Use Replit's version control to push your code

2. **Deploy on Render**:
   - Go to [render.com](https://render.com)
   - Sign up with GitHub
   - Click "New +" → "Web Service"
   - Connect your `chorly` repository

3. **Render will auto-detect**:
   - Build Command: `npm run build` 
   - Start Command: `npm start`
   - Node Version: 18
   - All settings from `render.yaml`

4. **Free deployment includes**:
   - 750 hours/month (full month coverage)
   - Custom domain: `https://chorly-family-app.onrender.com`
   - Automatic SSL certificate
   - GitHub auto-deployment on commits

### Option 2: Fly.io (Free Tier - 100% Free)

1. **Install Fly CLI** and sign up at fly.io
2. **Run deployment command**:
   ```bash
   fly launch
   fly deploy
   ```
3. **Free tier**: 3 shared-cpu-1x VMs, 160GB outbound data
4. **Apps sleep after inactivity** but wake in seconds
5. **No time limits** unlike other providers

### Option 3: Glitch.com (100% Free)

1. **Import from GitHub** at glitch.com
2. **Automatic deployment** - no configuration needed
3. **Free tier**: Project sleeps after 5min, wakes instantly
4. **No monthly limits** on usage

### Why Vercel Failed

Vercel's free tier doesn't handle full-stack Node.js apps well. It's designed for:
- Static sites (React/Vue/etc)
- Serverless functions (not full Express servers)

Your Express app needs a traditional Node.js host, which is why Render.com or Fly.io work perfectly.

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Access the app**:
   - Open http://localhost:5000
   - Default family login: family@suttie.com / 0000
   - Family member PINs: Dad(1234), Mum(5678), Seb(9876), Tessa(5432)

## Free Tier Limitations

**Vercel Free Tier**:
- 100GB bandwidth/month (generous for family use)
- No persistent storage (data resets on server restart)
- 10-second function timeout
- Custom domain included

**Netlify Free Tier**:
- 100GB bandwidth/month
- 125,000 function invocations/month
- Similar limitations to Vercel

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Express.js, Node.js
- **Storage**: In-memory (development) / PostgreSQL (production)
- **UI Components**: Radix UI, Shadcn/ui
- **State Management**: TanStack Query

## Family Setup

1. **Login** with the default household credentials
2. **Create profiles** for each family member in Admin panel
3. **Set up tasks** with appropriate schedules and point values
4. **Start tracking** daily progress and streaks

## Production Considerations

For permanent deployment with persistent data:
- Switch to PostgreSQL with Neon's free tier (10GB)
- Database auto-sleeps after 5 minutes (wakes instantly)
- 100 hours compute/month (resets monthly)

The current in-memory setup is perfect for family use where occasional data resets are acceptable.