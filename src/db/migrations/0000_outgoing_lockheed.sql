CREATE TABLE `achievements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`unlocked_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `achievements_key_unique` ON `achievements` (`key`);--> statement-breakpoint
CREATE TABLE `habit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`habit_id` integer NOT NULL,
	`date` text NOT NULL,
	`completed` integer NOT NULL,
	FOREIGN KEY (`habit_id`) REFERENCES `habits`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `habits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`frequency` text NOT NULL,
	`target_time` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `meal_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`notes` text,
	`date` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `mood_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`level` integer NOT NULL,
	`date` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `study_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`subject` text NOT NULL,
	`mode` text NOT NULL,
	`started_at` integer NOT NULL,
	`ended_at` integer,
	`cycles` integer DEFAULT 0 NOT NULL,
	`notes` text,
	`productivity_rating` text
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`priority` text NOT NULL,
	`due_date` text,
	`project_id` integer,
	`completed` integer DEFAULT false NOT NULL,
	`completed_at` integer,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_xp` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`total_xp` integer DEFAULT 0 NOT NULL,
	`current_streak` integer DEFAULT 0 NOT NULL,
	`longest_streak` integer DEFAULT 0 NOT NULL,
	`last_active_date` text
);
--> statement-breakpoint
CREATE TABLE `water_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`glasses` integer NOT NULL,
	`date` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workout_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`duration_minutes` integer NOT NULL,
	`notes` text,
	`date` text NOT NULL
);
