import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" }).notNull().default(false),
  name: text("name"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  expiresAt: integer("expiresAt", { mode: "timestamp" }),
  password: text("password"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

// Couple profile - created together during onboarding
export const couple = sqliteTable("couple", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  herUserId: text("herUserId").references(() => user.id, { onDelete: "cascade" }),
  himUserId: text("himUserId").references(() => user.id, { onDelete: "cascade" }),
  partnerName: text("partnerName").notNull(),
  cycleLength: integer("cycleLength").notNull().default(28),
  periodLength: integer("periodLength").notNull().default(5),
  lastPeriodStart: integer("lastPeriodStart", { mode: "timestamp" }).notNull(),
  onboardingComplete: integer("onboardingComplete", { mode: "boolean" }).notNull().default(false),
  notificationTime: text("notificationTime").default("09:00"), // Time for daily notification
  cycleTrackingShared: integer("cycleTrackingShared", { mode: "boolean" }).notNull().default(true),
  inviteCode: text("inviteCode").unique(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

// Phase preferences - what she wants during each phase (set during onboarding)
export const phasePreferences = sqliteTable("phasePreferences", {
  id: text("id").primaryKey(),
  coupleId: text("coupleId")
    .notNull()
    .references(() => couple.id, { onDelete: "cascade" }),
  phase: text("phase").notNull(), // menstrual, follicular, ovulation, luteal
  smartMoves: text("smartMoves").notNull(), // JSON array of smart moves
  avoidances: text("avoidances").notNull(), // JSON array of things to avoid
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

// Cycle updates - track period starts to refine predictions
export const cycleUpdates = sqliteTable("cycleUpdates", {
  id: text("id").primaryKey(),
  coupleId: text("coupleId")
    .notNull()
    .references(() => couple.id, { onDelete: "cascade" }),
  periodStart: integer("periodStart", { mode: "timestamp" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});

// Educational articles - science-based content per phase
export const articles = sqliteTable("articles", {
  id: text("id").primaryKey(),
  phase: text("phase").notNull(), // menstrual, follicular, ovulation, luteal
  title: text("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary").notNull(),
  readTime: integer("readTime").notNull().default(3), // minutes
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

// Mood check-ins - daily emotional state tracking (created by Her, consumed by Him)
export const moodCheckIns = sqliteTable("moodCheckIns", {
  id: text("id").primaryKey(),
  coupleId: text("coupleId")
    .notNull()
    .references(() => couple.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // YYYY-MM-DD format
  mood: text("mood").notNull(), // frisky, stressed, cranky, energized, calm, etc.
  note: text("note"), // Optional context note
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});

// Period check-ins - binary period status tracking (created by Her)
export const periodCheckIns = sqliteTable("periodCheckIns", {
  id: text("id").primaryKey(),
  coupleId: text("coupleId")
    .notNull()
    .references(() => couple.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // YYYY-MM-DD format
  isActive: integer("isActive", { mode: "boolean" }).notNull(), // Is period active today?
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});
