# Tempo Web API Documentation

## Overview

This is the backend API for **Tempo** - a couples communication tool that helps partners better understand and navigate the menstrual cycle together. Built with Next.js 16 and Better Auth for authentication. The API is designed to be consumed by an Expo mobile application.

## Core Philosophy

Tempo is built for **couples**, not individuals. Both partners use the app together:

- **Her**: Provides daily mood and period check-ins, views calendar with cycle tracking
- **Him**: Receives mood and cycle insights to better support his partner
- **Together**: Set up the profile collaboratively with invite codes

## Core Features

- **Couple Profile Management** - Simple setup with invite codes for partners to join
- **Role-Based Access** - Her creates check-ins, Him receives insights
- **Daily Mood Check-Ins** - She shares how she's feeling
- **Minimal Period Tracking** - Simple binary check-ins to keep cycle data accurate
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
    "herUserId": "her_user_id",
    "himUserId": "him_user_id",
    "cycleLength": 28,
    "periodLength": 5,
    "inviteCode": "ABC123",
    "createdAt": "2025-12-01T12:00:00.000Z"
  },
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
  "role": "him",
  "cycleLength": 28,
  "periodLength": 5
}
```

**Notes:**

- `role`: **REQUIRED** - Must be "him" or "her" - indicates who is creating the profile
- Setting a role will populate either `herUserId` or `himUserId` fields
- An `inviteCode` is automatically generated for partner to join
- `cycleLength` and `periodLength` are optional (defaults: 28 and 5)

**Response:**

```json
{
  "couple": {
    "id": "couple_id",
    "herUserId": null,
    "himUserId": "user_id",
    "cycleLength": 28,
    "periodLength": 5,
    "inviteCode": "ABC123",
    "createdAt": "2025-12-01T12:00:00.000Z"
  },
  "role": "him",
  "inviteCode": "ABC123"
}
```

**Validation Errors (400):**

```json
{
  "error": "Role is required and must be 'him' or 'her'"
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
  "couple": {
    /* couple object with updated herUserId or himUserId */
  },
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
  "note": "Big presentation at work today",
  "date": "2025-12-22"
}
```

**Request Parameters:**

- `mood` (required): One of the allowed mood values
- `note` (optional): Additional context about the mood
- `date` (required): Date in YYYY-MM-DD format (in user's local timezone)

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
- If check-in already exists for the specified date, it will be updated
- The date should be sent in the user's local timezone (YYYY-MM-DD format)
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

### Get Mood Check-In(s)

```
GET /api/mood-checkin
Cookie: better-auth.session_token=<session_token>
```

**Query Parameters (all optional):**

- `date`: Get check-in for a specific date (format: YYYY-MM-DD)
- `startDate` & `endDate`: Get all check-ins within a date range (format: YYYY-MM-DD)
- No parameters: Returns the latest mood check-in

**Response (no parameters - latest check-in):**

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

**Response (with date parameter):**

```
GET /api/mood-checkin?date=2025-12-15
```

```json
{
  "checkIn": {
    "id": "checkin_id",
    "coupleId": "couple_id",
    "date": "2025-12-15",
    "mood": "happy",
    "note": null,
    "createdAt": "2025-12-15T09:00:00.000Z"
  }
}
```

**Response (with date range):**

```
GET /api/mood-checkin?startDate=2025-12-01&endDate=2025-12-31
```

```json
{
  "checkIns": [
    {
      "id": "checkin_1",
      "coupleId": "couple_id",
      "date": "2025-12-16",
      "mood": "stressed",
      "note": "Big presentation at work today",
      "createdAt": "2025-12-16T10:00:00.000Z"
    },
    {
      "id": "checkin_2",
      "coupleId": "couple_id",
      "date": "2025-12-15",
      "mood": "happy",
      "note": null,
      "createdAt": "2025-12-15T09:00:00.000Z"
    }
  ]
}
```

If no check-ins exist:

```json
{
  "checkIn": null
}
```

or (for date range):

```json
{
  "checkIns": []
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
  "isActive": true,
  "date": "2025-12-22"
}
```

**Request Parameters:**

- `isActive` (required, boolean): `true` if period is active, `false` if not
- `date` (required): Date in YYYY-MM-DD format (in user's local timezone)

**Notes:**

- Only Her can create period check-ins
- If check-in already exists for the specified date, it will be updated
- The date should be sent in the user's local timezone (YYYY-MM-DD format)
- Period check-ins are used to calculate cycle phases and track history

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

### Get Period Check-In(s)

```
GET /api/period-checkin
Cookie: better-auth.session_token=<session_token>
```

**Query Parameters (all optional):**

- `date`: Get check-in for a specific date (format: YYYY-MM-DD)
- `startDate` & `endDate`: Get all check-ins within a date range (format: YYYY-MM-DD)
- `limit`: Number of check-ins to return when using default mode (default: 100)
- No parameters: Returns recent period check-ins with default limit

**Response (no parameters - recent check-ins with limit):**

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

**Response (with date parameter):**

```
GET /api/period-checkin?date=2025-12-15
```

```json
{
  "checkIn": {
    "id": "checkin_id",
    "date": "2025-12-15",
    "isActive": true,
    "createdAt": "2025-12-15T08:00:00.000Z"
  }
}
```

**Response (with date range):**

```
GET /api/period-checkin?startDate=2025-12-01&endDate=2025-12-31
```

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

If no check-in exists for a specific date:

```json
{
  "checkIn": null
}
```

or (for date range with no results):

```json
{
  "checkIns": []
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

| Endpoint                    | Her | Him | Both |
| --------------------------- | --- | --- | ---- |
| GET /api/couple             | ✓   | ✓   | ✓    |
| POST /api/couple            | ✓   | ✓   | ✓    |
| POST /api/couple/join       | ✓   | ✓   | ✓    |
| POST /api/mood-checkin      | ✓   | ✗   | ✗    |
| GET /api/mood-checkin       | ✓   | ✓   | ✓    |
| GET /api/mood-checkin/today | ✓   | ✓   | ✓    |
| POST /api/period-checkin    | ✓   | ✗   | ✗    |
| GET /api/period-checkin     | ✓   | ✓   | ✓    |
| GET /api/calendar           | ✓   | ✗   | ✗    |

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
fetch("http://localhost:3000/api/mood-checkin", {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ mood: "energized" }),
});
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
import { useState } from "react";
import { signUp } from "@/lib/auth";

// Step 1: First partner signs up and creates couple profile
const handleCreateCouple = async () => {
  // Sign up
  const { data: authData } = await signUp.email({
    email: "john@example.com",
    password: "password123",
    name: "John",
  });

  // Create couple profile with role
  const response = await fetch("http://localhost:3000/api/couple", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      role: "him", // John is setting this up
      cycleLength: 28,
      periodLength: 5,
    }),
  });

  const { inviteCode } = await response.json();
  console.log("Share this code with your partner:", inviteCode);
};

// Step 2: Partner joins using invite code
const handleJoinCouple = async (inviteCode: string) => {
  // Sign up
  const { data: authData } = await signUp.email({
    email: "sarah@example.com",
    password: "password123",
    name: "Sarah",
  });

  // Join couple
  const response = await fetch("http://localhost:3000/api/couple/join", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      inviteCode,
      role: "her",
    }),
  });

  const data = await response.json();
  console.log("Joined couple:", data.couple);
};
```

### Example: Her's Daily Check-Ins

```typescript
// Mood check-in
const logMood = async (mood: string, note?: string) => {
  const response = await fetch("http://localhost:3000/api/mood-checkin", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mood, note }),
  });
  return response.json();
};

// Period check-in
const logPeriod = async (isActive: boolean) => {
  const response = await fetch("http://localhost:3000/api/period-checkin", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive }),
  });
  return response.json();
};

// Get calendar
const fetchCalendar = async (year: number, month: number) => {
  const response = await fetch(
    `http://localhost:3000/api/calendar?year=${year}&month=${month}`,
    { credentials: "include" }
  );
  return response.json();
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
- Role-based access control ensures proper separation of concerns between partners

---

## API Changelog

### 2025-12-17 - Major Simplification

**Breaking Changes:**

- **Database Schema Simplified:**
  - Removed `userId` field from couple table (only `herUserId` and `himUserId` remain)
  - Removed `partnerName`, `lastPeriodStart`, `onboardingComplete`, `notificationTime`, `cycleTrackingShared`, `updatedAt` fields from couple table
  - Removed `phasePreferences` table entirely (use hardcoded phase guidance instead)
  - Removed `cycleUpdates` table entirely (period check-ins are the single source of truth)
  - Removed `articles` table (move to static content/CMS)

- **API Changes:**
  - `POST /api/couple` - Simplified request body (removed `partnerName`, `lastPeriodStart`, `notificationTime`, `preferences`)
  - `GET /api/couple` - Simplified response (removed `preferences`, removed extra fields from couple object)
  - Removed `POST /api/cycle-update` endpoint (redundant with period check-ins)
  - Removed `GET /api/daily-card` endpoint (to be reimplemented with static content)
  - Removed `GET /api/daily-card/enhanced` endpoint (to be reimplemented with static content)
  - Removed `GET /api/articles/[id]` endpoint (to be reimplemented with static content)
  - `POST /api/period-checkin` - No longer updates `couple.lastPeriodStart` (uses period check-ins directly)
  - `GET /api/calendar` - Now calculates last period start from period check-ins dynamically

**New Features:**

- Added `getLastPeriodStart()` helper function in `lib/cycle-calculator.ts` to calculate last period start from check-ins

**Migration:**

- Run `npm run db:push` to apply database migration (migration file: `drizzle/0003_common_scarlet_witch.sql`)
- Period tracking data is preserved in `periodCheckIns` table
- Mood check-ins data is preserved
- Historical cycle updates and preferences are deleted
