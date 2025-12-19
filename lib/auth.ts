import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema";
import { expo } from "@better-auth/expo";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  trustedOrigins: [
    "https://trytempo.vercel.app",
    "https://trytempo.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "exp://10.0.0.3:8081",
    "myapp://",
    "tempo",
    "tempo://*",
    ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
    ...(process.env.VERCEL_URL ? [process.env.VERCEL_URL] : []),
  ],
  plugins: [expo()],
});

export type Session = typeof auth.$Infer.Session;
