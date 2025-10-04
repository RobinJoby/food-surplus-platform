import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    
    # Database configuration - Railway provides DATABASE_URL
    database_url = os.environ.get('DATABASE_URL')
    print(f"DATABASE_URL environment variable: {database_url}")  # Debug log
    
    if database_url and not database_url.startswith('mysql'):
        # Railway PostgreSQL - fix postgres:// to postgresql://
        if database_url.startswith('postgres://'):
            database_url = database_url.replace('postgres://', 'postgresql://', 1)
        SQLALCHEMY_DATABASE_URI = database_url
        print(f"Using PostgreSQL: {SQLALCHEMY_DATABASE_URI}")  # Debug log
    elif os.environ.get('RAILWAY_ENVIRONMENT') or os.environ.get('PORT'):
        # Running on Railway but DATABASE_URL is MySQL or missing - use SQLite as fallback
        SQLALCHEMY_DATABASE_URI = 'sqlite:///app.db'
        print("Using SQLite fallback on Railway")  # Debug log
    else:
        # Local development uses MySQL
        SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:password@localhost:3306/food_surplus_db'
        print("Using MySQL for local development")  # Debug log
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # File upload settings
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    UPLOAD_FOLDER = 'uploads'
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
