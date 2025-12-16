# Tempo Web API Documentation

## Overview

This is the backend API for the Tempo mobile app, built with Next.js 16 and Better Auth for authentication. The API is designed to be consumed by an Expo mobile application.

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

## CORS Configuration

The API is configured to accept requests from your Expo mobile app. By default, it allows requests from `http://localhost:8081` (Expo default).

To configure for production:
1. Update the `CORS_ORIGIN` environment variable in `.env.local`
2. The middleware will automatically handle CORS headers

## Session Management

Better Auth uses secure HTTP-only cookies for session management. When making requests from your Expo app:

1. Include credentials in your fetch requests:
```javascript
fetch('http://localhost:3000/api/user', {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
})
```

2. The session cookie will be automatically included in subsequent requests

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `401` - Unauthorized (missing or invalid session)
- `400` - Bad Request (invalid input)
- `500` - Internal Server Error

Error responses follow this format:
```json
{
  "error": "Error message description"
}
```

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

### Usage Example

```typescript
import { signIn, signUp, useSession } from '@/lib/auth';

// Sign up
const handleSignUp = async () => {
  try {
    const { data, error } = await signUp.email({
      email: 'user@example.com',
      password: 'securePassword123',
      name: 'John Doe',
    });
    
    if (error) {
      console.error('Sign up error:', error);
      return;
    }
    
    console.log('User created:', data.user);
  } catch (err) {
    console.error('Unexpected error:', err);
  }
};

// Sign in
const handleSignIn = async () => {
  try {
    const { data, error } = await signIn.email({
      email: 'user@example.com',
      password: 'securePassword123',
    });
    
    if (error) {
      console.error('Sign in error:', error);
      return;
    }
    
    console.log('Signed in:', data.user);
  } catch (err) {
    console.error('Unexpected error:', err);
  }
};

// Use session in component
function ProfileScreen() {
  const { data: session, isPending } = useSession();
  
  if (isPending) {
    return <Text>Loading...</Text>;
  }
  
  if (!session) {
    return <Text>Not authenticated</Text>;
  }
  
  return (
    <View>
      <Text>Welcome, {session.user.name}!</Text>
      <Text>Email: {session.user.email}</Text>
    </View>
  );
}
```

## Environment Variables

Required environment variables (see `.env.example`):

- `BETTER_AUTH_SECRET` - Secret key for session encryption (min 32 characters)
- `BETTER_AUTH_URL` - Base URL of your API (e.g., `http://localhost:3000`)
- `DATABASE_PATH` - Path to SQLite database file
- `CORS_ORIGIN` - Allowed origin for CORS (your Expo app URL)

## Development

```bash
# Install dependencies
npm install

# Generate database
npm run db:generate

# Start development server
npm run dev
```

The API will be available at `http://localhost:3000`

## Production Deployment

1. Set production environment variables
2. Generate production database: `npm run db:generate`
3. Build the application: `npm run build`
4. Start the server: `npm start`

## Security Considerations

- Always use HTTPS in production
- Set a strong `BETTER_AUTH_SECRET` (at least 32 random characters)
- Update `CORS_ORIGIN` to match your production Expo app URL
- Regularly update dependencies for security patches
- Consider implementing rate limiting for authentication endpoints
