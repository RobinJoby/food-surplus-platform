# Windows PowerShell Deployment Script for Food Surplus Platform
# For Windows Server deployment (not recommended for production)

param(
    [switch]$SkipSSL = $false
)

Write-Host "🚀 Starting Food Surplus Platform deployment on Windows..." -ForegroundColor Green

# Check if Docker Desktop is running
$dockerRunning = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue
if (-not $dockerRunning) {
    Write-Host "❌ Docker Desktop is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if docker-compose.prod.yml exists
if (-not (Test-Path "docker-compose.prod.yml")) {
    Write-Host "❌ docker-compose.prod.yml not found!" -ForegroundColor Red
    exit 1
}

# Check if .env.prod exists
if (-not (Test-Path ".env.prod")) {
    Write-Host "❌ .env.prod file not found. Please create it first." -ForegroundColor Red
    Write-Host "💡 Copy .env.prod and update the values." -ForegroundColor Yellow
    exit 1
}

# Create SSL directory
if (-not (Test-Path "ssl")) {
    New-Item -ItemType Directory -Path "ssl" -Force
    Write-Host "📁 Created SSL directory" -ForegroundColor Green
}

# Check SSL certificates
$sslExists = (Test-Path "ssl\fullchain.pem") -and (Test-Path "ssl\privkey.pem")
if (-not $sslExists -and -not $SkipSSL) {
    Write-Host "⚠️ SSL certificates not found in ssl\ directory" -ForegroundColor Yellow
    Write-Host "For Windows, you can:" -ForegroundColor Yellow
    Write-Host "1. Use Let's Encrypt with win-acme: https://www.win-acme.com/" -ForegroundColor Yellow
    Write-Host "2. Generate self-signed certificates for testing" -ForegroundColor Yellow
    Write-Host "3. Use -SkipSSL flag to continue without SSL" -ForegroundColor Yellow
    
    $continue = Read-Host "Continue without SSL? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 1
    }
}

# Stop existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml down 2>$null

# Build and start containers
Write-Host "🔨 Building and starting containers..." -ForegroundColor Green
docker-compose -f docker-compose.prod.yml up -d --build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}

# Wait for services
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check service health
$containers = docker-compose -f docker-compose.prod.yml ps --format "table {{.Service}}\t{{.Status}}"
Write-Host "📊 Container Status:" -ForegroundColor Green
Write-Host $containers

Write-Host "`n✅ Deployment completed!" -ForegroundColor Green
Write-Host "🌐 Your application should be available at:" -ForegroundColor Cyan
Write-Host "  - HTTP: http://localhost" -ForegroundColor Cyan
Write-Host "  - HTTPS: https://localhost (if SSL configured)" -ForegroundColor Cyan

Write-Host "`n📝 Next steps for Windows deployment:" -ForegroundColor Yellow
Write-Host "1. Configure Windows Firewall for ports 80 and 443" -ForegroundColor White
Write-Host "2. Set up domain DNS to point to your Windows server" -ForegroundColor White
Write-Host "3. Configure SSL certificates properly" -ForegroundColor White
Write-Host "4. Set up automated backups" -ForegroundColor White

Write-Host "`n🔧 Useful commands:" -ForegroundColor Cyan
Write-Host "  - View logs: docker-compose -f docker-compose.prod.yml logs -f" -ForegroundColor White
Write-Host "  - Restart: docker-compose -f docker-compose.prod.yml restart" -ForegroundColor White
Write-Host "  - Stop: docker-compose -f docker-compose.prod.yml down" -ForegroundColor White