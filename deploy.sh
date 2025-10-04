#!/bin/bash

# Production Deployment Script for Food Surplus Platform
# Run this script on your VPS/server

set -e  # Exit on any error

echo "🚀 Starting Food Surplus Platform deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please don't run this script as root"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env.prod exists
if [ ! -f ".env.prod" ]; then
    print_error ".env.prod file not found. Please create it first."
    print_warning "Copy .env.prod.example and update the values."
    exit 1
fi

# Create SSL directory if it doesn't exist
print_status "Creating SSL directory..."
mkdir -p ssl

# Check if SSL certificates exist
if [ ! -f "ssl/fullchain.pem" ] || [ ! -f "ssl/privkey.pem" ]; then
    print_warning "SSL certificates not found in ssl/ directory"
    print_warning "Please add your SSL certificates:"
    print_warning "  - ssl/fullchain.pem (certificate chain)"
    print_warning "  - ssl/privkey.pem (private key)"
    print_warning ""
    print_warning "For Let's Encrypt certificates, you can use:"
    print_warning "  sudo certbot certonly --standalone -d yourdomain.com"
    print_warning "  sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/"
    print_warning "  sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/"
    print_warning "  sudo chown \$USER:\$USER ssl/*.pem"
    
    read -p "Continue without SSL? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Stop existing containers if running
print_status "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Remove old images (optional)
read -p "Remove old Docker images to save space? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Removing old images..."
    docker system prune -f
fi

# Build and start containers
print_status "Building and starting containers..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to be healthy
print_status "Waiting for services to start..."
sleep 30

# Check service health
print_status "Checking service health..."
if docker-compose -f docker-compose.prod.yml ps | grep -q "unhealthy"; then
    print_error "Some services are unhealthy!"
    docker-compose -f docker-compose.prod.yml ps
    exit 1
fi

# Show running containers
print_status "Deployment completed! Running containers:"
docker-compose -f docker-compose.prod.yml ps

# Show logs for debugging
print_status "Recent logs:"
docker-compose -f docker-compose.prod.yml logs --tail=20

# Final instructions
echo ""
print_status "🎉 Deployment completed successfully!"
print_status "Your application should be available at:"
print_status "  - HTTP: http://your-domain.com (redirects to HTTPS)"
print_status "  - HTTPS: https://your-domain.com"
echo ""
print_warning "Next steps:"
print_warning "1. Update your domain DNS to point to this server"
print_warning "2. Configure SSL certificates if not done already"
print_warning "3. Set up automated backups"
print_warning "4. Configure monitoring"
echo ""
print_status "Useful commands:"
print_status "  - View logs: docker-compose -f docker-compose.prod.yml logs -f"
print_status "  - Restart: docker-compose -f docker-compose.prod.yml restart"
print_status "  - Stop: docker-compose -f docker-compose.prod.yml down"
print_status "  - Update: ./deploy.sh"