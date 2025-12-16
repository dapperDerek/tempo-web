# Tempo Web API

Backend API for Tempo - a lightly playful, science-based mobile app for men in committed relationships that provides daily context about their partner's menstrual cycle.

## Overview

This is a Next.js 16 web application with Better Auth for authentication. The API is designed to be consumed by a separate Expo mobile application.

## Features

- ✅ Next.js 16 (latest) with App Router
- ✅ TypeScript for type safety
- ✅ Better Auth for authentication
- ✅ Email/Password authentication
- ✅ SQLite database
- ✅ CORS configured for mobile app
- ✅ Session management with secure cookies
- ✅ Protected API routes
- ✅ Tailwind CSS for styling

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

## API Documentation

See [API.md](./API.md) for complete API documentation, including:
- Authentication endpoints
- Protected routes
- Expo mobile app integration guide
- Example code

## Project Structure

```
tempo-web/
├── app/
│   ├── api/
│   │   ├── auth/[...all]/    # Better Auth endpoints
│   │   ├── user/             # User profile endpoint
│   │   └── health/           # Health check endpoint
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── lib/
│   ├── auth.ts               # Better Auth server configuration
│   ├── auth-client.ts        # Client-side auth utilities
│   └── db/
│       └── generate.js       # Database setup script
├── middleware.ts             # CORS and middleware configuration
├── .env.local                # Environment variables (not in git)
├── .env.example              # Example environment variables
└── API.md                    # API documentation
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate/initialize database

## Authentication Flow

1. User signs up via `/api/auth/sign-up/email`
2. Better Auth creates user and session
3. Session token stored in HTTP-only cookie
4. Mobile app includes cookie in subsequent requests
5. Protected routes verify session via middleware

## CORS Configuration

The API is configured to accept requests from your Expo mobile app. Update the `CORS_ORIGIN` environment variable to match your mobile app's URL.

Default: `http://localhost:8081` (Expo default)

## Database

The application uses SQLite for simplicity. The database schema is automatically created when you run `npm run db:generate`.

Tables:
- `user` - User accounts
- `session` - Active sessions
- `account` - Authentication accounts
- `verification` - Email verification tokens

## Security

- Passwords are hashed using bcrypt
- Sessions use secure HTTP-only cookies
- CORS is properly configured
- TypeScript for type safety
- Environment variables for secrets

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Other Platforms

1. Build: `npm run build`
2. Start: `npm start`
3. Ensure environment variables are set
4. Configure database persistence

## Contributing

This is the backend API for the Tempo mobile app. When making changes:
1. Update API documentation in API.md
2. Test with the Expo mobile app
3. Ensure proper CORS configuration
4. Maintain backwards compatibility

## License

Private repository
