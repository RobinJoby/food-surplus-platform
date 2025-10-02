# Public Food Surplus Distribution System

A comprehensive full-stack web platform that connects food donors (restaurants/households) with beneficiaries (shelters/NGOs/individuals) to reduce food waste and help those in need.

## 🎯 Features

### User Management
- **Multi-role Authentication**: Donor, Beneficiary, and Admin roles
- **JWT-based Security**: Secure login/logout with token-based authentication
- **Profile Management**: Update personal information, location, and contact details
- **Organization Verification**: Admin-approved verification system for NGOs and restaurants

### Food Donation System
- **Create Listings**: Donors can post surplus food with details, quantities, and pickup times
- **Location-based Matching**: Find food donations within specified distance using Haversine formula
- **Real-time Status Tracking**: Track food from available → requested → accepted → picked → completed
- **Image Upload Support**: Add photos to food listings

### Pickup Request Workflow
- **Request System**: Beneficiaries can request pickup for available food items
- **Approval Process**: Donors can accept/reject pickup requests
- **Status Management**: Track the entire pickup lifecycle
- **Messaging**: Include messages with pickup requests

### Smart Notifications
- **Proximity Alerts**: Notify nearby beneficiaries when new food is posted
- **Request Updates**: Real-time notifications for request status changes
- **Admin Alerts**: System notifications for verification requests

### Interactive Map
- **Food Location Mapping**: Visual map showing all available food donations
- **Distance Calculation**: Real-time distance calculation from user location
- **Interactive Markers**: Click markers to view food details and request pickup

### Admin Dashboard
- **User Management**: View and manage all system users
- **Verification System**: Approve/reject organization verification requests
- **System Analytics**: Overview of platform usage and statistics
- **Content Moderation**: Monitor food listings and user activities

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **TailwindCSS** for modern, responsive styling
- **React Router** for client-side routing
- **React Leaflet** for interactive maps
- **Axios** for API communication
- **React Hot Toast** for notifications

### Backend
- **Flask** (Python) web framework
- **SQLAlchemy** ORM for database operations
- **Flask-JWT-Extended** for authentication
- **Flask-CORS** for cross-origin requests
- **Bcrypt** for password hashing
- **PyMySQL** for MySQL connectivity

### Database
- **MySQL 8.0** with optimized schema
- **Indexed queries** for performance
- **JSON fields** for flexible data storage
- **Foreign key constraints** for data integrity

### DevOps
- **Docker & Docker Compose** for containerization
- **Nginx** reverse proxy for production
- **Gunicorn** WSGI server for Python
- **Health checks** for service monitoring

## 📁 Project Structure

```
food-surplus-distribution/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts (Auth)
│   │   ├── utils/          # Helper functions and API
│   │   └── index.css       # Global styles
│   ├── package.json
│   └── Dockerfile
├── backend/                 # Flask application
│   ├── app.py              # Main application file
│   ├── models.py           # Database models
│   ├── utils.py            # Helper functions
│   ├── config.py           # Configuration settings
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile
├── db/
│   └── schema.sql          # Database schema with sample data
├── docker-compose.yml      # Multi-container setup
├── nginx.conf             # Nginx configuration
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git for cloning the repository

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd food-surplus-distribution
```

2. **Start all services with Docker Compose**
```bash
docker-compose up -d
```

3. **Wait for services to be ready** (about 2-3 minutes)
```bash
docker-compose logs -f
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Full application (via Nginx): http://localhost

### Demo Accounts

The system comes with pre-configured demo accounts:

**Admin Account:**
- Email: `admin@foodsurplus.com`
- Password: `password123`

**Donor Account:**
- Email: `mario@restaurant.com`
- Password: `password123`

**Beneficiary Account:**
- Email: `contact@hopeshelter.org`
- Password: `password123`

## 🔧 Development Setup

### Backend Development

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Set environment variables**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

5. **Run the development server**
```bash
flask run --debug
```

### Frontend Development

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

### Database Setup

1. **Start MySQL container**
```bash
docker-compose up db -d
```

2. **Connect to MySQL**
```bash
mysql -h localhost -P 3306 -u root -p
# Password: password
```

3. **Import schema**
```bash
mysql -h localhost -P 3306 -u root -p food_surplus_db < db/schema.sql
```

## 📊 API Documentation

### Authentication Endpoints

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "donor",
  "phone": "+1234567890",
  "address": "123 Main St, City",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

#### POST /auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Food Management Endpoints

#### GET /food
Get available food items (with distance filtering for beneficiaries).

**Query Parameters:**
- `status`: Filter by status (available, requested, etc.)
- `max_distance`: Maximum distance in km (for beneficiaries)
- `page`: Page number for pagination
- `per_page`: Items per page

#### POST /food
Create a new food donation (donors only).

**Request Body:**
```json
{
  "title": "Fresh Pasta and Sauce",
  "description": "Leftover from lunch service",
  "quantity": 20,
  "unit": "servings",
  "pickup_start": "2024-10-02T18:00:00",
  "pickup_end": "2024-10-02T21:00:00",
  "expiry_date": "2024-10-03T22:00:00",
  "location": "Restaurant Address",
  "latitude": 40.7589,
  "longitude": -73.9851
}
```

### Pickup Request Endpoints

#### POST /pickup
Request pickup for a food item (beneficiaries only).

**Request Body:**
```json
{
  "food_item_id": 1,
  "message": "We can pick this up for our evening meal service"
}
```

#### PUT /pickup/{request_id}
Update pickup request status.

**Request Body:**
```json
{
  "status": "accepted"
}
```

### User Management Endpoints

#### GET /users/me
Get current user profile.

#### PUT /users/me
Update user profile.

### Notification Endpoints

#### GET /notifications
Get user notifications with pagination.

#### PUT /notifications/{notification_id}/read
Mark notification as read.

### Admin Endpoints

#### GET /admin/users
Get all users (admin only).

#### GET /admin/verification-requests
Get pending verification requests (admin only).

#### PUT /admin/verification-requests/{request_id}
Approve/reject verification request (admin only).

## 🗄️ Database Schema

### Users Table
- `id`: Primary key
- `name`: User's full name
- `email`: Unique email address
- `password_hash`: Bcrypt hashed password
- `role`: ENUM (donor, beneficiary, admin)
- `phone`: Contact number
- `latitude/longitude`: Location coordinates
- `address`: Full address
- `verified`: Boolean verification status
- `created_at/updated_at`: Timestamps

### Food Items Table
- `id`: Primary key
- `donor_id`: Foreign key to users
- `title`: Food item name
- `description`: Detailed description
- `quantity/unit`: Amount and measurement
- `expiry_date`: When food expires
- `pickup_start/pickup_end`: Pickup time window
- `location`: Pickup address
- `latitude/longitude`: Pickup coordinates
- `image_url`: Optional food image
- `status`: ENUM (available, requested, accepted, picked, completed, cancelled)

### Pickup Requests Table
- `id`: Primary key
- `food_item_id`: Foreign key to food_items
- `beneficiary_id`: Foreign key to users
- `status`: ENUM (pending, accepted, rejected, picked, completed, cancelled)
- `message`: Optional message from beneficiary
- `requested_at/responded_at/picked_at/completed_at`: Status timestamps

### Notifications Table
- `id`: Primary key
- `user_id`: Foreign key to users
- `type`: ENUM (new_listing, pickup_request, request_accepted, etc.)
- `title/message`: Notification content
- `payload`: JSON data for additional context
- `is_read`: Boolean read status
- `created_at`: Timestamp

## 🔒 Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Role-based Access Control**: Different permissions for each user type
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Parameterized queries via SQLAlchemy
- **CORS Configuration**: Controlled cross-origin requests
- **Environment Variables**: Sensitive data in environment files

## 🌍 Deployment

### Production Deployment

1. **Update environment variables**
```bash
# Update docker-compose.yml with production values
- SECRET_KEY=your-production-secret-key
- JWT_SECRET_KEY=your-production-jwt-secret-key
- DATABASE_URL=your-production-database-url
```

2. **Deploy with Docker Compose**
```bash
docker-compose -f docker-compose.yml up -d
```

3. **Set up SSL (recommended)**
```bash
# Add SSL certificates to nginx configuration
# Update nginx.conf for HTTPS
```

### Environment Variables

**Backend (.env):**
```
FLASK_ENV=production
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
DATABASE_URL=mysql+pymysql://user:password@host:port/database
```

**Frontend (.env):**
```
VITE_API_URL=https://your-api-domain.com
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm run test
```

### API Testing
Import the provided Postman collection (`postman_collection.json`) to test all API endpoints.

## 📈 Performance Optimizations

- **Database Indexing**: Optimized queries with proper indexes
- **Pagination**: All list endpoints support pagination
- **Caching**: Static assets cached with appropriate headers
- **Image Optimization**: Compressed images for faster loading
- **Lazy Loading**: Components loaded on demand
- **Connection Pooling**: Database connection optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Email: support@foodsurplus.com
- Documentation: [Wiki](https://github.com/your-repo/wiki)

## 🙏 Acknowledgments

- OpenStreetMap for map tiles
- Leaflet for mapping functionality
- TailwindCSS for the design system
- Flask and React communities for excellent documentation

---

**Built with ❤️ to reduce food waste and help communities**
