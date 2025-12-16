import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [
    process.env.CORS_ORIGIN || "http://localhost:8081",
  ],
});

export type Session = typeof auth.$Infer.Session;
