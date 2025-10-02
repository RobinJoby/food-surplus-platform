from functools import wraps
from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Notification, db
import math

def role_required(allowed_roles):
    """Decorator to check if user has required role"""
    def decorator(f):
        @wraps(f)
        @jwt_required()
        def decorated_function(*args, **kwargs):
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            if user.role not in allowed_roles:
                return jsonify({'error': 'Insufficient permissions'}), 403
            
            return f(user, *args, **kwargs)
        return decorated_function
    return decorator

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two points using Haversine formula"""
    if not all([lat1, lon1, lat2, lon2]):
        return float('inf')
    
    R = 6371  # Earth's radius in kilometers
    
    lat1, lon1 = math.radians(lat1), math.radians(lon1)
    lat2, lon2 = math.radians(lat2), math.radians(lon2)
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    return R * c

def create_notification(user_id, notification_type, title, message, payload=None):
    """Create a new notification for a user"""
    notification = Notification(
        user_id=user_id,
        type=notification_type,
        title=title,
        message=message,
        payload=payload
    )
    db.session.add(notification)
    db.session.commit()
    return notification

def notify_nearby_beneficiaries(food_item, max_distance=10):
    """Notify beneficiaries within max_distance km of new food listing"""
    if not food_item.latitude or not food_item.longitude:
        return
    
    beneficiaries = User.query.filter_by(role='beneficiary').all()
    
    for beneficiary in beneficiaries:
        if beneficiary.latitude and beneficiary.longitude:
            distance = calculate_distance(
                float(food_item.latitude), float(food_item.longitude),
                float(beneficiary.latitude), float(beneficiary.longitude)
            )
            
            if distance <= max_distance:
                create_notification(
                    user_id=beneficiary.id,
                    notification_type='new_listing',
                    title='New Food Available Nearby',
                    message=f'{food_item.title} available for pickup',
                    payload={
                        'food_item_id': food_item.id,
                        'distance': round(distance, 2)
                    }
                )

def allowed_file(filename, allowed_extensions):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

def validate_coordinates(lat, lon):
    """Validate latitude and longitude values"""
    try:
        lat = float(lat)
        lon = float(lon)
        return -90 <= lat <= 90 and -180 <= lon <= 180
    except (ValueError, TypeError):
        return False

def paginate_query(query, page=1, per_page=20):
    """Paginate a SQLAlchemy query"""
    try:
        page = int(page) if page else 1
        per_page = int(per_page) if per_page else 20
        per_page = min(per_page, 100)  # Max 100 items per page
    except ValueError:
        page = 1
        per_page = 20
    
    paginated = query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )
    
    return {
        'items': [item.to_dict() for item in paginated.items],
        'total': paginated.total,
        'pages': paginated.pages,
        'current_page': paginated.page,
        'per_page': paginated.per_page,
        'has_next': paginated.has_next,
        'has_prev': paginated.has_prev
    }
