-- ==============================================================================
-- DATASTRAW SMART ROSTER MANAGEMENT SYSTEM
-- PostgreSQL / Supabase Relational Seed Data
-- 36 Staff, 15 Brands, 4 Pods, 4 Pod Leads, 4 Processes
-- ==============================================================================

-- 1. Insert Operational Pods
INSERT INTO pods (id, name, description) VALUES
('pod-alpha', 'Pod Alpha (Scale D2C)', 'High-volume consumer brands and rapid omni-channel scaling.'),
('pod-beta', 'Pod Beta (Lifestyle & Fashion)', 'Premium apparel, sustainable fashion, and lifestyle merchandising.'),
('pod-gamma', 'Pod Gamma (Health & Wellness)', 'Nutraceuticals, organic supplements, and pet health products.'),
('pod-delta', 'Pod Delta (Tech & Home Goods)', 'Smart consumer electronics, home automation, and kitchenware.');

-- 2. Insert Processes
INSERT INTO processes (id, code, name, description, color) VALUES
('CS', 'CS', 'Customer Support', 'Frontline live chat, email resolution, and omnichannel ticket triage.', '#0284c7'),
('ACC', 'ACC', 'Abandoned Cart Conversions', 'Outbound recovery, WhatsApp nudges, and promotional discount recovery.', '#8b5cf6'),
('RET', 'RET', 'Customer Retention & VIP', 'High-LTV subscription retention, proactive churn prevention, and VIP tier care.', '#10b981'),
('NDR', 'NDR', 'Non-Delivery Report Management', 'Courier escalation, address re-verification, and RTO reduction workflows.', '#f59e0b');

-- 3. Insert 36 Employees (9 per pod, 4 Leads)
INSERT INTO employees (id, name, email, role, pod_id, skills, weekly_off_preference, weekly_offs_quota, avatar_color) VALUES
-- Pod Alpha (emp-01 to emp-09)
('emp-01', 'Aisha Sharma', 'aisha.sharma@datastraw.io', 'Pod Lead', 'pod-alpha', '{"CS","ACC","RET","NDR"}', 0, 4, '#0284c7'),
('emp-02', 'Kabir Mehta', 'kabir.mehta@datastraw.io', 'Operations Specialist', 'pod-alpha', '{"CS","ACC","NDR"}', 0, 4, '#0ea5e9'),
('emp-03', 'Ananya Rao', 'ananya.rao@datastraw.io', 'Operations Specialist', 'pod-alpha', '{"CS","ACC","RET"}', 0, 4, '#38bdf8'),
('emp-04', 'Devansh Joshi', 'devansh.joshi@datastraw.io', 'Operations Specialist', 'pod-alpha', '{"CS","NDR"}', 6, 4, '#06b6d4'),
('emp-05', 'Sneha Kulkarni', 'sneha.kulkarni@datastraw.io', 'Senior Specialist', 'pod-alpha', '{"CS","ACC","RET","NDR"}', 0, 4, '#0284c7'),
('emp-06', 'Arjun Nair', 'arjun.nair@datastraw.io', 'Operations Specialist', 'pod-alpha', '{"ACC","RET"}', 1, 4, '#0369a1'),
('emp-07', 'Tanvi Deshmukh', 'tanvi.deshmukh@datastraw.io', 'Operations Specialist', 'pod-alpha', '{"NDR","RET"}', 0, 4, '#075985'),
('emp-08', 'Rishi Kapoor', 'rishi.kapoor@datastraw.io', 'Operations Specialist', 'pod-alpha', '{"CS","NDR"}', 0, 4, '#0c4a6e'),
('emp-09', 'Meera Iyer', 'meera.iyer@datastraw.io', 'Operations Specialist', 'pod-alpha', '{"CS","ACC"}', 6, 4, '#38bdf8'),

-- Pod Beta (emp-10 to emp-18)
('emp-10', 'Rohan Verma', 'rohan.verma@datastraw.io', 'Pod Lead', 'pod-beta', '{"CS","ACC","RET","NDR"}', 0, 4, '#8b5cf6'),
('emp-11', 'Pooja Hegde', 'pooja.hegde@datastraw.io', 'Operations Specialist', 'pod-beta', '{"CS","ACC","RET","NDR"}', 0, 4, '#a78bfa'),
('emp-12', 'Aditya Sen', 'aditya.sen@datastraw.io', 'Operations Specialist', 'pod-beta', '{"CS","ACC","NDR"}', 0, 4, '#7c3aed'),
('emp-13', 'Kavya Menon', 'kavya.menon@datastraw.io', 'Operations Specialist', 'pod-beta', '{"CS","RET","NDR"}', 6, 4, '#6d28d9'),
('emp-14', 'Manish Pandey', 'manish.pandey@datastraw.io', 'Operations Specialist', 'pod-beta', '{"CS","ACC"}', 0, 4, '#c4b5fd'),
('emp-15', 'Neha Singhal', 'neha.singhal@datastraw.io', 'Operations Specialist', 'pod-beta', '{"ACC","RET"}', 0, 4, '#8b5cf6'),
('emp-16', 'Karan Chawla', 'karan.chawla@datastraw.io', 'Operations Specialist', 'pod-beta', '{"CS","NDR"}', 2, 4, '#7c3aed'),
('emp-17', 'Divya Nambiar', 'divya.nambiar@datastraw.io', 'Senior Specialist', 'pod-beta', '{"CS","ACC","RET","NDR"}', 0, 4, '#5b21b6'),
('emp-18', 'Varun Grover', 'varun.grover@datastraw.io', 'Operations Specialist', 'pod-beta', '{"CS","NDR"}', 0, 4, '#a78bfa'),

-- Pod Gamma (emp-19 to emp-27)
('emp-19', 'Priya Patel', 'priya.patel@datastraw.io', 'Pod Lead', 'pod-gamma', '{"CS","ACC","RET","NDR"}', 0, 4, '#10b981'),
('emp-20', 'Siddharth Basu', 'siddharth.basu@datastraw.io', 'Operations Specialist', 'pod-gamma', '{"CS","ACC","NDR"}', 0, 4, '#34d399'),
('emp-21', 'Ritika Sharma', 'ritika.sharma@datastraw.io', 'Operations Specialist', 'pod-gamma', '{"CS","RET"}', 6, 4, '#059669'),
('emp-22', 'Nikhil Saxena', 'nikhil.saxena@datastraw.io', 'Operations Specialist', 'pod-gamma', '{"CS","ACC","NDR"}', 0, 4, '#047857'),
('emp-23', 'Ishaan Gupta', 'ishaan.gupta@datastraw.io', 'Senior Specialist', 'pod-gamma', '{"CS","ACC"}', 0, 4, '#10b981'),
('emp-24', 'Bhavna Reddy', 'bhavna.reddy@datastraw.io', 'Operations Specialist', 'pod-gamma', '{"CS","ACC","RET"}', 3, 4, '#065f46'),
('emp-25', 'Kunal Ghosh', 'kunal.ghosh@datastraw.io', 'Operations Specialist', 'pod-gamma', '{"NDR","CS"}', 0, 4, '#6ee7b7'),
('emp-26', 'Shreya Roy', 'shreya.roy@datastraw.io', 'Operations Specialist', 'pod-gamma', '{"RET","ACC"}', 0, 4, '#34d399'),
('emp-27', 'Deepak Agarwal', 'deepak.agarwal@datastraw.io', 'Operations Specialist', 'pod-gamma', '{"CS","NDR"}', 6, 4, '#059669'),

-- Pod Delta (emp-28 to emp-36)
('emp-28', 'Vikram Malhotra', 'vikram.malhotra@datastraw.io', 'Pod Lead', 'pod-delta', '{"CS","ACC","RET","NDR"}', 0, 4, '#f59e0b'),
('emp-29', 'Payal Sengupta', 'payal.sengupta@datastraw.io', 'Operations Specialist', 'pod-delta', '{"CS","ACC","NDR"}', 0, 4, '#fbbf24'),
('emp-30', 'Gaurav Bhasin', 'gaurav.bhasin@datastraw.io', 'Operations Specialist', 'pod-delta', '{"CS","RET","NDR"}', 0, 4, '#d97706'),
('emp-31', 'Aakanksha Jain', 'aakanksha.jain@datastraw.io', 'Operations Specialist', 'pod-delta', '{"CS","ACC","RET"}', 6, 4, '#b45309'),
('emp-32', 'Rohit Namboodiri', 'rohit.namboodiri@datastraw.io', 'Senior Specialist', 'pod-delta', '{"CS","NDR"}', 0, 4, '#f59e0b'),
('emp-33', 'Simran Walia', 'simran.walia@datastraw.io', 'Operations Specialist', 'pod-delta', '{"CS","RET"}', 4, 4, '#fcd34d'),
('emp-34', 'Farhan Zaidi', 'farhan.zaidi@datastraw.io', 'Operations Specialist', 'pod-delta', '{"NDR","ACC"}', 0, 4, '#92400e'),
('emp-35', 'Jaspreet Kaur', 'jaspreet.kaur@datastraw.io', 'Operations Specialist', 'pod-delta', '{"CS","ACC"}', 0, 4, '#f59e0b'),
('emp-36', 'Tushar Dixit', 'tushar.dixit@datastraw.io', 'Operations Specialist', 'pod-delta', '{"CS","NDR","RET"}', 0, 4, '#d97706');

-- Update Pod Leads
UPDATE pods SET lead_id = 'emp-01' WHERE id = 'pod-alpha';
UPDATE pods SET lead_id = 'emp-10' WHERE id = 'pod-beta';
UPDATE pods SET lead_id = 'emp-19' WHERE id = 'pod-gamma';
UPDATE pods SET lead_id = 'emp-28' WHERE id = 'pod-delta';

-- 4. Insert 15 Client Brands (12 Single-Resource = 80%, 3 Multi-Resource = 20%)
INSERT INTO brands (id, code, name, pod_id, is_single_resource, color, description) VALUES
('brand-01', 'GLOW', 'GlowAura Skincare', 'pod-alpha', TRUE, '#0284c7', 'Clean clinical dermo-cosmetics with high daily inquiry volume.'),
('brand-02', 'BEAN', 'BeanCraft Specialty Coffee', 'pod-alpha', TRUE, '#0ea5e9', 'Artisanal single-origin beans and cold-brew subscription box.'),
('brand-03', 'URBN', 'UrbanKicks Footwear', 'pod-alpha', TRUE, '#38bdf8', 'Gen-Z streetwear sneakers with high NDR exchange spikes.'),
('brand-04', 'NUTRI', 'NutriPulse Superfoods', 'pod-beta', TRUE, '#8b5cf6', 'Ayurvedic effervescent nutrition and plant-based protein blends.'),
('brand-05', 'LUMI', 'Lumina Smart Lighting', 'pod-beta', TRUE, '#a78bfa', 'IoT ambient smart strips and automated home circadian bulbs.'),
('brand-06', 'ARTI', 'Artisanal Living', 'pod-beta', TRUE, '#7c3aed', 'Handcrafted stoneware ceramics and organic linen homeware.'),
('brand-07', 'PETS', 'PureBite Pet Nutrition', 'pod-gamma', TRUE, '#10b981', 'Freeze-dried raw pet treats with mandatory fresh batch dispatch tracking.'),
('brand-08', 'VELOX', 'Velox Esports Gear', 'pod-gamma', TRUE, '#059669', 'Custom mechanical keyboards and esports low-latency peripherals.'),
('brand-09', 'SILK', 'Silk & Saffron Luxury', 'pod-gamma', TRUE, '#34d399', 'Ultra-luxury saffron serums and botanical anti-aging elixirs.'),
('brand-10', 'PEAK', 'PeakDrift Technical Apparel', 'pod-delta', TRUE, '#f59e0b', 'All-weather mountain trekking gear and thermal activewear.'),
('brand-11', 'ZEN', 'ZenGarden Bonsai & Plants', 'pod-delta', TRUE, '#fbbf24', 'Live bonsai shipping, moisture guarantees, and plant wellness chat.'),
('brand-12', 'CLEAN', 'SparkleClean Living', 'pod-delta', TRUE, '#d97706', 'Zero-plastic household laundry sheets and probiotic surface cleansers.'),
('brand-13', 'AURA', 'AuraFit Activewear (Scale)', 'pod-alpha', FALSE, '#0284c7', 'High-volume international activewear; multi-agent team across CS, ACC, NDR.'),
('brand-14', 'NOVA', 'NovaGlow Electronics', 'pod-gamma', FALSE, '#10b981', 'High-ticket audio devices; 2 agents sharing CS and dedicated ACC.'),
('brand-15', 'PRIME', 'PrimeWave Direct Logistics', 'pod-delta', FALSE, '#f59e0b', '3-agent team with overlapping 365-day CS and dedicated NDR/Retention.');

-- 5. Insert Brand Process Operating Rules
INSERT INTO brand_processes (id, brand_id, process_id, operating_calendar, min_headcount, weekend_min_headcount) VALUES
('bp-01-cs', 'brand-01', 'CS', '365_days', 1, 1),
('bp-01-acc', 'brand-01', 'ACC', 'daily_no_holidays', 1, 1),
('bp-01-ndr', 'brand-01', 'NDR', 'standard_business', 1, 0),
('bp-02-cs', 'brand-02', 'CS', 'standard_business', 1, 0),
('bp-02-acc', 'brand-02', 'ACC', 'standard_business', 1, 0),
('bp-03-cs', 'brand-03', 'CS', 'daily_no_holidays', 1, 1),
('bp-03-ndr', 'brand-03', 'NDR', 'daily_no_holidays', 1, 1),
('bp-04-cs', 'brand-04', 'CS', '365_days', 1, 1),
('bp-04-acc', 'brand-04', 'ACC', 'daily_no_holidays', 1, 1),
('bp-05-cs', 'brand-05', 'CS', 'standard_business', 1, 0),
('bp-06-cs', 'brand-06', 'CS', 'standard_business', 1, 0),
('bp-07-cs', 'brand-07', 'CS', 'daily_no_holidays', 1, 1),
('bp-07-ndr', 'brand-07', 'NDR', 'standard_business', 1, 0),
('bp-08-cs', 'brand-08', 'CS', 'daily_no_holidays', 1, 1),
('bp-09-cs', 'brand-09', 'CS', 'standard_business', 1, 0),
('bp-09-ret', 'brand-09', 'RET', 'standard_business', 1, 0),
('bp-10-cs', 'brand-10', 'CS', 'daily_no_holidays', 1, 1),
('bp-11-cs', 'brand-11', 'CS', 'standard_business', 1, 0),
('bp-12-cs', 'brand-12', 'CS', 'standard_business', 1, 0),
('bp-13-cs', 'brand-13', 'CS', '365_days', 2, 1),
('bp-13-acc', 'brand-13', 'ACC', 'daily_no_holidays', 1, 1),
('bp-13-ndr', 'brand-13', 'NDR', 'standard_business', 1, 0),
('bp-14-cs', 'brand-14', 'CS', '365_days', 1, 1),
('bp-14-acc', 'brand-14', 'ACC', 'daily_no_holidays', 1, 0),
('bp-15-cs', 'brand-15', 'CS', '365_days', 1, 1),
('bp-15-ndr', 'brand-15', 'NDR', '365_days', 1, 1),
('bp-15-ret', 'brand-15', 'RET', 'standard_business', 1, 0);

-- 6. Insert Employee Brand Assignments
INSERT INTO employee_brand_assignments (id, employee_id, brand_id, process_id, is_primary) VALUES
('assign-01', 'emp-02', 'brand-01', 'CS', TRUE),
('assign-02', 'emp-02', 'brand-01', 'ACC', TRUE),
('assign-03', 'emp-02', 'brand-01', 'NDR', TRUE),
('assign-04', 'emp-03', 'brand-02', 'CS', TRUE),
('assign-05', 'emp-03', 'brand-02', 'ACC', TRUE),
('assign-06', 'emp-04', 'brand-03', 'CS', TRUE),
('assign-07', 'emp-04', 'brand-03', 'NDR', TRUE),
('assign-08', 'emp-11', 'brand-04', 'CS', TRUE),
('assign-09', 'emp-11', 'brand-04', 'ACC', TRUE),
('assign-10', 'emp-12', 'brand-05', 'CS', TRUE),
('assign-11', 'emp-13', 'brand-06', 'CS', TRUE),
('assign-12', 'emp-20', 'brand-07', 'CS', TRUE),
('assign-13', 'emp-20', 'brand-07', 'NDR', TRUE),
('assign-14', 'emp-21', 'brand-08', 'CS', TRUE),
('assign-15', 'emp-22', 'brand-09', 'CS', TRUE),
('assign-16', 'emp-22', 'brand-09', 'RET', TRUE),
('assign-17', 'emp-29', 'brand-10', 'CS', TRUE),
('assign-18', 'emp-30', 'brand-11', 'CS', TRUE),
('assign-19', 'emp-31', 'brand-12', 'CS', TRUE),
('assign-20', 'emp-05', 'brand-13', 'CS', TRUE),
('assign-21', 'emp-06', 'brand-13', 'CS', TRUE),
('assign-22', 'emp-06', 'brand-13', 'ACC', TRUE),
('assign-23', 'emp-07', 'brand-13', 'NDR', TRUE),
('assign-24', 'emp-23', 'brand-14', 'CS', TRUE),
('assign-25', 'emp-23', 'brand-14', 'ACC', TRUE),
('assign-26', 'emp-24', 'brand-14', 'CS', TRUE),
('assign-27', 'emp-32', 'brand-15', 'CS', TRUE),
('assign-28', 'emp-32', 'brand-15', 'NDR', TRUE),
('assign-29', 'emp-33', 'brand-15', 'CS', TRUE),
('assign-30', 'emp-33', 'brand-15', 'RET', TRUE),
('assign-31', 'emp-34', 'brand-15', 'NDR', TRUE);

-- 7. Insert Public Holidays
INSERT INTO public_holidays (id, date, name, description) VALUES
('ph-01', '2026-01-26', 'Republic Day', 'National Holiday'),
('ph-02', '2026-03-25', 'Holi', 'Festival Holiday'),
('ph-03', '2026-08-15', 'Independence Day', 'National Holiday'),
('ph-04', '2026-10-02', 'Gandhi Jayanti', 'National Holiday'),
('ph-05', '2026-11-01', 'Regional State Day', 'State Holiday (Observed in Nov)'),
('ph-06', '2026-11-14', 'Diwali Festival', 'Major Holiday (Observed in Nov)'),
('ph-07', '2026-12-25', 'Christmas Day', 'Global Holiday');

-- 8. Insert Initial Leaves
INSERT INTO employee_leaves (id, employee_id, start_date, end_date, leave_type, status, reason) VALUES
('leave-01', 'emp-02', '2026-11-10', '2026-11-11', 'planned_leave', 'approved', 'Family wedding commitment'),
('leave-02', 'emp-06', '2026-11-18', '2026-11-19', 'planned_leave', 'approved', 'Personal medical leave'),
('leave-03', 'emp-23', '2026-11-05', '2026-11-06', 'planned_leave', 'approved', 'Travel and relocation');

-- 9. Insert Initial Comp-Offs
INSERT INTO comp_offs (id, employee_id, date, earned_reason, status) VALUES
('comp-01', 'emp-05', '2026-11-16', 'Worked on Diwali Festival mandatory 365-day shift (2026-11-14)', 'approved');
