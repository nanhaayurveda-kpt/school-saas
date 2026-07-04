CREATE TABLE `admission_applications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`dob` text,
	`applying_class` text NOT NULL,
	`mother_name` text NOT NULL,
	`father_name` text,
	`guardian_name` text,
	`occupation` text,
	`address` text NOT NULL,
	`phone` text NOT NULL,
	`alt_phone` text,
	`religion` text NOT NULL,
	`caste` text NOT NULL,
	`previous_school` text,
	`transport_required` integer DEFAULT 0,
	`sibling_info` text,
	`status` text DEFAULT 'pending',
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE TABLE `attendance` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_id` integer,
	`date` text NOT NULL,
	`status` text DEFAULT 'na' NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`alert_sent` integer DEFAULT 0,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uniq_attendance_day` ON `attendance` (`student_id`,`date`);--> statement-breakpoint
CREATE TABLE `certificates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_id` integer,
	`cert_type` text NOT NULL,
	`issue_date` text NOT NULL,
	`serial_no` text,
	`reason` text,
	`last_class` text,
	`last_exam_passed` text,
	`conduct` text DEFAULT 'Good',
	`custom_content` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `exams` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`class` text NOT NULL,
	`subject` text NOT NULL,
	`exam_date` text NOT NULL,
	`exam_type` text DEFAULT 'unit',
	`academic_year` text,
	`max_marks` integer DEFAULT 100 NOT NULL,
	`passing_marks` integer DEFAULT 33 NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE TABLE `fee_concessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_id` integer,
	`reason` text,
	`discount_type` text DEFAULT 'amount' NOT NULL,
	`discount_value` integer NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `fee_package_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`package_id` integer NOT NULL,
	`fee_type` text NOT NULL,
	`amount` integer NOT NULL,
	FOREIGN KEY (`package_id`) REFERENCES `fee_packages`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `fee_packages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`class` text NOT NULL,
	`academic_year` text NOT NULL,
	`total_amount` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uniq_fee_package` ON `fee_packages` (`class`,`academic_year`);--> statement-breakpoint
CREATE TABLE `fee_payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`fee_id` integer NOT NULL,
	`student_id` integer NOT NULL,
	`amount` integer NOT NULL,
	`payment_mode` text DEFAULT 'cash' NOT NULL,
	`paid_date` integer NOT NULL,
	`receipt_no` text,
	`note` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	FOREIGN KEY (`fee_id`) REFERENCES `fees`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `fee_structures` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`class` text NOT NULL,
	`fee_type` text DEFAULT 'monthly' NOT NULL,
	`amount` integer NOT NULL,
	`academic_year` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE TABLE `fees` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_id` integer,
	`amount` integer NOT NULL,
	`fee_type` text DEFAULT 'monthly',
	`academic_year` text,
	`month` text,
	`due_date` integer NOT NULL,
	`paid_date` integer,
	`status` text DEFAULT 'pending',
	`receipt_no` text,
	`paid_amount` integer DEFAULT 0,
	`last_reminder_at` integer,
	`reminder_count` integer DEFAULT 0,
	`auto_late` integer DEFAULT 0,
	`discount` integer DEFAULT 0,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uniq_fees_period` ON `fees` (`student_id`,`month`,`academic_year`,`fee_type`);--> statement-breakpoint
CREATE TABLE `homeworks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`teacher_id` integer,
	`class` text NOT NULL,
	`section` text,
	`subject` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`due_date` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `notices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`category` text DEFAULT 'general',
	`priority` text DEFAULT 'normal',
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE TABLE `parents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_id` integer,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text,
	`password` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `period_timings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`period_no` integer NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`label` text DEFAULT 'teaching',
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE TABLE `results` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`exam_id` integer,
	`student_id` integer,
	`marks_obtained` integer NOT NULL,
	`grade` text,
	`remarks` text,
	`academic_year` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `school_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`school_name` text NOT NULL,
	`address` text NOT NULL,
	`phone` text NOT NULL,
	`email` text NOT NULL,
	`principal_name` text NOT NULL,
	`affiliation_no` text,
	`school_code` text,
	`logo_url` text NOT NULL,
	`upi_id` text,
	`qr_code_url` text,
	`principal_signature_url` text NOT NULL,
	`late_fee_amount` integer DEFAULT 0,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE TABLE `student_transport` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_id` integer,
	`transport_id` integer,
	`academic_year` text,
	`joined_date` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`transport_id`) REFERENCES `transport`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`class` text NOT NULL,
	`section` text,
	`roll_number` text,
	`admission_no` text,
	`pen` text,
	`photo_url` text,
	`gender` text,
	`dob` text,
	`religion` text,
	`caste` text,
	`aadhaar` text,
	`address` text,
	`father_name` text,
	`mother_name` text,
	`guardian_name` text,
	`phone` text,
	`alt_phone` text,
	`academic_year` text,
	`admission_date` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uniq_students_roll` ON `students` (`class`,`section`,`roll_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `uniq_students_admission` ON `students` (`admission_no`);--> statement-breakpoint
CREATE TABLE `teacher_attendance` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`teacher_id` integer,
	`date` text NOT NULL,
	`status` text DEFAULT 'na' NOT NULL,
	`note` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `teacher_subjects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`teacher_id` integer,
	`subject` text NOT NULL,
	`class` text NOT NULL,
	`section` text NOT NULL,
	FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `teachers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`qualification` text,
	`phone` text,
	`email` text,
	`joining_date` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`pin` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `teachers_pin_unique` ON `teachers` (`pin`);--> statement-breakpoint
CREATE TABLE `timetable` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`class` text NOT NULL,
	`day` text NOT NULL,
	`period` integer NOT NULL,
	`subject` text NOT NULL,
	`teacher_name` text,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE TABLE `transport` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`route_name` text NOT NULL,
	`stop_name` text NOT NULL,
	`monthly_fee` integer DEFAULT 0 NOT NULL,
	`discount` integer DEFAULT 0 NOT NULL,
	`driver_name` text,
	`vehicle_no` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`avatar` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);