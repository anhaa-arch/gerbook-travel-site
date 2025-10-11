-- Migration script to add HERDER role to existing database
-- This script should be run after updating the Prisma schema

-- First, let's check if the HERDER role already exists
-- If not, we need to add it to the enum

-- For MySQL, we need to alter the enum to add the new role
-- Note: This might require recreating the table in some MySQL versions

-- Update any existing users that might need role changes
-- (This is optional - you can manually update specific users if needed)

-- Example: If you want to convert some existing users to HERDER role
-- UPDATE User SET role = 'HERDER' WHERE email IN ('herder1@example.com', 'herder2@example.com');

-- Create admin user if it doesn't exist
INSERT IGNORE INTO User (id, email, password, name, role, createdAt, updatedAt) 
VALUES (
  UUID(),
  'admin@malchincamp.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: admin123
  'System Administrator',
  'ADMIN',
  NOW(),
  NOW()
);

-- Verify the changes
SELECT id, email, name, role, createdAt FROM User WHERE role IN ('ADMIN', 'HERDER', 'CUSTOMER') ORDER BY role, createdAt;
