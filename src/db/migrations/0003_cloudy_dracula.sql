ALTER TABLE `user_xp` ADD `workout_streak` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `user_xp` ADD `longest_workout_streak` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `user_xp` ADD `last_workout_date` text;