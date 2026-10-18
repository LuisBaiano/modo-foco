CREATE TABLE `routine_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`days_of_week` text NOT NULL,
	`track_km` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `routine_km_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`routine_item_id` integer NOT NULL,
	`date` text NOT NULL,
	`km` real NOT NULL,
	FOREIGN KEY (`routine_item_id`) REFERENCES `routine_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `routine_km_logs_item_id_date_unique` ON `routine_km_logs` (`routine_item_id`,`date`);