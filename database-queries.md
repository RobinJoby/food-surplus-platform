# Food Surplus Platform - Database Query Reference

This file contains useful MySQL queries for exploring and managing the Food Surplus Platform database.

## Prerequisites
Make sure your MySQL container is running:
```bash
docker-compose up -d db
```

## 📊 Basic Table Overview Queries

### View All Tables
```bash
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "SHOW TABLES;"
```

### Table Structure Queries
```bash
# View users table structure
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "DESCRIBE users;"

# View food_items table structure
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "DESCRIBE food_items;"

# View pickup_requests table structure
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "DESCRIBE pickup_requests;"

# View notifications table structure
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "DESCRIBE notifications;"

# View verification_requests table structure
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "DESCRIBE verification_requests;"

# View complete table schema
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "SHOW CREATE TABLE users;"
```

## 👥 Users Table Queries

### View All Users
```bash
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "SELECT * FROM users;"
```

### View Users by Role
```bash
# View all donors
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "SELECT name, email, role, verified, address FROM users WHERE role = 'donor';"

# View all beneficiaries
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "SELECT name, email, role, verified, address FROM users WHERE role = 'beneficiary';"

# View all admins
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "SELECT name, email, role, verified FROM users WHERE role = 'admin';"
```

### User Statistics
```bash
# Count users by role
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "SELECT role, COUNT(*) as count FROM users GROUP BY role;"

# View verified vs unverified users
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "SELECT verified, COUNT(*) as count FROM users GROUP BY verified;"

# View verified organizations
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "SELECT name, email, role, address FROM users WHERE verified = TRUE;"
```

## 🍽️ Food Items Table Queries

### View All Food Items
```bash
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "SELECT * FROM food_items;"
```

### Food Items by Status
```bash
# View available food items
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "SELECT title, quantity, unit, expiry_date, status, location FROM food_items WHERE status = 'available';"

# View requested food items
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "SELECT title, quantity, unit, status, location FROM food_items WHERE status = 'requested';"

# View completed food donations
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "SELECT title, quantity, unit, status, location FROM food_items WHERE status = 'completed';"
```

### Food Items with Donor Information
```bash
# View food items with donor details
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "
SELECT 
    fi.title, 
    fi.quantity, 
    fi.unit, 
    fi.expiry_date, 
    fi.status,
    fi.location,
    u.name as donor_name,
    u.email as donor_email
FROM food_items fi 
JOIN users u ON fi.donor_id = u.id
ORDER BY fi.created_at DESC;"
```

### Food Items Statistics
```bash
# Count food items by status
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "SELECT status, COUNT(*) as count FROM food_items GROUP BY status;"

# Total quantity available
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "
SELECT 
    SUM(quantity) as total_servings_available 
FROM food_items 
WHERE status = 'available';"
```

## 📦 Pickup Requests Table Queries

### View All Pickup Requests
```bash
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "SELECT * FROM pickup_requests;"
```

### Pickup Requests with Details
```bash
# View pickup requests with food item and beneficiary details
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "
SELECT 
    pr.id,
    fi.title as food_item,
    fi.quantity,
    fi.unit,
    u.name as beneficiary_name,
    u.email as beneficiary_email,
    pr.status,
    pr.message,
    pr.requested_at
FROM pickup_requests pr
JOIN food_items fi ON pr.food_item_id = fi.id
JOIN users u ON pr.beneficiary_id = u.id
ORDER BY pr.requested_at DESC;"
```

### Pickup Requests by Status
```bash
# View pending pickup requests
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "
SELECT 
    pr.id,
    fi.title as food_item,
    u.name as beneficiary_name,
    pr.message,
    pr.requested_at
FROM pickup_requests pr
JOIN food_items fi ON pr.food_item_id = fi.id
JOIN users u ON pr.beneficiary_id = u.id
WHERE pr.status = 'pending';"

# View accepted pickup requests
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "SELECT * FROM pickup_requests WHERE status = 'accepted';"

# Count pickup requests by status
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "SELECT status, COUNT(*) as count FROM pickup_requests GROUP BY status;"
```

## 🔔 Notifications Table Queries

### View All Notifications
```bash
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "SELECT * FROM notifications;"
```

### Notifications with User Details
```bash
# View unread notifications
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "
SELECT 
    n.title,
    n.message,
    u.name as user_name,
    u.email as user_email,
    n.type,
    n.created_at
FROM notifications n
JOIN users u ON n.user_id = u.id
WHERE n.is_read = FALSE
ORDER BY n.created_at DESC;"

# View all notifications with user info
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "
SELECT 
    n.title,
    n.message,
    u.name as user_name,
    n.type,
    n.is_read,
    n.created_at
FROM notifications n
JOIN users u ON n.user_id = u.id
ORDER BY n.created_at DESC;"
```

### Notification Statistics
```bash
# Count notifications by type
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "SELECT type, COUNT(*) as count FROM notifications GROUP BY type;"

# Count read vs unread notifications
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "SELECT is_read, COUNT(*) as count FROM notifications GROUP BY is_read;"
```

## ✅ Verification Requests Table Queries

### View All Verification Requests
```bash
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "SELECT * FROM verification_requests;"
```

### Verification Requests with User Details
```bash
# View verification requests with user details
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "
SELECT 
    vr.organization_name,
    vr.organization_type,
    u.name as user_name,
    u.email as user_email,
    vr.status,
    vr.description,
    vr.submitted_at
FROM verification_requests vr
JOIN users u ON vr.user_id = u.id
ORDER BY vr.submitted_at DESC;"
```

### Verification Requests by Status
```bash
# View pending verification requests
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "
SELECT 
    vr.organization_name,
    vr.organization_type,
    u.name as user_name,
    u.email as user_email,
    vr.description,
    vr.submitted_at
FROM verification_requests vr
JOIN users u ON vr.user_id = u.id
WHERE vr.status = 'pending';"

# View approved organizations
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "
SELECT 
    vr.organization_name,
    vr.organization_type,
    u.name as user_name,
    vr.status
FROM verification_requests vr
JOIN users u ON vr.user_id = u.id
WHERE vr.status = 'approved';"

# Count verification requests by status
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "SELECT status, COUNT(*) as count FROM verification_requests GROUP BY status;"
```

## 📈 Analytics and Summary Queries

### Platform Statistics Overview
```bash
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "
SELECT 
    'Total Users' as metric, COUNT(*) as value FROM users
UNION ALL
SELECT 
    'Verified Users', COUNT(*) FROM users WHERE verified = TRUE
UNION ALL
SELECT 
    'Total Donors', COUNT(*) FROM users WHERE role = 'donor'
UNION ALL
SELECT 
    'Total Beneficiaries', COUNT(*) FROM users WHERE role = 'beneficiary'
UNION ALL
SELECT 
    'Total Food Items', COUNT(*) FROM food_items
UNION ALL
SELECT 
    'Available Food Items', COUNT(*) FROM food_items WHERE status = 'available'
UNION ALL
SELECT 
    'Total Pickup Requests', COUNT(*) FROM pickup_requests
UNION ALL
SELECT 
    'Pending Requests', COUNT(*) FROM pickup_requests WHERE status = 'pending'
UNION ALL
SELECT 
    'Completed Donations', COUNT(*) FROM food_items WHERE status = 'completed';"
```

### Food Items Analysis
```bash
# Food items expiring soon (within 24 hours)
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "
SELECT 
    title, 
    expiry_date, 
    location,
    TIMESTAMPDIFF(HOUR, NOW(), expiry_date) as hours_until_expiry
FROM food_items 
WHERE expiry_date > NOW() 
AND expiry_date < DATE_ADD(NOW(), INTERVAL 24 HOUR)
AND status = 'available'
ORDER BY hours_until_expiry;"

# Most active donors
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "
SELECT 
    u.name,
    u.email,
    COUNT(fi.id) as food_items_donated,
    SUM(fi.quantity) as total_servings_donated
FROM users u
JOIN food_items fi ON u.id = fi.donor_id
WHERE u.role = 'donor'
GROUP BY u.id, u.name, u.email
ORDER BY food_items_donated DESC;"

# Most active beneficiaries
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "
SELECT 
    u.name,
    u.email,
    COUNT(pr.id) as pickup_requests_made
FROM users u
JOIN pickup_requests pr ON u.id = pr.beneficiary_id
WHERE u.role = 'beneficiary'
GROUP BY u.id, u.name, u.email
ORDER BY pickup_requests_made DESC;"
```

## 🔍 Search and Filter Queries

### Search Food Items
```bash
# Search food items by keyword in title
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "
SELECT title, description, quantity, unit, location FROM food_items 
WHERE title LIKE '%pasta%' OR description LIKE '%pasta%'
AND status = 'available';"

# Search food items by keyword in description
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "
SELECT title, description, quantity, unit, location FROM food_items 
WHERE description LIKE '%vegetarian%'
AND status = 'available';"
```

### Location-Based Queries
```bash
# Find food items near a specific location (example: NYC coordinates)
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "
SELECT 
    title, 
    location, 
    latitude, 
    longitude,
    quantity,
    unit,
    ROUND(
        SQRT(
            POW(69.1 * (latitude - 40.7128), 2) + 
            POW(69.1 * (-74.0060 - longitude) * COS(latitude / 57.3), 2)
        ), 2
    ) AS distance_miles
FROM food_items 
WHERE status = 'available'
AND latitude IS NOT NULL 
AND longitude IS NOT NULL
ORDER BY distance_miles
LIMIT 10;"
```

## 🕒 Time-Based Queries

### Recent Activity
```bash
# Recent food items (last 7 days)
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "
SELECT 
    title, 
    quantity, 
    unit, 
    status, 
    created_at
FROM food_items 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY created_at DESC;"

# Recent pickup requests (last 24 hours)
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "
SELECT 
    pr.id,
    fi.title as food_item,
    u.name as beneficiary_name,
    pr.status,
    pr.requested_at
FROM pickup_requests pr
JOIN food_items fi ON pr.food_item_id = fi.id
JOIN users u ON pr.beneficiary_id = u.id
WHERE pr.requested_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY pr.requested_at DESC;"

# New user registrations (last 7 days)
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "
SELECT 
    name, 
    email, 
    role, 
    verified, 
    created_at
FROM users 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY created_at DESC;"
```

## 🛠️ Database Maintenance Queries

### Data Integrity Checks
```bash
# Check for orphaned records
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "
SELECT 'Orphaned Food Items' as issue, COUNT(*) as count
FROM food_items fi 
LEFT JOIN users u ON fi.donor_id = u.id 
WHERE u.id IS NULL
UNION ALL
SELECT 'Orphaned Pickup Requests', COUNT(*)
FROM pickup_requests pr 
LEFT JOIN food_items fi ON pr.food_item_id = fi.id 
WHERE fi.id IS NULL
UNION ALL
SELECT 'Orphaned Notifications', COUNT(*)
FROM notifications n 
LEFT JOIN users u ON n.user_id = u.id 
WHERE u.id IS NULL;"

# Check table sizes
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "
SELECT 
    table_name AS 'Table',
    round(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)',
    table_rows AS 'Rows'
FROM information_schema.TABLES 
WHERE table_schema = 'food_surplus_db'
ORDER BY (data_length + index_length) DESC;"
```

### Database Status
```bash
# Show database info
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "
SELECT 
    SCHEMA_NAME as 'Database',
    DEFAULT_CHARACTER_SET_NAME as 'Charset',
    DEFAULT_COLLATION_NAME as 'Collation'
FROM information_schema.SCHEMATA 
WHERE SCHEMA_NAME = 'food_surplus_db';"

# Show indexes
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = 'food_surplus_db'
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;"
```

## 🔄 Useful Maintenance Commands

### Backup Database
```bash
# Create backup
docker exec food_surplus_db mysqldump -u root -ppassword food_surplus_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
docker exec -i food_surplus_db mysql -u root -ppassword food_surplus_db < backup_file.sql
```

### Reset Sample Data
```bash
# Clear all data and reload schema (WARNING: This deletes all data!)
docker exec -it food_surplus_db mysql -u root -ppassword -e "DROP DATABASE IF EXISTS food_surplus_db;"
docker exec -i food_surplus_db mysql -u root -ppassword < db/schema.sql
```
---

## 📝 Notes

- Replace `food_surplus_db` container name if your container has a different name
- Replace `root` and `password` with your actual MySQL credentials
- These queries are based on the schema defined in `db/schema.sql`
- Always backup your database before running destructive operations
- Use `LIMIT` clause when dealing with large datasets to avoid overwhelming output

## 🚀 Quick Testing Commands

```bash
# Quick health check
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "SELECT 'Database is working!' as status;"

# Count all records
docker exec -it food_surplus_db mysql -u root -ppassword food_surplus_db -e "
SELECT 'users' as table_name, COUNT(*) as records FROM users
UNION ALL SELECT 'food_items', COUNT(*) FROM food_items
UNION ALL SELECT 'pickup_requests', COUNT(*) FROM pickup_requests
UNION ALL SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL SELECT 'verification_requests', COUNT(*) FROM verification_requests;"
```