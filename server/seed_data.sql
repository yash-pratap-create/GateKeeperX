-- ============================================================
-- GateKeeperX  –  Seed Data (Departments + Resources)
-- Tables use manual PKs (no AUTO_INCREMENT)
-- ============================================================

USE gatekeeperx;

-- ─────────────────────────────────────────────
-- 1. DEPARTMENTS  (keep existing 1-4, add 5-14)
-- ─────────────────────────────────────────────
INSERT INTO department (department_id, department_name, department_head) VALUES
  (5,  'Information Technology',   'Dr. Kapoor'),
  (6,  'Artificial Intelligence',  'Dr. Nair'),
  (7,  'Data Science',             'Dr. Krishnan'),
  (8,  'Electrical Engineering',   'Dr. Iyer'),
  (9,  'Chemical Engineering',     'Dr. Banerjee'),
  (10, 'Biotechnology',            'Dr. Pillai'),
  (11, 'Physics',                  'Dr. Joshi'),
  (12, 'Mathematics',              'Dr. Menon'),
  (13, 'Management Studies',       'Dr. Agarwal'),
  (14, 'Architecture',             'Dr. Desai')
ON DUPLICATE KEY UPDATE
  department_name = VALUES(department_name),
  department_head  = VALUES(department_head);

-- ─────────────────────────────────────────────
-- 2. Update existing 4 resources with richer data
-- ─────────────────────────────────────────────
UPDATE resource SET resource_name = 'Advanced Computing Lab', type = 'Laboratory', location = 'Block D, Room 101', department_id = 1 WHERE resource_id = 1;
UPDATE resource SET resource_name = 'Main Seminar Hall',      type = 'Hall',       location = 'Ground Floor, Block A', department_id = 2 WHERE resource_id = 2;
UPDATE resource SET resource_name = 'Mechanical Workshop',    type = 'Workshop',   location = 'Block B, Ground Floor', department_id = 3 WHERE resource_id = 3;
UPDATE resource SET resource_name = 'Smart Projector Unit 1', type = 'Equipment',  location = 'Block A, Room 201',     department_id = 1 WHERE resource_id = 4;

-- ─────────────────────────────────────────────
-- 3. NEW RESOURCES (resource_id starts at 5)
-- ─────────────────────────────────────────────

-- ── CSE (dept 1) ──────────────────────────────
INSERT INTO resource (resource_id, resource_name, type, location, department_id) VALUES
  (5,  'Programming Lab 1',        'Laboratory', 'Block D, Room 102', 1),
  (6,  'Programming Lab 2',        'Laboratory', 'Block D, Room 103', 1),
  (7,  'Networking Lab',           'Laboratory', 'Block D, Room 104', 1),
  (8,  'Cyber Security Lab',       'Laboratory', 'Block D, Room 105', 1),
  (9,  'Software Testing Lab',     'Laboratory', 'Block D, Room 106', 1),
  (10, 'Conference Room – CSE',    'Hall',       'Block D, Room 201', 1),
  (11, 'Smart Projector Unit 2',   'Equipment',  'Block D, Room 201', 1),
  (12, '3D Printer Station',       'Equipment',  'Block D, Room 107', 1);

-- ── Electronics (dept 2) ──────────────────────
INSERT INTO resource (resource_id, resource_name, type, location, department_id) VALUES
  (13, 'Electronics Lab 1',        'Laboratory', 'Block C, Room 101', 2),
  (14, 'Electronics Lab 2',        'Laboratory', 'Block C, Room 102', 2),
  (15, 'VLSI Design Lab',          'Laboratory', 'Block C, Room 103', 2),
  (16, 'Embedded Systems Lab',     'Laboratory', 'Block C, Room 104', 2),
  (17, 'Signal Processing Lab',    'Laboratory', 'Block C, Room 105', 2),
  (18, 'Seminar Room – ECE',       'Hall',       'Block C, Room 201', 2),
  (19, 'Oscilloscope Bank',        'Equipment',  'Block C, Room 101', 2);

-- ── Mechanical (dept 3) ───────────────────────
INSERT INTO resource (resource_id, resource_name, type, location, department_id) VALUES
  (20, 'CAD Lab',                  'Laboratory', 'Block B, Room 101', 3),
  (21, 'CNC Machining Lab',        'Laboratory', 'Block B, Room 102', 3),
  (22, 'Fluid Mechanics Lab',      'Laboratory', 'Block B, Room 103', 3),
  (23, 'Thermodynamics Lab',       'Laboratory', 'Block B, Room 104', 3),
  (24, 'Robotics Arena',           'Laboratory', 'Block B, Room 105', 3),
  (25, 'Seminar Room – MECH',      'Hall',       'Block B, Room 201', 3),
  (26, 'CNC Machine Unit A',       'Equipment',  'Block B, Room 102', 3);

-- ── Civil (dept 4) ────────────────────────────
INSERT INTO resource (resource_id, resource_name, type, location, department_id) VALUES
  (27, 'Surveying Lab',            'Laboratory', 'Block E, Room 101', 4),
  (28, 'Soil Testing Lab',         'Laboratory', 'Block E, Room 102', 4),
  (29, 'Concrete Testing Lab',     'Laboratory', 'Block E, Room 103', 4),
  (30, 'Environmental Engg. Lab',  'Laboratory', 'Block E, Room 104', 4),
  (31, 'Drawing Hall',             'Hall',       'Block E, Room 201', 4),
  (32, 'Total Station Equipment',  'Equipment',  'Block E, Room 101', 4);

-- ── IT (dept 5) ───────────────────────────────
INSERT INTO resource (resource_id, resource_name, type, location, department_id) VALUES
  (33, 'Web Development Lab',      'Laboratory', 'Block F, Room 101', 5),
  (34, 'Cloud Computing Lab',      'Laboratory', 'Block F, Room 102', 5),
  (35, 'Database Lab',             'Laboratory', 'Block F, Room 103', 5),
  (36, 'Mobile App Dev Lab',       'Laboratory', 'Block F, Room 104', 5),
  (37, 'IT Seminar Hall',          'Hall',       'Block F, Room 201', 5),
  (38, 'Server Rack Unit – IT',    'Equipment',  'Block F, Room 105', 5);

-- ── AI (dept 6) ───────────────────────────────
INSERT INTO resource (resource_id, resource_name, type, location, department_id) VALUES
  (39, 'AI Research Lab',          'Laboratory', 'Block G, Room 101', 6),
  (40, 'Deep Learning Lab',        'Laboratory', 'Block G, Room 102', 6),
  (41, 'Computer Vision Lab',      'Laboratory', 'Block G, Room 103', 6),
  (42, 'NLP Research Studio',      'Laboratory', 'Block G, Room 104', 6),
  (43, 'GPU Compute Cluster',      'Equipment',  'Block G, Room 102', 6),
  (44, 'AI Seminar Hall',          'Hall',       'Block G, Room 201', 6);

-- ── Data Science (dept 7) ─────────────────────
INSERT INTO resource (resource_id, resource_name, type, location, department_id) VALUES
  (45, 'Data Analytics Lab',       'Laboratory', 'Block H, Room 101', 7),
  (46, 'Big Data Lab',             'Laboratory', 'Block H, Room 102', 7),
  (47, 'Statistics Lab',           'Laboratory', 'Block H, Room 103', 7),
  (48, 'Data Science Seminar Hall','Hall',        'Block H, Room 201', 7),
  (49, 'High-Perf. Workstations',  'Equipment',  'Block H, Room 101', 7);

-- ── Electrical (dept 8) ───────────────────────
INSERT INTO resource (resource_id, resource_name, type, location, department_id) VALUES
  (50, 'Power Systems Lab',        'Laboratory', 'Block I, Room 101', 8),
  (51, 'Control Systems Lab',      'Laboratory', 'Block I, Room 102', 8),
  (52, 'High Voltage Lab',         'Laboratory', 'Block I, Room 103', 8),
  (53, 'Electric Machines Lab',    'Laboratory', 'Block I, Room 104', 8),
  (54, 'Seminar Room – EEE',       'Hall',       'Block I, Room 201', 8),
  (55, 'Transformer Test Unit',    'Equipment',  'Block I, Room 103', 8);

-- ── Chemical Engg. (dept 9) ───────────────────
INSERT INTO resource (resource_id, resource_name, type, location, department_id) VALUES
  (56, 'Chemical Process Lab',     'Laboratory', 'Block J, Room 101', 9),
  (57, 'Reaction Engineering Lab', 'Laboratory', 'Block J, Room 102', 9),
  (58, 'Separation Process Lab',   'Laboratory', 'Block J, Room 103', 9),
  (59, 'Seminar Room – CHEM',      'Hall',       'Block J, Room 201', 9),
  (60, 'Distillation Column Unit', 'Equipment',  'Block J, Room 102', 9);

-- ── Biotechnology (dept 10) ───────────────────
INSERT INTO resource (resource_id, resource_name, type, location, department_id) VALUES
  (61, 'Microbiology Lab',         'Laboratory', 'Block K, Room 101', 10),
  (62, 'Biochemistry Lab',         'Laboratory', 'Block K, Room 102', 10),
  (63, 'Genetics Lab',             'Laboratory', 'Block K, Room 103', 10),
  (64, 'Bioprocess Engg. Lab',     'Laboratory', 'Block K, Room 104', 10),
  (65, 'PCR Machine Bay',          'Equipment',  'Block K, Room 103', 10),
  (66, 'BIO Seminar Hall',         'Hall',       'Block K, Room 201', 10);

-- ── Physics (dept 11) ────────────────────────
INSERT INTO resource (resource_id, resource_name, type, location, department_id) VALUES
  (67, 'Optics Lab',               'Laboratory', 'Block L, Room 101', 11),
  (68, 'Nuclear Physics Lab',      'Laboratory', 'Block L, Room 102', 11),
  (69, 'Solid State Physics Lab',  'Laboratory', 'Block L, Room 103', 11),
  (70, 'Astronomy Observatory',    'Laboratory', 'Rooftop Dome',      11),
  (71, 'Spectrometer Set',         'Equipment',  'Block L, Room 101', 11);

-- ── Shared / Common Facilities ────────────────
INSERT INTO resource (resource_id, resource_name, type, location, department_id) VALUES
  (72, 'Main Auditorium',          'Hall',       'Main Block, Ground Floor',  1),
  (73, 'Central Conference Hall',  'Hall',       'Main Block, 1st Floor',     1),
  (74, 'Examination Hall A',       'Hall',       'Exam Block, Ground Floor',  1),
  (75, 'Examination Hall B',       'Hall',       'Exam Block, 1st Floor',     1),
  (76, 'Library Reading Room',     'Hall',       'Library Block',            12),
  (77, 'Sports Complex Conf. Rm',  'Hall',       'Sports Block',             13),
  (78, 'Incubation Center Lab',    'Laboratory', 'Innovation Block, Rm 101',  6),
  (79, 'Maker Space / Fab Lab',    'Workshop',   'Innovation Block, Rm 102',  5),
  (80, 'Video Conferencing Suite', 'Equipment',  'Admin Block, Rm 301',      13),
  (81, 'Smart Board Unit',         'Equipment',  'Main Block, Rm 101',        1);
