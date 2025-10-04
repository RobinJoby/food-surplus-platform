@echo off
REM Windows setup script for Food Surplus Platform deployment

echo 🚀 Food Surplus Platform - Windows Setup Script
echo.

echo This script prepares your project for deployment to a Linux server.
echo.

REM Check if we're in the correct directory
if not exist "docker-compose.prod.yml" (
    echo ❌ Error: docker-compose.prod.yml not found!
    echo Make sure you're running this script from the project root directory.
    pause
    exit /b 1
)

echo ✅ Project files found!
echo.

echo 📋 Pre-deployment checklist:
echo.
echo 1. ✅ Production Docker configuration created
echo 2. ✅ Environment template created (.env.prod)
echo 3. ✅ Deployment scripts created
echo 4. ✅ Monitoring and backup scripts created
echo 5. ✅ Comprehensive deployment guide created
echo.

echo 📝 Next steps:
echo.
echo 1. Upload your project to your Linux server:
echo    scp -r . user@your-server:/home/user/windsurf-project
echo.
echo 2. SSH into your server:
echo    ssh user@your-server
echo.
echo 3. Navigate to project directory:
echo    cd windsurf-project
echo.
echo 4. Make scripts executable:
echo    chmod +x deploy.sh backup.sh monitor.sh
echo.
echo 5. Configure environment variables:
echo    cp .env.prod .env.prod.local
echo    nano .env.prod.local
echo.
echo 6. Run deployment:
echo    ./deploy.sh
echo.

echo 📖 For detailed instructions, see DEPLOYMENT.md
echo.

echo 🔧 Files created for production deployment:
echo   - docker-compose.prod.yml     (Production Docker configuration)
echo   - .env.prod                   (Environment variables template)
echo   - nginx.prod.conf            (Production Nginx configuration)
echo   - backend/Dockerfile.prod    (Production backend container)
echo   - frontend/Dockerfile.prod   (Production frontend container)
echo   - deploy.sh                  (Automated deployment script)
echo   - backup.sh                  (Database and files backup script)
echo   - monitor.sh                 (Health monitoring script)
echo   - DEPLOYMENT.md              (Complete deployment guide)
echo.

echo ✨ Your project is ready for production deployment!
echo.
pause