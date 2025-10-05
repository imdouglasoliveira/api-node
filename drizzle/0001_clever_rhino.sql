ALTER TABLE `users` ADD `created_at` integer NOT NULL DEFAULT (strftime('%s', 'now'));--> statement-breakpoint
ALTER TABLE `users` ADD `updated_at` integer NOT NULL DEFAULT (strftime('%s', 'now'));