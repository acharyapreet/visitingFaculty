-- ================================================================
-- STEP 1: CHECK WHAT ALREADY EXISTS IN YOUR DB
-- Run these SELECTs first to get real IDs
-- ================================================================

-- See all faculty users
SELECT user_id, full_name, email, uvfin FROM users WHERE role = 'faculty';

-- See all courses
SELECT course_id, course_name, program_incharge FROM courses;

-- See bills already in DB
SELECT bill_id, user_id, month, year, total_amount FROM bills;


-- ================================================================
-- STEP 2: INSERT FACULTY USERS (if not already present)
-- Password = "Faculty@123"
-- ================================================================

INSERT INTO users (role, email, password_hash, full_name, phone_number, address, qualification, aadhaar_no, account_no, bank_name, ifsc_code, pan_card_no, uvfin, is_approved, is_active, created_at, updated_at)
VALUES ('faculty', 'pallavi.pandey@iips.ac.in', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh32', 'Ms. Pallavi Pandey', '9876543210', 'Indore, MP', 'M.Tech CS', '111122223333', '10010000001', 'State Bank of India', 'SBIN0001234', 'PANDP1234A', 'VF-2024-101', TRUE, TRUE, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (role, email, password_hash, full_name, phone_number, address, qualification, aadhaar_no, account_no, bank_name, ifsc_code, pan_card_no, uvfin, is_approved, is_active, created_at, updated_at)
VALUES ('faculty', 'divya.dembla@iips.ac.in', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh32', 'Dr. Divya Dembla', '9876543211', 'Indore, MP', 'Ph.D CS', '222233334444', '10010000002', 'State Bank of India', 'SBIN0001234', 'DEMBD1234B', 'VF-2024-102', TRUE, TRUE, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (role, email, password_hash, full_name, phone_number, address, qualification, aadhaar_no, account_no, bank_name, ifsc_code, pan_card_no, uvfin, is_approved, is_active, created_at, updated_at)
VALUES ('faculty', 'anil.gupta@iips.ac.in', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh32', 'Dr. Anil Gupta', '9876543212', 'Indore, MP', 'Ph.D IT', '333344445555', '10010000003', 'State Bank of India', 'SBIN0001234', 'GUPTA1234C', 'VF-2024-103', TRUE, TRUE, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (role, email, password_hash, full_name, phone_number, address, qualification, aadhaar_no, account_no, bank_name, ifsc_code, pan_card_no, uvfin, is_approved, is_active, created_at, updated_at)
VALUES ('faculty', 'rama.nair@iips.ac.in', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh32', 'Dr. Rama Nair', '9876543213', 'Indore, MP', 'Ph.D Maths', '444455556666', '10010000004', 'State Bank of India', 'SBIN0001234', 'NAIRR1234D', 'VF-2024-104', TRUE, TRUE, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (role, email, password_hash, full_name, phone_number, address, qualification, aadhaar_no, account_no, bank_name, ifsc_code, pan_card_no, uvfin, is_approved, is_active, created_at, updated_at)
VALUES ('faculty', 'priya.jain@iips.ac.in', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh32', 'Ms. Priya Jain', '9876543214', 'Indore, MP', 'M.Sc Physics', '555566667777', '10010000005', 'State Bank of India', 'SBIN0001234', 'JAINP1234E', 'VF-2024-105', TRUE, TRUE, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Check what user_ids were created:
SELECT user_id, full_name FROM users WHERE email IN (
  'pallavi.pandey@iips.ac.in',
  'divya.dembla@iips.ac.in',
  'anil.gupta@iips.ac.in',
  'rama.nair@iips.ac.in',
  'priya.jain@iips.ac.in'
);


-- ================================================================
-- STEP 3: INSERT BILLS
-- ⚠️  REPLACE user_id values below with ACTUAL IDs from Step 2 !!
-- Example: if pallavi.pandey has user_id = 12, use 12 below
-- ================================================================

-- Bill for Ms. Pallavi Pandey  (REPLACE 101 with real user_id)
INSERT INTO bills (user_id, month, year, total_hours, total_amount, amount_in_words, bill_date, pdf_path, generated_at)
VALUES (101, 'July', 2026, 11.00, 4400.00, 'Four thousand four hundred rupees only', '2026-07-31', NULL, NOW());

-- Bill for Dr. Divya Dembla  (REPLACE 102 with real user_id)
INSERT INTO bills (user_id, month, year, total_hours, total_amount, amount_in_words, bill_date, pdf_path, generated_at)
VALUES (102, 'July', 2026, 8.00, 6400.00, 'Six thousand four hundred rupees only', '2026-07-31', NULL, NOW());

-- Bill for Dr. Anil Gupta  (REPLACE 103 with real user_id)
INSERT INTO bills (user_id, month, year, total_hours, total_amount, amount_in_words, bill_date, pdf_path, generated_at)
VALUES (103, 'July', 2026, 14.00, 5600.00, 'Five thousand six hundred rupees only', '2026-07-31', NULL, NOW());

-- Bill for Dr. Rama Nair  (REPLACE 104 with real user_id)
INSERT INTO bills (user_id, month, year, total_hours, total_amount, amount_in_words, bill_date, pdf_path, generated_at)
VALUES (104, 'July', 2026, 8.00, 6400.00, 'Six thousand four hundred rupees only', '2026-07-31', NULL, NOW());

-- Bill for Ms. Priya Jain  (REPLACE 105 with real user_id)
INSERT INTO bills (user_id, month, year, total_hours, total_amount, amount_in_words, bill_date, pdf_path, generated_at)
VALUES (105, 'July', 2026, 11.00, 4400.00, 'Four thousand four hundred rupees only', '2026-07-31', NULL, NOW());

-- Check inserted bills and get bill_ids:
SELECT bill_id, user_id, month, year, total_amount FROM bills WHERE month = 'July' AND year = 2026;


-- ================================================================
-- STEP 4: INSERT BILL DETAILS
-- ⚠️  REPLACE bill_id values below with ACTUAL IDs from Step 3 !!
-- ⚠️  course_name MUST match exactly what is in your courses table
--     Run: SELECT course_name FROM courses;  to confirm spelling
-- ================================================================

-- Pallavi Pandey — Semester 1  (REPLACE bill_id = 201)
INSERT INTO bill_details (bill_id, attendance_date, course_name, semester_number, section_name, subject_code, subject_name, hours, rate_per_hour, amount)
VALUES (201, '2026-07-05', 'M. Tech. (IT) 5 Years', 1, 'A', 'MIT101', 'Advanced Algorithms', 11.00, 400.00, 4400.00);

-- Divya Dembla — Semester 1  (REPLACE bill_id = 202)
INSERT INTO bill_details (bill_id, attendance_date, course_name, semester_number, section_name, subject_code, subject_name, hours, rate_per_hour, amount)
VALUES (202, '2026-07-05', 'M. Tech. (IT) 5 Years', 1, 'A', 'MIT102', 'Data Structures & Algorithms', 8.00, 800.00, 6400.00);

-- Anil Gupta — Semester 3  (REPLACE bill_id = 203)
INSERT INTO bill_details (bill_id, attendance_date, course_name, semester_number, section_name, subject_code, subject_name, hours, rate_per_hour, amount)
VALUES (203, '2026-07-06', 'M. Tech. (IT) 5 Years', 3, 'A', 'MIT301', 'Machine Learning', 14.00, 400.00, 5600.00);

-- Rama Nair — Semester 3  (REPLACE bill_id = 204)
INSERT INTO bill_details (bill_id, attendance_date, course_name, semester_number, section_name, subject_code, subject_name, hours, rate_per_hour, amount)
VALUES (204, '2026-07-06', 'M. Tech. (IT) 5 Years', 3, 'A', 'MIT302', 'Database Management Systems', 8.00, 800.00, 6400.00);

-- Priya Jain — Semester 9  (REPLACE bill_id = 205)
INSERT INTO bill_details (bill_id, attendance_date, course_name, semester_number, section_name, subject_code, subject_name, hours, rate_per_hour, amount)
VALUES (205, '2026-07-07', 'M. Tech. (IT) 5 Years', 9, 'A', 'MIT901', 'Research Methodology', 11.00, 400.00, 4400.00);


-- ================================================================
-- STEP 5: VERIFY — Run this to confirm everything is correct
-- ================================================================

SELECT
    bd.detail_id,
    u.full_name          AS faculty_name,
    b.month,
    b.year,
    bd.course_name,
    bd.semester_number   AS semester,
    bd.subject_name,
    bd.amount
FROM bill_details bd
JOIN bills b ON b.bill_id = bd.bill_id
JOIN users u ON u.user_id = b.user_id
WHERE b.month = 'July' AND b.year = 2026
ORDER BY bd.semester_number, u.full_name;

-- Expected result:
-- Sem 1: Pallavi (4400) + Divya (6400)
-- Sem 3: Anil (5600)   + Rama  (6400)
-- Sem 9: Priya (4400)
-- GRAND TOTAL = 27200
