#!/bin/bash

# Monitoring Script for Food Surplus Platform
# Checks health of all services and sends alerts if needed

set -e

# Configuration
LOG_FILE="/var/log/food_surplus_monitor.log"
ALERT_EMAIL="admin@yourdomain.com"  # Change this
SLACK_WEBHOOK=""  # Add your Slack webhook URL if using

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Logging function
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

print_status() {
    echo -e "${GREEN}[OK]${NC} $1"
    log_message "OK: $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    log_message "WARNING: $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    log_message "ERROR: $1"
}

# Function to send alert
send_alert() {
    local message="$1"
    local subject="Food Surplus Platform Alert"
    
    # Email alert
    if command -v mail &> /dev/null && [ -n "$ALERT_EMAIL" ]; then
        echo "$message" | mail -s "$subject" "$ALERT_EMAIL"
    fi
    
    # Slack alert
    if [ -n "$SLACK_WEBHOOK" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$subject: $message\"}" \
            "$SLACK_WEBHOOK" &> /dev/null
    fi
}

# Check if containers are running
check_containers() {
    local failed_services=()
    
    services=("food_surplus_db_prod" "food_surplus_backend_prod" "food_surplus_frontend_prod" "food_surplus_nginx_prod")
    
    for service in "${services[@]}"; do
        if ! docker ps --format "table {{.Names}}" | grep -q "$service"; then
            failed_services+=("$service")
            print_error "Container $service is not running"
        else
            print_status "Container $service is running"
        fi
    done
    
    if [ ${#failed_services[@]} -ne 0 ]; then
        send_alert "Failed services: ${failed_services[*]}"
        return 1
    fi
    return 0
}

# Check container health
check_health() {
    local unhealthy_services=()
    
    # Get unhealthy containers
    unhealthy=$(docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "(unhealthy|starting)" | cut -f1 || true)
    
    if [ -n "$unhealthy" ]; then
        while IFS= read -r service; do
            unhealthy_services+=("$service")
            print_error "Container $service is unhealthy"
        done <<< "$unhealthy"
        
        send_alert "Unhealthy services: ${unhealthy_services[*]}"
        return 1
    else
        print_status "All containers are healthy"
        return 0
    fi
}

# Check website accessibility
check_website() {
    local url="https://yourdomain.com/health"  # Change this to your domain
    
    if curl -f -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200"; then
        print_status "Website is accessible"
        return 0
    else
        print_error "Website is not accessible"
        send_alert "Website is not accessible at $url"
        return 1
    fi
}

# Check disk space
check_disk_space() {
    local threshold=85  # Alert if disk usage > 85%
    local usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$usage" -gt "$threshold" ]; then
        print_error "Disk usage is ${usage}% (threshold: ${threshold}%)"
        send_alert "High disk usage: ${usage}%"
        return 1
    else
        print_status "Disk usage is ${usage}%"
        return 0
    fi
}

# Check memory usage
check_memory() {
    local threshold=85  # Alert if memory usage > 85%
    local usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    
    if [ "$usage" -gt "$threshold" ]; then
        print_error "Memory usage is ${usage}% (threshold: ${threshold}%)"
        send_alert "High memory usage: ${usage}%"
        return 1
    else
        print_status "Memory usage is ${usage}%"
        return 0
    fi
}

# Check database connectivity
check_database() {
    if docker-compose -f docker-compose.prod.yml exec -T db mysqladmin ping -h localhost &> /dev/null; then
        print_status "Database is responding"
        return 0
    else
        print_error "Database is not responding"
        send_alert "Database connection failed"
        return 1
    fi
}

# Main monitoring function
main() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Starting health check..."
    
    local failed_checks=0
    
    # Run all checks
    check_containers || ((failed_checks++))
    check_health || ((failed_checks++))
    check_website || ((failed_checks++))
    check_disk_space || ((failed_checks++))
    check_memory || ((failed_checks++))
    check_database || ((failed_checks++))
    
    echo ""
    if [ $failed_checks -eq 0 ]; then
        print_status "All health checks passed!"
    else
        print_error "$failed_checks health check(s) failed!"
    fi
    
    echo "----------------------------------------"
}

# Create log file if it doesn't exist
sudo mkdir -p "$(dirname "$LOG_FILE")"
sudo touch "$LOG_FILE"
sudo chown "$(whoami):$(whoami)" "$LOG_FILE"

# Run monitoring
main