CREATE DATABASE IF NOT EXISTS odoo;
USE odoo;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'Dispatcher'
);

CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status ENUM('Active', 'In Shop', 'Available') NOT NULL DEFAULT 'Available',
    assigned_driver VARCHAR(100),
    next_maintenance DATE
);

-- Insert a mock user (using plain text passwords for simplicity in this prototype)
INSERT IGNORE INTO users (username, password_hash, role) VALUES ('admin', 'password123', 'Administrator');
INSERT IGNORE INTO users (username, password_hash, role) VALUES ('dispatcher1', 'dispatch123', 'Dispatcher');

-- Insert mock vehicles
INSERT IGNORE INTO vehicles (vehicle_id, name, type, status, assigned_driver, next_maintenance) VALUES 
('TRK-001', 'Freightliner Cascadia', 'Truck', 'Active', 'John Doe', '2026-08-15'),
('VAN-042', 'Ford Transit', 'Van', 'In Shop', 'Jane Smith', '2026-07-20'),
('TRK-002', 'Volvo VNL', 'Truck', 'Available', NULL, '2026-09-10'),
('VAN-043', 'Mercedes Sprinter', 'Van', 'Active', 'Mike Johnson', '2026-10-05'),
('TRK-003', 'Kenworth T680', 'Truck', 'Active', 'Sarah Williams', '2026-11-22');
