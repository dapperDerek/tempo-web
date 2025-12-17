# Tempo - Better Together Through Understanding

Tempo is a couples communication tool designed to help partners better understand and navigate the menstrual cycle together. Built for **communication and connection**, not surveillance.

This repository contains both the **landing page** and the **backend API** for the Tempo mobile app.

## What is Tempo?

Tempo bridges the gap between partners throughout the menstrual cycle by providing:

- **For Her**: Simple daily check-ins (mood + period tracking) and a personal calendar
- **For Him**: Daily context cards with science-based insights to show up better
- **For Both**: A shared foundation built on understanding, consent, and communication

### Core Philosophy

**Couples-First Design**
- Both partners use the app together, set up collaboratively
- She controls what's shared (cycle tracking is opt-in)
- He receives context, not raw data
- Privacy and consent are central

**Communication Over Tracking**
- Her's period tracking is intentionally minimal (not a replacement for Flow or Flo)
- Mood check-ins give Him real-time context beyond just cycle phase
- Enhanced daily cards combine mood + hormonal context for better support

**Science-Based, Relationship-Focused**
- Built on research about hormonal cycles and their effects
- Personalized smart moves for each phase
- Helps Him avoid predictable friction and stop guessing

---

## Project Overview

This is a Next.js 16 application that serves:
1. **Marketing landing page** - SEO-optimized page to drive app installs
2. **REST API** - Backend for the Expo mobile app with Better Auth authentication

---

## Technical Features

### Landing Page
- SEO-optimized with comprehensive metadata
- Open Graph and Twitter Card tags
- Structured data (JSON-LD) for search engines
- Responsive design with Tailwind CSS
- Fast, static-first rendering

### API
- Next.js 16 with App Router
- TypeScript for type safety
- Better Auth for authentication
- SQLite database with Drizzle ORM
- RESTful API design
- Role-based access control
- Session management with secure cookies
- CORS configured for mobile app
- Comprehensive error handling

### Data Models
- **Couple Profile** - Collaborative setup with invite codes for both partners
- **Mood Check-Ins** - Daily emotional state tracking (Her creates, Him sees context)
- **Period Check-Ins** - Simple binary status updates (Her only)
- **Phase Preferences** - Personalized smart moves per cycle phase
- **Cycle Updates** - Historical period tracking for predictions
- **Articles** - Educational content per phase
- **Calendar** - Monthly view with moods, phases, and period days (Her only)

---

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your configuration (especially `BETTER_AUTH_SECRET`)

5. Generate the database:
```bash
npm run db:generate
```

6. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

---

## API Documentation

See [API.md](./API.md) for complete API documentation, including:
- Couples onboarding flow with invite codes
- Role-based access control (Her vs Him endpoints)
- Mood check-in endpoints
- Period check-in endpoints
- Calendar endpoint
- Enhanced daily cards with mood context
- Expo mobile app integration guide
- Example code for all endpoints

---

## Project Structure

```
tempo-web/
├── app/
│   ├── api/
│   │   ├── auth/[...all]/      # Better Auth endpoints
│   │   ├── couple/             # Couple profile management
│   │   │   └── join/           # Join couple via invite code
│   │   ├── mood-checkin/       # Daily mood tracking (Her)
│   │   │   └── today/          # Get today's mood check-in
│   │   ├── period-checkin/     # Binary period status (Her)
│   │   ├── calendar/           # Monthly calendar view (Her)
│   │   ├── cycle-update/       # Log period starts (Her)
│   │   ├── daily-card/         # Daily context cards (Him)
│   │   │   └── enhanced/       # Mood-enhanced context (Him)
│   │   ├── articles/[id]/      # Educational articles
│   │   ├── user/               # User profile
│   │   └── health/             # Health check
│   ├── layout.tsx              # Root layout with SEO metadata
│   └── page.tsx                # Marketing landing page
├── lib/
│   ├── auth.ts                 # Better Auth configuration
│   ├── auth-client.ts          # Client-side auth utilities
│   ├── couple-auth.ts          # Role-based authorization helpers
│   ├── cycle-calculator.ts     # Cycle phase calculations
│   └── db/
│       ├── index.ts            # Database connection
│       └── schema.ts           # Database schema
├── drizzle/                    # Database migrations
├── public/                     # Static assets
├── .env.local                  # Environment variables (not in git)
├── .env.example                # Example environment variables
├── API.md                      # Complete API documentation
└── README.md                   # This file
```

---

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate/initialize database

---

## Couples Onboarding Flow

1. **First Partner** (either Him or Her) signs up and creates couple profile
2. Selects their role: "I am Him" or "I am Her"
3. Completes onboarding with cycle info and preferences
4. Receives an **invite code** (e.g., `TEMPO-ABC123`)
5. Shares code with partner

6. **Second Partner** downloads app and signs up
7. Enters invite code to join the couple
8. Selects their role (opposite of first partner)
9. Both are now linked and see their respective views

---

## Authentication Flow

1. User signs up via `/api/auth/sign-up/email`
2. Better Auth creates user and session
3. Session token stored in HTTP-only cookie
4. Mobile app includes cookie in subsequent requests
5. Protected routes verify session and role via middleware

---

## Role-Based Access Control

**Her Can:**
- Create daily mood check-ins
- Create period check-ins
- View calendar with all check-ins
- Log period starts
- View couple profile

**Him Can:**
- View basic daily context cards
- View enhanced daily cards (when She checks in mood)
- Read mood check-ins (formatted as context, not raw)
- View couple profile

**Both Can:**
- Update couple profile
- View articles
- Manage preferences

---

## CORS Configuration

The API is configured to accept requests from your Expo mobile app. Update the `CORS_ORIGIN` environment variable to match your mobile app's URL.

Default: `http://localhost:8081` (Expo default)

---

## Database

The application uses SQLite with Drizzle ORM. The schema includes:

**Authentication Tables:**
- `user` - User accounts
- `session` - Active sessions
- `account` - Authentication accounts
- `verification` - Email verification tokens

**Tempo Tables:**
- `couple` - Couple profiles with role assignments and invite codes
- `moodCheckIns` - Daily mood tracking (Her creates, both can read)
- `periodCheckIns` - Binary period status (Her creates, both can read)
- `phasePreferences` - Personalized preferences per cycle phase
- `cycleUpdates` - Historical period start tracking
- `articles` - Educational content library

The database is automatically generated/migrated when you run `npm run db:generate`.

---

## Security & Privacy

- Sessions use secure HTTP-only cookies
- CORS is properly configured
- TypeScript for type safety
- Environment variables for secrets
- **Role-based access control** - Her can't see Him's cards, Him can't create Her's check-ins
- **Consent-first design** - `cycleTrackingShared` flag gives Her control over data sharing
- **No raw data exposure** - Him sees interpreted context, not raw cycle data

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables:
   - `BETTER_AUTH_SECRET`
   - `BETTER_AUTH_URL`
   - `DATABASE_PATH`
   - `CORS_ORIGIN`
4. Deploy

### Other Platforms

1. Build: `npm run build`
2. Start: `npm start`
3. Ensure environment variables are set
4. Configure database persistence

---

## Contributing

This is the backend API for the Tempo mobile app. When making changes:
1. Update API documentation in [API.md](./API.md)
2. Test with the Expo mobile app
3. Ensure proper CORS configuration
4. Maintain backwards compatibility
5. Respect role-based access control

---

## License

Private repository
