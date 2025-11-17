-- Init SQL for saas scaffold
-- This file will be executed by the MySQL container on first initialization

USE saas;

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(200) NOT NULL,
  password VARCHAR(200) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  role VARCHAR(255),
  company_id INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert a demo user (password stored in plain here — change for real use).
-- Insert an admin user (password: Admin123! — stored as bcrypt hash)
INSERT INTO users (email, password, active, role, company_id) VALUES
('admin@local', '$2b$10$gCAe0atDzgkQ9BvQh4HXp.cd3jDlIIoRITVMdU0CFkLYauSTEEse6', TRUE, 'admin', NULL);
