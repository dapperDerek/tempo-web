CREATE TABLE `moodCheckIns` (
	`id` text PRIMARY KEY NOT NULL,
	`coupleId` text NOT NULL,
	`date` text NOT NULL,
	`mood` text NOT NULL,
	`note` text,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`coupleId`) REFERENCES `couple`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `periodCheckIns` (
	`id` text PRIMARY KEY NOT NULL,
	`coupleId` text NOT NULL,
	`date` text NOT NULL,
	`isActive` integer NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`coupleId`) REFERENCES `couple`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `couple` ADD `herUserId` text REFERENCES user(id);--> statement-breakpoint
ALTER TABLE `couple` ADD `himUserId` text REFERENCES user(id);--> statement-breakpoint
ALTER TABLE `couple` ADD `cycleTrackingShared` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `couple` ADD `inviteCode` text;--> statement-breakpoint
CREATE UNIQUE INDEX `couple_inviteCode_unique` ON `couple` (`inviteCode`);