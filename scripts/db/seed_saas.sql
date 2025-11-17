-- Seed initial subscription plans
INSERT INTO subscription_plans (name, type, price, description, max_campaigns, max_customers, max_emails_per_month, active, created_at, updated_at)
VALUES 
  ('Plano Básico', 'basic', '20.00', 'Ideal para pequenos negócios', 10, 1000, 5000, 1, NOW(), NOW()),
  ('Plano Padrão', 'standard', '50.00', 'Para empresas em crescimento', 50, 10000, 25000, 1, NOW(), NOW()),
  ('Plano Premium', 'premium', '100.00', 'Recursos ilimitados para grandes empresas', NULL, NULL, NULL, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE name=name;

-- Seed SaaS settings
INSERT INTO saas_settings (`key`, `value`, description, created_at)
VALUES 
  ('plans_visible', 'true', 'Toggle plans visibility for companies', NOW()),
  ('trial_days', '14', 'Default trial period in days', NOW()),
  ('allow_signups', 'true', 'Allow new company signups', NOW())
ON DUPLICATE KEY UPDATE `key`=`key`;

-- Create super admin user if not exists
-- Password: SuperAdmin123!
INSERT INTO users (email, password, name, active, role, company_id, created_at, updated_at)
SELECT 'superadmin@saas.local', '$2b$10$vLxKzqBFGOmZ8YJxJ5.4WOe3pT9VR4QqBKxKH7bPvL8tBGxzF4/Iu', 'Super Administrator', 1, 'super_admin', NULL, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'superadmin@saas.local'
);

-- Update existing admin@local to be super_admin as well
UPDATE users SET role = 'super_admin' WHERE email = 'admin@local';
