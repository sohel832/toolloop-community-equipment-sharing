USE toolloop;

-- Clear previous data in correct reverse FK order
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE payments;
TRUNCATE TABLE ratings;
TRUNCATE TABLE bookings;
TRUNCATE TABLE availability;
TRUNCATE TABLE items;
TRUNCATE TABLE user_community;
TRUNCATE TABLE communities;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insert Users
INSERT INTO users (user_id, name, email, password_hash, role, phone, address) VALUES
(1, 'Sohel M Chapparband', 'sohel@pesu.edu', 'hash_sohel_826', 'admin', '+91 98451 12345', 'PES University RR Campus, Bangalore'),
(2, 'Shreyas Bellad', 'shreyas@pesu.edu', 'hash_shreyas_824', 'admin', '+91 98452 67890', 'Banashankari 3rd Stage, Bangalore'),
(3, 'Priya Sharma', 'priya.sharma@example.com', 'hash_priya_pass', 'member', '+91 98765 43210', 'Indiranagar 100ft Road, Bangalore'),
(4, 'Rahul Verma', 'rahul.v@example.com', 'hash_rahul_pass', 'member', '+91 91234 56789', 'Koramangala 4th Block, Bangalore'),
(5, 'Ananya Iyer', 'ananya.iyer@example.com', 'hash_ananya_pass', 'member', '+91 97654 32109', 'Whitefield Main Road, Bangalore'),
(6, 'Vikram Rao', 'vikram.rao@example.com', 'hash_vikram_pass', 'member', '+91 94481 22334', 'Malleshwaram 8th Cross, Bangalore');

-- 2. Insert Communities
INSERT INTO communities (community_id, name, type) VALUES
(1, 'PES University Campus Makers', 'College Campus'),
(2, 'Indiranagar Urban Gardeners & DIY', 'Neighborhood'),
(3, 'Koramangala Tech & Tools Hub', 'Apartment Complex'),
(4, 'Whitefield Woodworking & Auto Collective', 'Maker Space');

-- 3. Insert User-Community Memberships
INSERT INTO user_community (user_id, community_id) VALUES
(1, 1),
(1, 2),
(2, 1),
(2, 3),
(3, 2),
(3, 1),
(4, 3),
(4, 4),
(5, 4),
(6, 1),
(6, 2);

-- 4. Insert Items
INSERT INTO items (item_id, owner_id, category, title, description, item_condition, deposit_amount, is_active) VALUES
(1, 1, 'Power Tools', 'Bosch Professional Cordless Impact Drill (18V)', 'Heavy duty cordless drill with brushless motor, 2 batteries, charger and 24-piece bit set.', 'Like New', 1500.00, true),
(2, 1, 'Gardening', 'Karcher High-Pressure Washer K 3.450', 'Compact 120 bar pressure washer ideal for cleaning driveways, patio tiles, and vehicles.', 'Good', 2000.00, true),
(3, 2, 'Woodworking', 'DeWalt 7-1/4 Inch Circular Saw', 'Precision laser guide circular saw with 5500 RPM motor for clean rip and cross cuts in timber.', 'Good', 1800.00, true),
(4, 2, 'Electronics', 'Sony 4K Portable Projector (3200 Lumens)', 'Bright native 4K projector with HDMI/WiFi input, tripod mount, and 100-inch portable screen.', 'Like New', 3500.00, true),
(5, 3, 'Outdoor & Camping', 'Decathlon Quechua 4-Person Waterproof Tent', 'Quick-pitch dome tent with blackout fresh-and-black fabric, includes ground tarp and pegs.', 'Like New', 1200.00, true),
(6, 4, 'Power Tools', 'Makita Random Orbit Sander (300W)', 'Dual action palm sander with dust extraction bag and assorted 80 to 400 grit sanding discs.', 'Good', 800.00, true),
(7, 5, 'Automotive', 'Autel MaxiCOM OBD2 Diagnostic Scanner', 'Professional car diagnostic code reader for engine, ABS, airbag, and real-time live sensor data.', 'Like New', 2200.00, true),
(8, 6, 'Gardening', 'Greenworks 40V Cordless Lawn Mower', 'Quiet electric mower with 40cm cutting width and 50L grass catcher. Battery included.', 'Fair', 2500.00, true);

-- 5. Insert Availability Schedules
INSERT INTO availability (availability_id, item_id, start_date, end_date, status) VALUES
(1, 1, '2026-11-01', '2026-12-31', 'available'),
(2, 2, '2026-11-01', '2026-11-20', 'available'),
(3, 2, '2026-11-21', '2026-11-25', 'reserved'),
(4, 3, '2026-11-05', '2026-12-15', 'available'),
(5, 4, '2026-11-01', '2026-12-31', 'available'),
(6, 5, '2026-11-10', '2026-11-30', 'available'),
(7, 6, '2026-11-01', '2026-12-31', 'available'),
(8, 7, '2026-11-01', '2026-12-31', 'available'),
(9, 8, '2026-11-01', '2026-11-18', 'available');

-- 6. Insert Bookings
INSERT INTO bookings (booking_id, item_id, borrower_id, lender_id, start_date, end_date, status, deposit_held) VALUES
(1, 1, 3, 1, '2026-10-15', '2026-10-18', 'completed', 1500.00),
(2, 3, 4, 2, '2026-10-20', '2026-10-23', 'completed', 1800.00),
(3, 2, 5, 1, '2026-11-21', '2026-11-25', 'approved', 2000.00),
(4, 4, 6, 2, '2026-11-15', '2026-11-17', 'requested', 3500.00),
(5, 5, 2, 3, '2026-11-12', '2026-11-14', 'requested', 1200.00);

-- 7. Insert Ratings
INSERT INTO ratings (rating_id, booking_id, rater_id, ratee_id, score, comment) VALUES
(1, 1, 3, 1, 5, 'Bosch impact drill was in mint condition! Sohel explained how to use the hammer mode, saved me buying an expensive tool.'),
(2, 1, 1, 3, 5, 'Priya returned the drill on time and cleaned all the bits. Highly responsible borrower!'),
(3, 2, 4, 2, 5, 'Shreyas provided the saw with a brand new fine-tooth blade. Great community member!'),
(4, 2, 2, 4, 4, 'Returned smoothly as agreed. Would gladly lend to Rahul again.');

-- 8. Insert Payments
INSERT INTO payments (payment_id, booking_id, amount, status, method) VALUES
(1, 1, 1500.00, 'refunded', 'UPI'),
(2, 2, 1800.00, 'refunded', 'UPI'),
(3, 3, 2000.00, 'held', 'Credit Card'),
(4, 4, 3500.00, 'pending', 'UPI'),
(5, 5, 1200.00, 'pending', 'Net Banking');
