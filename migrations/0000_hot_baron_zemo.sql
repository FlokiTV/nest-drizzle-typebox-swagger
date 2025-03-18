CREATE TABLE `user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`lastSignAt` integer DEFAULT 0,
	`createdAt` integer,
	`updatedAt` integer
);
