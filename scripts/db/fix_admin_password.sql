-- Fix admin password
UPDATE users 
SET password = '$2b$10$/1bVm4n8RpXWZI87sNHqDu8HxRzDilVyG08N2GgMi/b9ErCHXLon6'
WHERE email = 'admin@local';

SELECT id, email, role, active, 
       SUBSTRING(password, 1, 20) as password_prefix 
FROM users 
WHERE email = 'admin@local';
