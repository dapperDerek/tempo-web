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

// Couple profile - simplified structure
export const couple = sqliteTable("couple", {
  id: text("id").primaryKey(),
  herUserId: text("herUserId").references(() => user.id, { onDelete: "cascade" }),
  himUserId: text("himUserId").references(() => user.id, { onDelete: "cascade" }),
  cycleLength: integer("cycleLength").notNull().default(28),
  periodLength: integer("periodLength").notNull().default(5),
  inviteCode: text("inviteCode").unique(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
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
