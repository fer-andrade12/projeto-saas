-- Seed demo data for admin dashboard
USE saas;

-- Companies
INSERT INTO companies (name, email, api_key, active) VALUES
('Tech Store Inc', 'contact@techstore.com', 'sk_demo_techstore_12345', 1),
('Fashion Boutique', 'hello@fashionboutique.com', 'sk_demo_fashion_67890', 1);

-- Campaigns
INSERT INTO campaigns (company_id, name, description, start_date, end_date, active, total_coupons, redeemed_coupons) VALUES
(1, 'Black Friday 2025', '50% off all electronics', '2025-11-20', '2025-11-30', 1, 100, 15),
(1, 'Welcome Discount', 'Get 10% off your first purchase', '2025-01-01', '2025-12-31', 1, 500, 87),
(2, 'Spring Sale', '30% off spring collection', '2025-03-01', '2025-04-30', 1, 200, 45);

-- Coupons (sample)
INSERT INTO coupons (campaign_id, code, discount_value, is_redeemed, redeemed_at, redeemed_by) VALUES
(1, 'BF2025ABC', 50.00, 1, '2025-11-16 10:30:00', 'john@example.com'),
(1, 'BF2025DEF', 50.00, 0, NULL, NULL),
(2, 'WELCOME10A', 10.00, 1, '2025-11-15 14:20:00', 'alice@example.com'),
(2, 'WELCOME10B', 10.00, 0, NULL, NULL),
(3, 'SPRING30XYZ', 30.00, 1, '2025-03-10 09:15:00', 'bob@example.com');

-- End Customers
INSERT INTO end_customers (company_id, name, email, phone) VALUES
(1, 'John Doe', 'john@example.com', '+1234567890'),
(1, 'Alice Smith', 'alice@example.com', '+1987654321'),
(2, 'Bob Johnson', 'bob@example.com', '+1122334455'),
(2, 'Carol White', 'carol@example.com', '+1555666777');
