
DROP DATABASE IF EXISTS lifeline_db;
CREATE DATABASE lifeline_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lifeline_db;

-- Zillas (Districts) of Bangladesh
CREATE TABLE zillas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Thanas/Upazilas (Sub-districts)
CREATE TABLE thanas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    zilla_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (zilla_id) REFERENCES zillas(id) ON DELETE CASCADE,
    INDEX idx_zilla (zilla_id)
) ENGINE=InnoDB;

-- USER MANAGEMENT

-- Unified User Table with Dual Roles
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    
    -- Address
    address_thana INT NOT NULL,
    address_zilla INT NOT NULL,
    
    -- Blood Information
    blood_type ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    
    -- Role Flags (Dual Role Support)
    is_donor BOOLEAN DEFAULT FALSE,
    is_receiver BOOLEAN DEFAULT FALSE,
    is_staff BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    
    -- Staff Status
    staff_status ENUM('pending', 'approved', 'rejected') DEFAULT NULL,
    staff_role ENUM('doctor', 'organizer') DEFAULT NULL,
    
    -- Donor-specific
    points INT DEFAULT 0,
    last_donation_date DATE DEFAULT NULL,
    
    -- Account Status
    is_suspended BOOLEAN DEFAULT FALSE,
    suspension_reason TEXT DEFAULT NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (address_thana) REFERENCES thanas(id),
    FOREIGN KEY (address_zilla) REFERENCES zillas(id),
    
    INDEX idx_blood_type (blood_type),
    INDEX idx_is_donor (is_donor),
    INDEX idx_is_receiver (is_receiver),
    INDEX idx_location (address_zilla, address_thana),
    INDEX idx_email (email),
    INDEX idx_phone (phone)
) ENGINE=InnoDB;

-- BLOOD REQUEST MANAGEMENT

-- Blood Requests from Receivers
CREATE TABLE blood_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    receiver_id INT NOT NULL,
    
    -- Request Details
    blood_type ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    units INT NOT NULL DEFAULT 1,
    date_needed DATE NOT NULL,
    
    -- Location (can override user's default location)
    request_thana INT NOT NULL,
    request_zilla INT NOT NULL,
    
    -- Allocation
    allocated_donor_id INT DEFAULT NULL,
    
    -- Status Tracking
    status ENUM('pending', 'allocated', 'crossmatch_passed', 'crossmatch_failed', 'completed', 'cancelled') DEFAULT 'pending',
    crossmatch_status ENUM('pending', 'passed', 'failed') DEFAULT 'pending',
    verified_by_staff_id INT DEFAULT NULL,
    
    -- Notes
    notes TEXT DEFAULT NULL,
    cancellation_reason TEXT DEFAULT NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL DEFAULT NULL,
    
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (allocated_donor_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (verified_by_staff_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (request_thana) REFERENCES thanas(id),
    FOREIGN KEY (request_zilla) REFERENCES zillas(id),
    
    INDEX idx_status (status),
    INDEX idx_blood_type (blood_type),
    INDEX idx_location (request_zilla, request_thana),
    INDEX idx_receiver (receiver_id),
    INDEX idx_donor (allocated_donor_id),
    INDEX idx_date_needed (date_needed)
) ENGINE=InnoDB;

-- DONATION HISTORY

-- Completed Donations
CREATE TABLE donations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donor_id INT NOT NULL,
    request_id INT NOT NULL,
    donation_date DATE NOT NULL,
    units_donated INT NOT NULL DEFAULT 1,
    points_earned INT DEFAULT 10,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (request_id) REFERENCES blood_requests(id) ON DELETE CASCADE,
    
    INDEX idx_donor (donor_id),
    INDEX idx_donation_date (donation_date)
) ENGINE=InnoDB;

-- MESSAGING SYSTEM

-- Messages between Donor and Receiver for specific requests
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    from_user_id INT NOT NULL,
    to_user_id INT NOT NULL,
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (request_id) REFERENCES blood_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_request (request_id),
    INDEX idx_from_user (from_user_id),
    INDEX idx_to_user (to_user_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- CAMPAIGN MANAGEMENT

-- Blood Donation Campaigns
CREATE TABLE campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    location_zilla INT NOT NULL,
    location_thana INT DEFAULT NULL,
    
    -- Staff Requirements
    required_doctors INT DEFAULT 5,
    required_organizers INT DEFAULT 5,
    
    status ENUM('planned', 'active', 'completed', 'cancelled') DEFAULT 'planned',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (location_zilla) REFERENCES zillas(id),
    FOREIGN KEY (location_thana) REFERENCES thanas(id) ON DELETE SET NULL,
    
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB;

-- Staff-Campaign Assignments
CREATE TABLE staff_campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NOT NULL,
    campaign_id INT NOT NULL,
    role ENUM('doctor', 'organizer') NOT NULL,
    
    -- Request Status
    request_status ENUM('assigned', 'requested', 'exemption_requested', 'approved', 'rejected') DEFAULT 'assigned',
    points_earned INT DEFAULT 5,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_staff_campaign (staff_id, campaign_id),
    INDEX idx_staff (staff_id),
    INDEX idx_campaign (campaign_id)
) ENGINE=InnoDB;

-- AUDIT & LOGGING

-- System Logs for Critical Actions
CREATE TABLE logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) DEFAULT NULL,
    entity_id INT DEFAULT NULL,
    details TEXT DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- BLOOD STORAGE (Zilla-Based Inventory)

-- Blood Inventory per District
CREATE TABLE blood_storage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    zilla_id INT NOT NULL,
    blood_type ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    units_available INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (zilla_id) REFERENCES zillas(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_zilla_blood (zilla_id, blood_type),
    INDEX idx_zilla (zilla_id),
    INDEX idx_blood_type (blood_type)
) ENGINE=InnoDB;

-- Initialize Blood Storage for all 64 zillas and 8 blood types (512 rows)
INSERT INTO blood_storage (zilla_id, blood_type, units_available)
SELECT z.id, bt.blood_type, 0
FROM zillas z
CROSS JOIN (
    SELECT 'A+' as blood_type UNION ALL
    SELECT 'A-' UNION ALL
    SELECT 'B+' UNION ALL
    SELECT 'B-' UNION ALL
    SELECT 'AB+' UNION ALL
    SELECT 'AB-' UNION ALL
    SELECT 'O+' UNION ALL
    SELECT 'O-'
) bt
ORDER BY z.id, bt.blood_type;

