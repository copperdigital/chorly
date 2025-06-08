# Chory - Family Chore Management App

A gamified family chore management web application built with React, Express, and TypeScript.

## Features

- **Family Management**: Create profiles for all family members with custom avatars
- **Task Scheduling**: Flexible recurring tasks (daily, weekly, monthly, custom intervals)
- **Gamification**: Points, streaks, and progress tracking
- **Dashboard Views**: Individual and family-wide task views
- **Admin Controls**: Task creation, editing, and family management
- **Date Navigation**: Browse tasks across different days and weeks

## Free Deployment Guide

### Option 1: Vercel (Recommended - Free)

1. **Fork this repository** to your GitHub account

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Import your forked repository

3. **Environment Variables** (Optional for basic use):
   - The app works with in-memory storage by default
   - Data resets on server restart (acceptable for family use)

4. **Deploy**:
   - Vercel handles everything automatically
   - Custom domain support included in free tier

### Option 2: Netlify Functions

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Build and Deploy**:
   ```bash
   npm run build
   netlify deploy --prod --dir=client/dist
   ```

### Option 3: Railway ($5/month)

1. **Connect GitHub repository** to Railway
2. **Add PostgreSQL addon** (included in plan)
3. **Set environment variables** for database connection
4. **Deploy** with persistent data storage

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