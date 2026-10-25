CREATE TABLE `__new_tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`priority` text NOT NULL,
	`due_date` text,
	`tags` text,
	`completed` integer DEFAULT false NOT NULL,
	`completed_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_tasks`(`id`, `title`, `priority`, `due_date`, `tags`, `completed`, `completed_at`) SELECT `id`, `title`, `priority`, `due_date`, NULL, `completed`, `completed_at` FROM `tasks`;
--> statement-breakpoint
DROP TABLE `tasks`;
--> statement-breakpoint
ALTER TABLE `__new_tasks` RENAME TO `tasks`;
--> statement-breakpoint
DROP TABLE `projects`;
