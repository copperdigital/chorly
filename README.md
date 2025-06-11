# Chorly - Family Chore Management App

A gamified family chore management web application that transforms household tasks into an engaging, interactive experience.

## Features

- **Email/Password Authentication** - Secure family account management
- **Task Management** - Create, assign, and track family chores
- **Gamification** - Points, streaks, and achievement system
- **Family Member Management** - Role-based permissions (parents/children)
- **Leaderboard** - Weekly family competition
- **Reward System** - Customizable rewards for completed tasks
- **Recurring Tasks** - Daily, weekly, or custom schedules
- **Overdue Detection** - Automatic identification of missed tasks
- **Admin Controls** - PIN-protected management features

## Technology Stack

- **Frontend**: React.js, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle
- **Authentication**: Email/Password with bcrypt
- **UI Components**: shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (Neon recommended)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd chorly
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Configure your database URL in `.env`:
```env
DATABASE_URL=your_neon_database_url
SESSION_SECRET=your_session_secret
```

5. Run database migrations
```bash
npm run db:migrate
```

6. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Deployment

This application is ready for deployment on:

- **Cloudflare Pages** - Frontend and backend functions
- **Neon** - PostgreSQL database
- **GitHub** - Source code repository

### Environment Variables for Production

- `DATABASE_URL` - Your Neon PostgreSQL connection string
- `SESSION_SECRET` - Secure random string for session encryption
- `NODE_ENV` - Set to "production"

## Demo Account

For testing purposes:
- Email: jas.suttie@gmail.com
- Password: password123

## License

MIT License