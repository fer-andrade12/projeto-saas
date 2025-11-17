-- Add billing_period column to subscription_plans table
ALTER TABLE subscription_plans 
ADD COLUMN billing_period ENUM('monthly', 'quarterly', 'yearly') 
DEFAULT 'monthly' 
AFTER price;

-- Update existing plans to have monthly period
UPDATE subscription_plans 
SET billing_period = 'monthly' 
WHERE billing_period IS NULL;
