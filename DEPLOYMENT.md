# Production Deployment Guide - Food Surplus Platform

## 🚀 Quick Start for Production Deployment

This guide will help you deploy your modernized Food Surplus Platform to a production environment using Docker.

## 📋 Prerequisites

1. **VPS/Server Requirements:**
   - Ubuntu 20.04+ or CentOS 8+
   - Minimum 2 CPU cores, 4GB RAM, 20GB storage
   - Root or sudo access
   - Public IP address
   - Domain name pointing to your server

2. **Software Requirements:**
   - Docker 20.10+
   - Docker Compose 1.29+
   - Git
   - Certbot (for SSL certificates)

## 🔧 Server Setup

### 1. Update Your Server
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again to apply docker group
exit
```

### 3. Configure Firewall
```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

## 📁 Project Deployment

### 1. Clone Your Repository
```bash
cd /home/$USER
git clone https://github.com/yourusername/windsurf-project.git
cd windsurf-project
```

### 2. Configure Environment Variables
```bash
# Copy and edit the production environment file
cp .env.prod .env.prod.local
nano .env.prod.local
```

**Important:** Update these values in `.env.prod.local`:
- `DB_ROOT_PASSWORD`: Strong MySQL root password
- `DB_PASSWORD`: Strong database user password
- `JWT_SECRET_KEY`: 32+ character random string
- `SECRET_KEY`: 32+ character random string
- `REDIS_PASSWORD`: Strong Redis password
- `CORS_ORIGINS`: Your actual domain(s)
- `FRONTEND_API_URL`: https://yourdomain.com/api
- `DOMAIN`: Your actual domain name

### 3. Set Up SSL Certificates

#### Option A: Let's Encrypt (Recommended)
```bash
# Install Certbot
sudo apt install certbot -y

# Stop any running web servers
sudo systemctl stop apache2 nginx 2>/dev/null || true

# Get certificates
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy certificates to project
sudo mkdir -p ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/
sudo chown $USER:$USER ssl/*.pem
```

#### Option B: Self-Signed (Development only)
```bash
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/privkey.pem -out ssl/fullchain.pem \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=yourdomain.com"
```

### 4. Deploy the Application
```bash
# Make scripts executable
chmod +x deploy.sh backup.sh monitor.sh

# Run deployment
./deploy.sh
```

## 🔍 Verification

### 1. Check Services
```bash
# View running containers
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 2. Test Endpoints
```bash
# Health check
curl -k https://yourdomain.com/health

# API health
curl -k https://yourdomain.com/api/health

# Website
curl -k https://yourdomain.com/
```

## 🔄 Maintenance

### Daily Operations
```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f [service_name]

# Restart a service
docker-compose -f docker-compose.prod.yml restart [service_name]

# Update application
git pull
./deploy.sh
```

### Backup
```bash
# Run backup
./backup.sh

# Backups are stored in /home/$USER/backups/
ls -la /home/$USER/backups/
```

### Monitoring
```bash
# Run health check
./monitor.sh

# Set up automated monitoring (cron)
crontab -e
# Add: */5 * * * * /path/to/project/monitor.sh >/dev/null 2>&1
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Container Won't Start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs [service_name]

# Check if ports are in use
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

#### 2. Database Connection Issues
```bash
# Check database logs
docker-compose -f docker-compose.prod.yml logs db

# Connect to database
docker-compose -f docker-compose.prod.yml exec db mysql -u root -p
```

#### 3. SSL Certificate Issues
```bash
# Check certificate validity
openssl x509 -in ssl/fullchain.pem -text -noout

# Renew Let's Encrypt certificates
sudo certbot renew
sudo cp /etc/letsencrypt/live/yourdomain.com/* ssl/
sudo chown $USER:$USER ssl/*
docker-compose -f docker-compose.prod.yml restart nginx
```

#### 4. High Resource Usage
```bash
# Check resource usage
docker stats

# Check system resources
htop
df -h
free -h
```

### Log Locations
- Application logs: `docker-compose -f docker-compose.prod.yml logs`
- Nginx logs: Docker volume `nginx_logs`
- System logs: `/var/log/`

## 🔒 Security Best Practices

1. **Regular Updates:**
   ```bash
   # Update system packages
   sudo apt update && sudo apt upgrade -y
   
   # Update Docker images
   docker-compose -f docker-compose.prod.yml pull
   ./deploy.sh
   ```

2. **Firewall Configuration:**
   ```bash
   sudo ufw status
   # Only allow necessary ports: 22, 80, 443
   ```

3. **SSL Certificate Renewal:**
   ```bash
   # Set up automatic renewal
   sudo crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   ```

4. **Backup Automation:**
   ```bash
   crontab -e
   # Add: 0 2 * * * /path/to/project/backup.sh >/dev/null 2>&1
   ```

## 📊 Performance Optimization

### 1. Database Optimization
- Enable query caching
- Regular database maintenance
- Monitor slow queries

### 2. Web Server Optimization
- Enable gzip compression (already configured)
- Optimize static file caching
- Use CDN for static assets

### 3. Application Optimization
- Monitor application performance
- Optimize database queries
- Use Redis for caching

## 🎯 Post-Deployment Checklist

- [ ] All services are running and healthy
- [ ] Website loads correctly over HTTPS
- [ ] API endpoints respond correctly
- [ ] User registration/login works
- [ ] File uploads work
- [ ] SSL certificate is valid
- [ ] Monitoring is set up
- [ ] Backups are automated
- [ ] Firewall is configured
- [ ] DNS is pointing to the server

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review logs for error messages
3. Ensure all environment variables are set correctly
4. Verify SSL certificates are valid
5. Check system resources (CPU, memory, disk)

## 🔄 Updates and Maintenance

### Regular Updates
```bash
# Weekly maintenance routine
cd /path/to/project
git pull
./deploy.sh
./backup.sh
./monitor.sh
```

### Security Updates
```bash
# Monthly security updates
sudo apt update && sudo apt upgrade -y
docker-compose -f docker-compose.prod.yml pull
./deploy.sh
```

Your Food Surplus Platform is now ready for production! 🎉