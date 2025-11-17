-- Creates admin user for existing DB
USE saas;
INSERT INTO users (email, password, active, role, company_id) VALUES
( 'admin@local', '$2b$10$gCAe0atDzgkQ9BvQh4HXp.cd3jDlIIoRITVMdU0CFkLYauSTEEse6', 1, 'admin', NULL );
