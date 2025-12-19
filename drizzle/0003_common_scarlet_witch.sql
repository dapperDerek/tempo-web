DROP TABLE `articles`;--> statement-breakpoint
DROP TABLE `cycleUpdates`;--> statement-breakpoint
DROP TABLE `phasePreferences`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_couple` (
	`id` text PRIMARY KEY NOT NULL,
	`herUserId` text,
	`himUserId` text,
	`cycleLength` integer DEFAULT 28 NOT NULL,
	`periodLength` integer DEFAULT 5 NOT NULL,
	`inviteCode` text,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`herUserId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`himUserId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_couple`("id", "herUserId", "himUserId", "cycleLength", "periodLength", "inviteCode", "createdAt") SELECT "id", "herUserId", "himUserId", "cycleLength", "periodLength", "inviteCode", "createdAt" FROM `couple`;--> statement-breakpoint
DROP TABLE `couple`;--> statement-breakpoint
ALTER TABLE `__new_couple` RENAME TO `couple`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `couple_inviteCode_unique` ON `couple` (`inviteCode`);