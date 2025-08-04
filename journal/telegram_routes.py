from flask import Blueprint, request, jsonify
from flask_socketio import emit
from .extensions import socketio

telegram_bp = Blueprint('telegram', __name__)

@telegram_bp.route('/webhook', methods=['POST'])
def telegram_webhook():
    data = request.get_json()
    # Process the incoming message from Telegram
    # For now, we'll just emit it to the clients
    socketio.emit('new_signal', data)
    return jsonify({'status': 'ok'})
