#!/bin/bash

# Backup Script for Food Surplus Platform
# Creates backups of database and uploaded files

set -e

# Configuration
BACKUP_DIR="/home/$(whoami)/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_BACKUP_FILE="food_surplus_db_${DATE}.sql"
FILES_BACKUP_FILE="food_surplus_uploads_${DATE}.tar.gz"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

print_status "Starting backup process..."

# Load environment variables
if [ -f ".env.prod" ]; then
    source .env.prod
else
    print_error ".env.prod not found"
    exit 1
fi

# Backup database
print_status "Backing up database..."
docker-compose -f docker-compose.prod.yml exec -T db mysqldump \
    -u "$DB_USER" \
    -p"$DB_PASSWORD" \
    food_surplus_db > "$BACKUP_DIR/$DB_BACKUP_FILE"

if [ $? -eq 0 ]; then
    print_status "Database backup completed: $DB_BACKUP_FILE"
else
    print_error "Database backup failed"
    exit 1
fi

# Backup uploaded files
print_status "Backing up uploaded files..."
docker run --rm \
    -v "$(pwd)_backend_uploads:/source" \
    -v "$BACKUP_DIR:/backup" \
    alpine:latest \
    tar czf "/backup/$FILES_BACKUP_FILE" -C /source .

if [ $? -eq 0 ]; then
    print_status "Files backup completed: $FILES_BACKUP_FILE"
else
    print_error "Files backup failed"
    exit 1
fi

# Compress database backup
print_status "Compressing database backup..."
gzip "$BACKUP_DIR/$DB_BACKUP_FILE"

# Clean up old backups (keep last 7 days)
print_status "Cleaning up old backups..."
find "$BACKUP_DIR" -name "food_surplus_*" -type f -mtime +7 -delete

# Show backup summary
echo ""
print_status "Backup completed successfully!"
print_status "Backup location: $BACKUP_DIR"
print_status "Files created:"
ls -lh "$BACKUP_DIR"/*"$DATE"*

# Calculate backup sizes
DB_SIZE=$(du -h "$BACKUP_DIR/$DB_BACKUP_FILE.gz" | cut -f1)
FILES_SIZE=$(du -h "$BACKUP_DIR/$FILES_BACKUP_FILE" | cut -f1)

echo ""
print_status "Backup sizes:"
print_status "  Database: $DB_SIZE"
print_status "  Files: $FILES_SIZE"

echo ""
print_warning "Remember to copy backups to off-site storage!"
print_warning "You can use: scp, rsync, or cloud storage services"