from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime
import math

db = SQLAlchemy()
bcrypt = Bcrypt()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('donor', 'beneficiary', 'admin'), nullable=False)
    phone = db.Column(db.String(20))
    latitude = db.Column(db.Numeric(10, 8))
    longitude = db.Column(db.Numeric(11, 8))
    address = db.Column(db.Text)
    verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    food_items = db.relationship('FoodItem', backref='donor', lazy=True, cascade='all, delete-orphan')
    pickup_requests = db.relationship('PickupRequest', backref='beneficiary', lazy=True, cascade='all, delete-orphan')
    notifications = db.relationship('Notification', backref='user', lazy=True, cascade='all, delete-orphan')
    verification_requests = db.relationship('VerificationRequest', foreign_keys='VerificationRequest.user_id', backref='user', lazy=True, cascade='all, delete-orphan')
    reviewed_verifications = db.relationship('VerificationRequest', foreign_keys='VerificationRequest.reviewed_by', backref='reviewer', lazy=True)
    
    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'phone': self.phone,
            'latitude': float(self.latitude) if self.latitude else None,
            'longitude': float(self.longitude) if self.longitude else None,
            'address': self.address,
            'verified': self.verified,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class FoodItem(db.Model):
    __tablename__ = 'food_items'
    
    id = db.Column(db.Integer, primary_key=True)
    donor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    quantity = db.Column(db.Integer, nullable=False)
    unit = db.Column(db.String(50), default='servings')
    expiry_date = db.Column(db.DateTime)
    pickup_start = db.Column(db.DateTime, nullable=False)
    pickup_end = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(255))
    latitude = db.Column(db.Numeric(10, 8))
    longitude = db.Column(db.Numeric(11, 8))
    image_url = db.Column(db.String(500))
    status = db.Column(db.Enum('available', 'requested', 'accepted', 'picked', 'completed', 'cancelled'), default='available')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    pickup_requests = db.relationship('PickupRequest', backref='food_item', lazy=True, cascade='all, delete-orphan')
    
    def calculate_distance(self, lat, lon):
        """Calculate distance using Haversine formula"""
        if not self.latitude or not self.longitude:
            return float('inf')
        
        R = 6371  # Earth's radius in kilometers
        
        lat1, lon1 = math.radians(float(self.latitude)), math.radians(float(self.longitude))
        lat2, lon2 = math.radians(lat), math.radians(lon)
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        return R * c
    
    def to_dict(self, user_lat=None, user_lon=None):
        data = {
            'id': self.id,
            'donor_id': self.donor_id,
            'donor_name': self.donor.name if self.donor else None,
            'title': self.title,
            'description': self.description,
            'quantity': self.quantity,
            'unit': self.unit,
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'pickup_start': self.pickup_start.isoformat() if self.pickup_start else None,
            'pickup_end': self.pickup_end.isoformat() if self.pickup_end else None,
            'location': self.location,
            'latitude': float(self.latitude) if self.latitude else None,
            'longitude': float(self.longitude) if self.longitude else None,
            'image_url': self.image_url,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        
        if user_lat and user_lon:
            data['distance'] = round(self.calculate_distance(user_lat, user_lon), 2)
        
        return data

class PickupRequest(db.Model):
    __tablename__ = 'pickup_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    food_item_id = db.Column(db.Integer, db.ForeignKey('food_items.id'), nullable=False)
    beneficiary_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.Enum('pending', 'accepted', 'rejected', 'picked', 'completed', 'cancelled'), default='pending')
    message = db.Column(db.Text)
    requested_at = db.Column(db.DateTime, default=datetime.utcnow)
    responded_at = db.Column(db.DateTime)
    picked_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'food_item_id': self.food_item_id,
            'food_item': self.food_item.to_dict() if self.food_item else None,
            'beneficiary_id': self.beneficiary_id,
            'beneficiary_name': self.beneficiary.name if self.beneficiary else None,
            'status': self.status,
            'message': self.message,
            'requested_at': self.requested_at.isoformat() if self.requested_at else None,
            'responded_at': self.responded_at.isoformat() if self.responded_at else None,
            'picked_at': self.picked_at.isoformat() if self.picked_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }

class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    type = db.Column(db.Enum('new_listing', 'pickup_request', 'request_accepted', 'request_rejected', 'pickup_completed'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    payload = db.Column(db.JSON)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'type': self.type,
            'title': self.title,
            'message': self.message,
            'payload': self.payload,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class VerificationRequest(db.Model):
    __tablename__ = 'verification_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    organization_name = db.Column(db.String(200))
    organization_type = db.Column(db.Enum('restaurant', 'ngo', 'shelter', 'food_bank', 'other'), nullable=False)
    document_url = db.Column(db.String(500))
    description = db.Column(db.Text)
    status = db.Column(db.Enum('pending', 'approved', 'rejected'), default='pending')
    admin_notes = db.Column(db.Text)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    reviewed_at = db.Column(db.DateTime)
    reviewed_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else None,
            'organization_name': self.organization_name,
            'organization_type': self.organization_type,
            'document_url': self.document_url,
            'description': self.description,
            'status': self.status,
            'admin_notes': self.admin_notes,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None,
            'reviewed_by': self.reviewed_by
        }
