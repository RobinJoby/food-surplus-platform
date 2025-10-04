from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import os

from config import config
from models import db, bcrypt, User, FoodItem, PickupRequest, Notification, VerificationRequest
from utils import role_required, create_notification, notify_nearby_beneficiaries, validate_coordinates, paginate_query

def create_app(config_name=None):
    # Set static folder for Railway deployment
    static_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
    app = Flask(__name__, static_folder=static_folder, static_url_path='')
    
    # Configuration
    config_name = config_name or os.environ.get('FLASK_ENV', 'default')
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt = JWTManager(app)
    CORS(app)
    
    # Serve frontend routes
    @app.route('/')
    def serve_frontend():
        return send_from_directory(app.static_folder, 'index.html')
    
    @app.route('/<path:path>')
    def serve_frontend_routes(path):
        # If it's an API route, let it pass through
        if path.startswith('api/') or path.startswith('auth/') or path.startswith('uploads/'):
            return None
        # If the file exists, serve it
        if os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        # Otherwise, serve index.html for client-side routing
        return send_from_directory(app.static_folder, 'index.html')
    
    # Create tables (with error handling for Railway deployment)
    with app.app_context():
        try:
            db.create_all()
            print("Database tables created successfully")
        except Exception as e:
            print(f"Database initialization error: {e}")
            # Don't fail the app startup - let it retry later
    
    # Auth Routes
    @app.route('/auth/register', methods=['POST'])
    def register():
        try:
            data = request.get_json()
            
            # Validate required fields
            required_fields = ['name', 'email', 'password', 'role']
            for field in required_fields:
                if not data.get(field):
                    return jsonify({'error': f'{field} is required'}), 400
            
            # Check if user already exists
            if User.query.filter_by(email=data['email']).first():
                return jsonify({'error': 'Email already registered'}), 400
            
            # Validate role
            if data['role'] not in ['donor', 'beneficiary', 'admin']:
                return jsonify({'error': 'Invalid role'}), 400
            
            # Validate coordinates if provided
            if data.get('latitude') and data.get('longitude'):
                if not validate_coordinates(data['latitude'], data['longitude']):
                    return jsonify({'error': 'Invalid coordinates'}), 400
            
            # Create new user
            user = User(
                name=data['name'],
                email=data['email'],
                role=data['role'],
                phone=data.get('phone'),
                latitude=data.get('latitude'),
                longitude=data.get('longitude'),
                address=data.get('address')
            )
            
            # Set password hash using bcrypt
            user.set_password(data['password'])
            
            db.session.add(user)
            db.session.commit()
            
            # Create access token
            access_token = create_access_token(identity=str(user.id))
            
            return jsonify({
                'message': 'User registered successfully',
                'access_token': access_token,
                'user': user.to_dict()
            }), 201
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    @app.route('/auth/login', methods=['POST'])
    def login():
        try:
            data = request.get_json()
            
            if not data.get('email') or not data.get('password'):
                return jsonify({'error': 'Email and password are required'}), 400
            
            user = User.query.filter_by(email=data['email']).first()
            
            if not user or not user.check_password(data['password']):
                return jsonify({'error': 'Invalid credentials'}), 401
            
            access_token = create_access_token(identity=str(user.id))
            
            return jsonify({
                'message': 'Login successful',
                'access_token': access_token,
                'user': user.to_dict()
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    # User Routes
    @app.route('/users/me', methods=['GET'])
    @jwt_required()
    def get_profile():
        try:
            current_user_id = int(get_jwt_identity())
            user = User.query.get(current_user_id)
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            return jsonify({'user': user.to_dict()}), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/users/me', methods=['PUT'])
    @jwt_required()
    def update_profile():
        try:
            current_user_id = int(get_jwt_identity())
            user = User.query.get(current_user_id)
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            data = request.get_json()
            
            # Update allowed fields
            if 'name' in data:
                user.name = data['name']
            if 'phone' in data:
                user.phone = data['phone']
            if 'address' in data:
                user.address = data['address']
            if 'latitude' in data and 'longitude' in data:
                if validate_coordinates(data['latitude'], data['longitude']):
                    user.latitude = data['latitude']
                    user.longitude = data['longitude']
                else:
                    return jsonify({'error': 'Invalid coordinates'}), 400
            
            db.session.commit()
            
            return jsonify({
                'message': 'Profile updated successfully',
                'user': user.to_dict()
            }), 200
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    # Food Item Routes
    @app.route('/food', methods=['POST'])
    @role_required(['donor'])
    def create_food_item(current_user):
        try:
            data = request.get_json()
            
            # Validate required fields
            required_fields = ['title', 'quantity', 'pickup_start', 'pickup_end']
            for field in required_fields:
                if not data.get(field):
                    return jsonify({'error': f'{field} is required'}), 400
            
            # Parse datetime fields
            try:
                pickup_start = datetime.fromisoformat(data['pickup_start'].replace('Z', '+00:00'))
                pickup_end = datetime.fromisoformat(data['pickup_end'].replace('Z', '+00:00'))
                expiry_date = None
                if data.get('expiry_date'):
                    expiry_date = datetime.fromisoformat(data['expiry_date'].replace('Z', '+00:00'))
            except ValueError:
                return jsonify({'error': 'Invalid datetime format'}), 400
            
            # Validate coordinates if provided
            latitude = data.get('latitude') or current_user.latitude
            longitude = data.get('longitude') or current_user.longitude
            
            if latitude and longitude:
                if not validate_coordinates(latitude, longitude):
                    return jsonify({'error': 'Invalid coordinates'}), 400
            
            # Create food item
            food_item = FoodItem(
                donor_id=current_user.id,
                title=data['title'],
                description=data.get('description'),
                quantity=int(data['quantity']),
                unit=data.get('unit', 'servings'),
                expiry_date=expiry_date,
                pickup_start=pickup_start,
                pickup_end=pickup_end,
                location=data.get('location'),
                latitude=latitude,
                longitude=longitude,
                image_url=data.get('image_url')
            )
            
            db.session.add(food_item)
            db.session.commit()
            
            # Notify nearby beneficiaries
            notify_nearby_beneficiaries(food_item)
            
            return jsonify({
                'message': 'Food item created successfully',
                'food_item': food_item.to_dict()
            }), 201
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    @app.route('/food', methods=['GET'])
    @jwt_required()
    def get_food_items():
        try:
            current_user_id = int(get_jwt_identity())
            user = User.query.get(current_user_id)
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            # Get query parameters
            status = request.args.get('status', 'available')
            max_distance = float(request.args.get('max_distance', 10))
            page = request.args.get('page', 1)
            per_page = request.args.get('per_page', 20)
            
            # Base query
            query = FoodItem.query.filter_by(status=status)
            
            # For beneficiaries, filter by distance
            if user.role == 'beneficiary' and user.latitude and user.longitude:
                # Get all food items and filter by distance
                all_items = query.all()
                nearby_items = []
                
                for item in all_items:
                    if item.latitude and item.longitude:
                        distance = item.calculate_distance(float(user.latitude), float(user.longitude))
                        if distance <= max_distance:
                            nearby_items.append(item)
                
                # Sort by distance
                nearby_items.sort(key=lambda x: x.calculate_distance(float(user.latitude), float(user.longitude)))
                
                # Manual pagination
                start = (int(page) - 1) * int(per_page)
                end = start + int(per_page)
                paginated_items = nearby_items[start:end]
                
                return jsonify({
                    'food_items': [item.to_dict(float(user.latitude), float(user.longitude)) for item in paginated_items],
                    'total': len(nearby_items),
                    'page': int(page),
                    'per_page': int(per_page)
                }), 200
            
            # For donors, show their own items
            elif user.role == 'donor':
                query = query.filter_by(donor_id=user.id)
            
            # Paginate and return
            paginated = paginate_query(query, page, per_page)
            
            return jsonify({
                'food_items': paginated['items'],
                'total': paginated['total'],
                'page': paginated['current_page'],
                'per_page': paginated['per_page']
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/food/<int:food_id>', methods=['PUT'])
    @role_required(['donor'])
    def update_food_item(current_user, food_id):
        try:
            food_item = FoodItem.query.get(food_id)
            
            if not food_item:
                return jsonify({'error': 'Food item not found'}), 404
            
            if food_item.donor_id != current_user.id:
                return jsonify({'error': 'Unauthorized'}), 403
            
            data = request.get_json()
            
            # Update allowed fields
            if 'status' in data:
                food_item.status = data['status']
            if 'title' in data:
                food_item.title = data['title']
            if 'description' in data:
                food_item.description = data['description']
            if 'quantity' in data:
                food_item.quantity = int(data['quantity'])
            
            db.session.commit()
            
            return jsonify({
                'message': 'Food item updated successfully',
                'food_item': food_item.to_dict()
            }), 200
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    # Pickup Request Routes
    @app.route('/pickup', methods=['POST'])
    @role_required(['beneficiary'])
    def create_pickup_request(current_user):
        try:
            data = request.get_json()
            
            if not data.get('food_item_id'):
                return jsonify({'error': 'food_item_id is required'}), 400
            
            food_item = FoodItem.query.get(data['food_item_id'])
            
            if not food_item:
                return jsonify({'error': 'Food item not found'}), 404
            
            if food_item.status != 'available':
                return jsonify({'error': 'Food item is not available'}), 400
            
            # Check if user already requested this item
            existing_request = PickupRequest.query.filter_by(
                food_item_id=food_item.id,
                beneficiary_id=current_user.id
            ).first()
            
            if existing_request:
                return jsonify({'error': 'You have already requested this item'}), 400
            
            # Create pickup request
            pickup_request = PickupRequest(
                food_item_id=food_item.id,
                beneficiary_id=current_user.id,
                message=data.get('message')
            )
            
            db.session.add(pickup_request)
            
            # Update food item status
            food_item.status = 'requested'
            
            db.session.commit()
            
            # Notify donor
            create_notification(
                user_id=food_item.donor_id,
                notification_type='pickup_request',
                title='New Pickup Request',
                message=f'{current_user.name} requested pickup for {food_item.title}',
                payload={
                    'request_id': pickup_request.id,
                    'beneficiary': current_user.name
                }
            )
            
            return jsonify({
                'message': 'Pickup request created successfully',
                'pickup_request': pickup_request.to_dict()
            }), 201
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    @app.route('/pickup', methods=['GET'])
    @jwt_required()
    def get_pickup_requests():
        try:
            current_user_id = int(get_jwt_identity())
            user = User.query.get(current_user_id)
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            page = request.args.get('page', 1)
            per_page = request.args.get('per_page', 20)
            
            if user.role == 'donor':
                # Get requests for donor's food items
                query = PickupRequest.query.join(FoodItem).filter(FoodItem.donor_id == user.id)
            elif user.role == 'beneficiary':
                # Get user's own requests
                query = PickupRequest.query.filter_by(beneficiary_id=user.id)
            else:
                # Admin can see all requests
                query = PickupRequest.query
            
            paginated = paginate_query(query, page, per_page)
            
            return jsonify({
                'pickup_requests': paginated['items'],
                'total': paginated['total'],
                'page': paginated['current_page'],
                'per_page': paginated['per_page']
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/pickup/<int:request_id>', methods=['PUT'])
    @jwt_required()
    def update_pickup_request(request_id):
        try:
            current_user_id = int(get_jwt_identity())
            user = User.query.get(current_user_id)
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            pickup_request = PickupRequest.query.get(request_id)
            
            if not pickup_request:
                return jsonify({'error': 'Pickup request not found'}), 404
            
            data = request.get_json()
            status = data.get('status')
            
            # Check permissions
            if user.role == 'donor' and pickup_request.food_item.donor_id != user.id:
                return jsonify({'error': 'Unauthorized'}), 403
            elif user.role == 'beneficiary' and pickup_request.beneficiary_id != user.id:
                return jsonify({'error': 'Unauthorized'}), 403
            
            # Update status
            if status in ['accepted', 'rejected'] and user.role == 'donor':
                pickup_request.status = status
                pickup_request.responded_at = datetime.utcnow()
                
                if status == 'accepted':
                    pickup_request.food_item.status = 'accepted'
                    notification_type = 'request_accepted'
                    message = f'Your pickup request for {pickup_request.food_item.title} was accepted'
                else:
                    pickup_request.food_item.status = 'available'
                    notification_type = 'request_rejected'
                    message = f'Your pickup request for {pickup_request.food_item.title} was rejected'
                
                # Notify beneficiary
                create_notification(
                    user_id=pickup_request.beneficiary_id,
                    notification_type=notification_type,
                    title='Pickup Request Update',
                    message=message,
                    payload={'request_id': pickup_request.id}
                )
            
            elif status in ['picked', 'completed'] and user.role in ['donor', 'beneficiary']:
                pickup_request.status = status
                if status == 'picked':
                    pickup_request.picked_at = datetime.utcnow()
                    pickup_request.food_item.status = 'picked'
                elif status == 'completed':
                    pickup_request.completed_at = datetime.utcnow()
                    pickup_request.food_item.status = 'completed'
            
            elif status == 'cancelled' and user.role == 'beneficiary':
                # Allow beneficiaries to cancel their own requests
                pickup_request.status = 'cancelled'
                pickup_request.responded_at = datetime.utcnow()
                # Set food item back to available if it was requested/accepted
                if pickup_request.food_item.status in ['requested', 'accepted']:
                    pickup_request.food_item.status = 'available'
            
            else:
                return jsonify({'error': 'Invalid status or insufficient permissions'}), 400
            
            db.session.commit()
            
            return jsonify({
                'message': 'Pickup request updated successfully',
                'pickup_request': pickup_request.to_dict()
            }), 200
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    # Notification Routes
    @app.route('/notifications', methods=['GET'])
    @jwt_required()
    def get_notifications():
        try:
            current_user_id = get_jwt_identity()
            
            page = request.args.get('page', 1)
            per_page = request.args.get('per_page', 20)
            
            query = Notification.query.filter_by(user_id=current_user_id).order_by(Notification.created_at.desc())
            paginated = paginate_query(query, page, per_page)
            
            return jsonify({
                'notifications': paginated['items'],
                'total': paginated['total'],
                'page': paginated['current_page'],
                'per_page': paginated['per_page']
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/notifications/<int:notification_id>/read', methods=['PUT'])
    @jwt_required()
    def mark_notification_read(notification_id):
        try:
            current_user_id = get_jwt_identity()
            
            notification = Notification.query.filter_by(
                id=notification_id,
                user_id=current_user_id
            ).first()
            
            if not notification:
                return jsonify({'error': 'Notification not found'}), 404
            
            notification.is_read = True
            db.session.commit()
            
            return jsonify({'message': 'Notification marked as read'}), 200
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    # Admin Routes
    @app.route('/admin/users', methods=['GET'])
    @role_required(['admin'])
    def get_all_users(current_user):
        try:
            page = request.args.get('page', 1)
            per_page = request.args.get('per_page', 20)
            role = request.args.get('role')
            
            query = User.query
            if role:
                query = query.filter_by(role=role)
            
            paginated = paginate_query(query, page, per_page)
            
            return jsonify({
                'users': paginated['items'],
                'total': paginated['total'],
                'page': paginated['current_page'],
                'per_page': paginated['per_page']
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/admin/verification-requests', methods=['GET'])
    @role_required(['admin'])
    def get_verification_requests(current_user):
        try:
            page = request.args.get('page', 1)
            per_page = request.args.get('per_page', 20)
            status = request.args.get('status', 'pending')
            
            query = VerificationRequest.query.filter_by(status=status)
            paginated = paginate_query(query, page, per_page)
            
            return jsonify({
                'verification_requests': paginated['items'],
                'total': paginated['total'],
                'page': paginated['current_page'],
                'per_page': paginated['per_page']
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/admin/verification-requests/<int:request_id>', methods=['PUT'])
    @role_required(['admin'])
    def update_verification_request(current_user, request_id):
        try:
            verification_request = VerificationRequest.query.get(request_id)
            
            if not verification_request:
                return jsonify({'error': 'Verification request not found'}), 404
            
            data = request.get_json()
            status = data.get('status')
            
            if status not in ['approved', 'rejected']:
                return jsonify({'error': 'Invalid status'}), 400
            
            verification_request.status = status
            verification_request.admin_notes = data.get('admin_notes')
            verification_request.reviewed_at = datetime.utcnow()
            verification_request.reviewed_by = current_user.id
            
            # Update user verification status
            if status == 'approved':
                verification_request.user.verified = True
            
            db.session.commit()
            
            return jsonify({
                'message': 'Verification request updated successfully',
                'verification_request': verification_request.to_dict()
            }), 200
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    # Health check
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()}), 200
    
    return app

# Create app instance for Gunicorn
app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
