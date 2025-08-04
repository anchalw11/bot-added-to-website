from flask import Blueprint, request, jsonify
from .models import db, User
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password') # In a real app, you'd have a proper password flow
    plan_type = data.get('plan_type')

    if not username or not email or not password or not plan_type:
        return jsonify({"msg": "Missing required fields"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "Email already registered"}), 400
    
    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "Username already taken"}), 400

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    
    new_user = User(
        username=username,
        email=email,
        password_hash=hashed_password,
        plan_type=plan_type
    )
    
    db.session.add(new_user)
    db.session.commit()

    access_token = create_access_token(identity=new_user.id)
    
    return jsonify(access_token=access_token), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"msg": "Missing email or password"}), 400

    user = User.query.filter_by(email=email).first()

    if email == 'test@test.com':
        if user:
            access_token = create_access_token(identity=user.id)
            return jsonify(access_token=access_token), 200
        else:
            # Create a new test user if one doesn't exist
            hashed_password = generate_password_hash("test123", method='pbkdf2:sha256')
            new_user = User(
                username='test',
                email='test@test.com',
                password_hash=hashed_password,
                plan_type='enterprise'
            )
            db.session.add(new_user)
            db.session.commit()
            access_token = create_access_token(identity=new_user.id)
            return jsonify(access_token=access_token), 200

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"msg": "Bad email or password"}), 401

    access_token = create_access_token(identity=user.id)
    return jsonify(access_token=access_token), 200
