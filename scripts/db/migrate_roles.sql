-- Update existing users to new simplified roles
UPDATE users SET role = 'company' WHERE role IN ('company_admin', 'company_user');
UPDATE users SET role = 'super_admin' WHERE email = 'admin@local';
UPDATE users SET role = 'super_admin' WHERE email = 'superadmin@saas.local';

-- Ensure all test users are properly set
UPDATE users SET role = 'company' WHERE role IS NULL OR role = 'user';
