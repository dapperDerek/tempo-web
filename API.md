# Tempo Web API Documentation

## Overview

This is the backend API for **Tempo** - a couples communication tool that helps partners better understand and navigate the menstrual cycle together. Built with Next.js 16 and Better Auth for authentication. The API is designed to be consumed by an Expo mobile application.

## Core Philosophy

Tempo is built for **couples**, not individuals. Both partners use the app together:
- **Her**: Provides daily mood and period check-ins, views calendar with cycle tracking
- **Him**: Receives daily context cards and mood-enhanced insights to better support his partner
- **Together**: Set up the profile collaboratively with shared cycle data (opt-in)

## Core Features

- **Couple Profile Management** - Set up together during onboarding with invite codes
- **Role-Based Access** - Her creates check-ins, Him receives context
- **Daily Mood Check-Ins** - She shares how she's feeling, he gets tailored guidance
- **Minimal Period Tracking** - Simple binary check-ins to keep cycle data accurate
- **Daily Context Cards** - Science-based insights for Him
- **Enhanced Context Cards** - Mood + cycle phase interpretations
- **Calendar View** - Monthly overview with moods, phases, and period days (Her only)

---

## Authentication

The API uses Better Auth with email/password authentication. All authentication endpoints are available under `/api/auth/*`.

### Authentication Endpoints

#### Sign Up
```
POST /api/auth/sign-up/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false
  },
  "session": {
    "id": "session_id",
    "userId": "user_id",
    "expiresAt": 1234567890
  }
}
```

#### Sign In
```
POST /api/auth/sign-in/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false
  },
  "session": {
    "id": "session_id",
    "userId": "user_id",
    "expiresAt": 1234567890
  }
}
```

#### Sign Out
```
POST /api/auth/sign-out
Content-Type: application/json
Cookie: better-auth.session_token=<session_token>
```

**Response:**
```json
{
  "success": true
}
```

#### Get Session
```
GET /api/auth/get-session
Cookie: better-auth.session_token=<session_token>
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false
  },
  "session": {
    "id": "session_id",
    "userId": "user_id",
    "expiresAt": 1234567890
  }
}
```

---

## Protected API Endpoints

### Get Current User
```
GET /api/user
Cookie: better-auth.session_token=<session_token>
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false
  },
  "session": {
    "id": "session_id",
    "expiresAt": 1234567890
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Unauthorized"
}
```

---

## Couple Profile Endpoints

### Get Couple Profile
```
GET /api/couple
Cookie: better-auth.session_token=<session_token>
```

**Response:**
```json
{
  "couple": {
    "id": "couple_id",
    "userId": "user_id",
    "herUserId": "her_user_id",
    "himUserId": "him_user_id",
    "partnerName": "Sarah",
    "cycleLength": 28,
    "periodLength": 5,
    "lastPeriodStart": "2025-12-01T00:00:00.000Z",
    "onboardingComplete": true,
    "notificationTime": "09:00",
    "cycleTrackingShared": true,
    "inviteCode": "ABC123",
    "createdAt": "2025-12-01T12:00:00.000Z",
    "updatedAt": "2025-12-15T10:00:00.000Z"
  },
  "preferences": [
    {
      "id": "pref_1",
      "coupleId": "couple_id",
      "phase": "menstrual",
      "smartMoves": "[\"Offer heat pack\", \"Handle dinner\"]",
      "avoidances": "[\"Don't plan heavy activities\"]",
      "createdAt": "2025-12-01T12:00:00.000Z",
      "updatedAt": "2025-12-01T12:00:00.000Z"
    }
  ],
  "role": "him"
}
```

If no couple profile exists:
```json
{
  "couple": null
}
```

### Create/Update Couple Profile
```
POST /api/couple
Content-Type: application/json
Cookie: better-auth.session_token=<session_token>

{
  "partnerName": "Sarah",
  "role": "him",
  "cycleLength": 28,
  "periodLength": 5,
  "lastPeriodStart": "2025-12-01",
  "notificationTime": "09:00",
  "preferences": [
    {
      "phase": "menstrual",
      "smartMoves": ["Offer heat pack", "Handle dinner"],
      "avoidances": ["Don't plan heavy activities"]
    },
    {
      "phase": "follicular",
      "smartMoves": ["Good time for date nights"],
      "avoidances": []
    },
    {
      "phase": "ovulation",
      "smartMoves": ["Compliment her", "Plan quality time"],
      "avoidances": []
    },
    {
      "phase": "luteal",
      "smartMoves": ["Give space when needed", "Validate feelings"],
      "avoidances": ["Avoid criticism"]
    }
  ]
}
```

**Notes:**
- `role`: "him" or "her" - indicates who is creating the profile
- Setting a role will populate either `herUserId` or `himUserId` fields
- An `inviteCode` is automatically generated for partner to join
- If updating existing profile, role fields are preserved

**Response:**
```json
{
  "couple": { /* updated couple object */ },
  "preferences": [ /* array of preference objects */ ],
  "role": "him",
  "inviteCode": "ABC123"
}
```

**Validation Errors (400):**
```json
{
  "error": "Partner name and last period start date are required"
}
```

### Join Couple via Invite Code
```
POST /api/couple/join
Content-Type: application/json
Cookie: better-auth.session_token=<session_token>

{
  "inviteCode": "ABC123",
  "role": "her"
}
```

**Notes:**
- Partner uses this endpoint to join an existing couple profile
- `role`: "him" or "her" - must match the available role in the couple
- User cannot join if they're already part of another couple
- Cannot join if the role is already filled

**Response:**
```json
{
  "success": true,
  "couple": { /* couple object with updated herUserId or himUserId */ },
  "role": "her"
}
```

**Error Responses:**

Invalid invite code (404):
```json
{
  "error": "Invalid invite code"
}
```

Already part of a couple (400):
```json
{
  "error": "You are already part of a couple profile"
}
```

Role already filled (400):
```json
{
  "error": "The 'her' role is already filled in this couple"
}
```

---

## Mood Check-In Endpoints (Her Only)

### Create/Update Today's Mood Check-In
```
POST /api/mood-checkin
Content-Type: application/json
Cookie: better-auth.session_token=<session_token>

{
  "mood": "stressed",
  "note": "Big presentation at work today"
}
```

**Allowed Moods:**
- `anxious`
- `calm`
- `content`
- `cranky`
- `energized`
- `frisky`
- `happy`
- `irritable`
- `sad`
- `stressed`
- `tired`


**Notes:**
- Only Her can create mood check-ins
- If check-in already exists for today, it will be updated
- Note is optional
- Triggers enhanced context card for Him

**Response:**
```json
{
  "success": true,
  "checkIn": {
    "id": "checkin_id",
    "coupleId": "couple_id",
    "date": "2025-12-16",
    "mood": "stressed",
    "note": "Big presentation at work today",
    "createdAt": "2025-12-16T10:00:00.000Z"
  },
  "updated": false
}
```

**Error Response (403 Forbidden):**
```json
{
  "error": "This action can only be performed by Her"
}
```

### Get Latest Mood Check-In
```
GET /api/mood-checkin
Cookie: better-auth.session_token=<session_token>
```

**Response:**
```json
{
  "checkIn": {
    "id": "checkin_id",
    "coupleId": "couple_id",
    "date": "2025-12-16",
    "mood": "stressed",
    "note": "Big presentation at work today",
    "createdAt": "2025-12-16T10:00:00.000Z"
  }
}
```

If no check-ins exist:
```json
{
  "checkIn": null
}
```

### Get Today's Mood Check-In
```
GET /api/mood-checkin/today
Cookie: better-auth.session_token=<session_token>
```

**Response:**
```json
{
  "checkIn": {
    "id": "checkin_id",
    "coupleId": "couple_id",
    "date": "2025-12-16",
    "mood": "stressed",
    "note": "Big presentation at work today",
    "createdAt": "2025-12-16T10:00:00.000Z"
  }
}
```

If no check-in for today:
```json
{
  "checkIn": null
}
```

---

## Period Check-In Endpoints (Her Only)

### Log Today's Period Status
```
POST /api/period-checkin
Content-Type: application/json
Cookie: better-auth.session_token=<session_token>

{
  "isActive": true
}
```

**Notes:**
- Only Her can create period check-ins
- Binary status: `true` if period is active today, `false` if not
- If `isActive: true` and it's a new period start, automatically updates `couple.lastPeriodStart`
- Updates shared cycle tracking if `cycleTrackingShared: true`

**Response:**
```json
{
  "success": true,
  "checkIn": {
    "id": "checkin_id",
    "date": "2025-12-16",
    "isActive": true
  },
  "updated": false
}
```

**Error Response (403 Forbidden):**
```json
{
  "error": "This action can only be performed by Her"
}
```

### Get Recent Period Check-Ins
```
GET /api/period-checkin?limit=30
Cookie: better-auth.session_token=<session_token>
```

**Query Parameters:**
- `limit`: Number of check-ins to return (default: 30)

**Response:**
```json
{
  "checkIns": [
    {
      "id": "checkin_1",
      "date": "2025-12-16",
      "isActive": true,
      "createdAt": "2025-12-16T08:00:00.000Z"
    },
    {
      "id": "checkin_2",
      "date": "2025-12-15",
      "isActive": true,
      "createdAt": "2025-12-15T08:00:00.000Z"
    }
  ]
}
```

---

## Calendar Endpoint (Her Only)

### Get Monthly Calendar View
```
GET /api/calendar?year=2025&month=12
Cookie: better-auth.session_token=<session_token>
```

**Query Parameters:**
- `year`: Year (default: current year)
- `month`: Month 1-12 (default: current month)

**Notes:**
- Only Her can access calendar
- Returns full month view with cycle phases, moods, and period status

**Response:**
```json
{
  "year": 2025,
  "month": 12,
  "currentCycleDay": 16,
  "currentPhase": "luteal",
  "days": [
    {
      "date": "2025-12-01",
      "dayOfMonth": 1,
      "cycleDay": 1,
      "phase": "menstrual",
      "mood": "calm",
      "moodNote": null,
      "isPeriod": true
    },
    {
      "date": "2025-12-02",
      "dayOfMonth": 2,
      "cycleDay": 2,
      "phase": "menstrual",
      "mood": null,
      "moodNote": null,
      "isPeriod": true
    }
  ]
}
```

**Error Response (403 Forbidden):**
```json
{
  "error": "This action can only be performed by Her"
}
```

---

## Daily Context Card Endpoints

### Get Today's Basic Context Card (Him)
```
GET /api/daily-card
Cookie: better-auth.session_token=<session_token>
```

**Response:**
```json
{
  "date": "2025-12-16",
  "phase": "luteal",
  "phaseTitle": "Luteal Phase",
  "dayOfCycle": 18,
  "daysUntilNextPeriod": 11,
  "whatIsHappening": "Progesterone rises, then both estrogen and progesterone drop...",
  "commonMisreads": [
    "Sensitivity isn't overreacting—her nervous system is genuinely more reactive",
    "Irritability isn't about you—it's hormonal turbulence"
  ],
  "smartMoves": [
    "Give space when she needs it, closeness when she asks",
    "Avoid criticism or jokes that might land wrong",
    "Validate feelings without trying to fix them"
  ],
  "article": {
    "id": "article_123",
    "title": "Understanding the Luteal Phase",
    "summary": "Learn why emotions feel bigger during this phase...",
    "readTime": 3
  }
}
```

**Onboarding Required (404):**
```json
{
  "error": "Couple profile not found. Complete onboarding first.",
  "onboardingRequired": true
}
```

### Get Enhanced Daily Card with Mood Context (Him Only)
```
GET /api/daily-card/enhanced
Cookie: better-auth.session_token=<session_token>
```

**Notes:**
- Only Him can access enhanced card
- Only returns data if She completed a mood check-in today
- Combines cycle phase + mood for tailored interpretation

**Response:**
```json
{
  "enhancedCard": {
    "date": "2025-12-16",
    "phase": "luteal",
    "phaseTitle": "Luteal Phase",
    "dayOfCycle": 18,
    "mood": "stressed",
    "moodNote": "Big presentation at work today",
    "moodContext": {
      "interpretation": "Progesterone drop + stress = heightened reactivity. Her nervous system is genuinely more sensitive right now.",
      "smartMoves": [
        "Extra patience is essential",
        "Reduce stressors where possible",
        "Validate feelings without trying to fix"
      ]
    }
  }
}
```

If no mood check-in today:
```json
{
  "enhancedCard": null
}
```

**Error Response (403 Forbidden):**
```json
{
  "error": "This action can only be performed by Him"
}
```

---

## Cycle Tracking Endpoints

### Log Period Start (Her Only)
```
POST /api/cycle-update
Content-Type: application/json
Cookie: better-auth.session_token=<session_token>

{
  "periodStart": "2025-12-15"
}
```

**Notes:**
- Only Her can log period starts
- Updates `couple.lastPeriodStart` if `cycleTrackingShared: true`
- Creates historical record in `cycleUpdates` table

**Response:**
```json
{
  "success": true,
  "cycleUpdate": {
    "id": "update_id",
    "periodStart": "2025-12-15T00:00:00.000Z"
  }
}
```

**Error Responses:**

No couple profile (404):
```json
{
  "error": "Couple profile not found. Complete onboarding first."
}
```

Missing date (400):
```json
{
  "error": "Period start date is required"
}
```

Not authorized (403):
```json
{
  "error": "This action can only be performed by Her"
}
```

---

## Article Endpoints

### Get Full Article
```
GET /api/articles/[id]
Cookie: better-auth.session_token=<session_token>
```

**Response:**
```json
{
  "id": "article_123",
  "phase": "luteal",
  "title": "Understanding the Luteal Phase",
  "content": "Full markdown content of the article...",
  "summary": "Learn why emotions feel bigger during this phase...",
  "readTime": 3,
  "published": true,
  "createdAt": "2025-12-01T12:00:00.000Z",
  "updatedAt": "2025-12-01T12:00:00.000Z"
}
```

**Not Found (404):**
```json
{
  "error": "Article not found"
}
```

---

## Health Check

### Check API Status
```
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-16T21:25:29.274Z",
  "service": "tempo-web"
}
```

---

## Access Control Summary

| Endpoint | Her | Him | Both |
|----------|-----|-----|------|
| GET /api/couple | ✓ | ✓ | ✓ |
| POST /api/couple | ✓ | ✓ | ✓ |
| POST /api/couple/join | ✓ | ✓ | ✓ |
| POST /api/mood-checkin | ✓ | ✗ | ✗ |
| GET /api/mood-checkin | ✓ | ✓ | ✓ |
| GET /api/mood-checkin/today | ✓ | ✓ | ✓ |
| POST /api/period-checkin | ✓ | ✗ | ✗ |
| GET /api/period-checkin | ✓ | ✓ | ✓ |
| GET /api/calendar | ✓ | ✗ | ✗ |
| GET /api/daily-card | ✗ | ✓ | ✗ |
| GET /api/daily-card/enhanced | ✗ | ✓ | ✗ |
| POST /api/cycle-update | ✓ | ✗ | ✗ |

---

## CORS Configuration

The API is configured to accept requests from your Expo mobile app. By default, it allows requests from `http://localhost:8081` (Expo default).

To configure for production:
1. Update the `CORS_ORIGIN` environment variable in `.env.local`
2. The middleware will automatically handle CORS headers

---

## Session Management

Better Auth uses secure HTTP-only cookies for session management. When making requests from your Expo app:

1. Include credentials in your fetch requests:
```javascript
fetch('http://localhost:3000/api/mood-checkin', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ mood: 'energized' }),
})
```

2. The session cookie will be automatically included in subsequent requests

---

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing or invalid session)
- `403` - Forbidden (wrong role for this action)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

Error responses follow this format:
```json
{
  "error": "Error message description"
}
```

---

## Expo Mobile App Integration

### Installation in Expo App

```bash
npm install better-auth
```

### Create Auth Client

```typescript
// lib/auth.ts
import { createAuthClient } from "better-auth/react-native";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000", // Change to your production URL
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

### Example: Couples Onboarding Flow

```typescript
import { useState } from 'react';
import { signUp } from '@/lib/auth';

// Step 1: First partner signs up and creates couple profile
const handleCreateCouple = async () => {
  // Sign up
  const { data: authData } = await signUp.email({
    email: 'john@example.com',
    password: 'password123',
    name: 'John',
  });

  // Create couple profile with role
  const response = await fetch('http://localhost:3000/api/couple', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      partnerName: 'Sarah',
      role: 'him', // John is setting this up
      cycleLength: 28,
      periodLength: 5,
      lastPeriodStart: '2025-12-01',
      notificationTime: '09:00',
      preferences: [/* phase preferences */],
    }),
  });

  const { inviteCode } = await response.json();
  console.log('Share this code with your partner:', inviteCode);
};

// Step 2: Partner joins using invite code
const handleJoinCouple = async (inviteCode: string) => {
  // Sign up
  const { data: authData } = await signUp.email({
    email: 'sarah@example.com',
    password: 'password123',
    name: 'Sarah',
  });

  // Join couple
  const response = await fetch('http://localhost:3000/api/couple/join', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      inviteCode,
      role: 'her',
    }),
  });

  const data = await response.json();
  console.log('Joined couple:', data.couple);
};
```

### Example: Her's Daily Check-Ins

```typescript
// Mood check-in
const logMood = async (mood: string, note?: string) => {
  const response = await fetch('http://localhost:3000/api/mood-checkin', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mood, note }),
  });
  return response.json();
};

// Period check-in
const logPeriod = async (isActive: boolean) => {
  const response = await fetch('http://localhost:3000/api/period-checkin', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isActive }),
  });
  return response.json();
};

// Get calendar
const fetchCalendar = async (year: number, month: number) => {
  const response = await fetch(
    `http://localhost:3000/api/calendar?year=${year}&month=${month}`,
    { credentials: 'include' }
  );
  return response.json();
};
```

### Example: Him's Daily Cards

```typescript
// Get basic daily card
const fetchDailyCard = async () => {
  const response = await fetch('http://localhost:3000/api/daily-card', {
    credentials: 'include',
  });
  return response.json();
};

// Get enhanced card (with mood context)
const fetchEnhancedCard = async () => {
  const response = await fetch('http://localhost:3000/api/daily-card/enhanced', {
    credentials: 'include',
  });
  const data = await response.json();

  if (data.enhancedCard) {
    // She checked in today, show enhanced context
    return data.enhancedCard;
  }

  // No mood check-in, fall back to basic card
  return null;
};
```

---

## Environment Variables

Required environment variables (see `.env.example`):

- `BETTER_AUTH_SECRET` - Secret key for session encryption (min 32 characters)
- `BETTER_AUTH_URL` - Base URL of your API (e.g., `http://localhost:3000`)
- `DATABASE_PATH` - Path to SQLite database file
- `CORS_ORIGIN` - Allowed origin for CORS (your Expo app URL)

---

## Security Considerations

- Always use HTTPS in production
- Set a strong `BETTER_AUTH_SECRET` (at least 32 random characters)
- Update `CORS_ORIGIN` to match your production Expo app URL
- Regularly update dependencies for security patches
- Consider implementing rate limiting for authentication endpoints
- Role-based access control ensures Her can't see Him's cards and vice versa
- `cycleTrackingShared` flag gives Her control over data sharing
