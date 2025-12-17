CREATE TABLE `articles` (
	`id` text PRIMARY KEY NOT NULL,
	`phase` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`summary` text NOT NULL,
	`readTime` integer DEFAULT 3 NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `couple` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`partnerName` text NOT NULL,
	`cycleLength` integer DEFAULT 28 NOT NULL,
	`periodLength` integer DEFAULT 5 NOT NULL,
	`lastPeriodStart` integer NOT NULL,
	`onboardingComplete` integer DEFAULT false NOT NULL,
	`notificationTime` text DEFAULT '09:00',
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `cycleUpdates` (
	`id` text PRIMARY KEY NOT NULL,
	`coupleId` text NOT NULL,
	`periodStart` integer NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`coupleId`) REFERENCES `couple`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `phasePreferences` (
	`id` text PRIMARY KEY NOT NULL,
	`coupleId` text NOT NULL,
	`phase` text NOT NULL,
	`smartMoves` text NOT NULL,
	`avoidances` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`coupleId`) REFERENCES `couple`(`id`) ON UPDATE no action ON DELETE cascade
);
