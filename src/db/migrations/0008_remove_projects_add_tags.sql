ALTER TABLE `tasks` DROP COLUMN `project_id`;
--> statement-breakpoint
ALTER TABLE `tasks` ADD `tags` text;
--> statement-breakpoint
DROP TABLE `projects`;
