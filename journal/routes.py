from flask import Blueprint, request, jsonify
from .models import db, Trade, User
from datetime import datetime

trades_bp = Blueprint('trades', __name__)

@trades_bp.route('/trades', methods=['POST'])
def add_trade():
    data = request.get_json()

    if not data or not all(k in data for k in ['pair', 'type', 'entry', 'stopLoss', 'takeProfit']):
        return jsonify({'error': 'Missing required trade data'}), 400

    user_id = data.get('user_id', 1)
    user = User.query.get(user_id)
    if not user:
        user = User(id=user_id, username=f'user{user_id}', email=f'user{user_id}@example.com')
        db.session.add(user)

    new_trade = Trade(
        signal_id=data['id'],
        date=datetime.utcnow().date(),
        asset=data['pair'],
        direction=data['type'].lower(),
        entry_price=float(data['entry']),
        sl=float(data['stopLoss']),
        tp=float(data['takeProfit'][0]),
        outcome='pending',
        lot_size=0,
        exit_price=0,
        user_id=user.id
    )
    
    db.session.add(new_trade)
    db.session.commit()
    
    return jsonify({'message': 'Trade added successfully', 'trade_id': new_trade.id}), 201

@trades_bp.route('/trades', methods=['GET'])
def get_trades():
    trades = Trade.query.order_by(Trade.date.desc()).all()
    return jsonify([{
        'id': trade.id,
        'signal_id': trade.signal_id,
        'date': trade.date.isoformat(),
        'asset': trade.asset,
        'direction': trade.direction,
        'entry_price': trade.entry_price,
        'sl': trade.sl,
        'tp': trade.tp,
        'outcome': trade.outcome,
        'pips': 0, # Placeholder
        'profit': 0, # Placeholder
        'rsr': 0 # Placeholder
    } for trade in trades])

@trades_bp.route('/trades/<int:signal_id>', methods=['DELETE'])
def delete_trade(signal_id):
    trade_to_delete = Trade.query.filter_by(signal_id=signal_id).first()
    
    if not trade_to_delete:
        return jsonify({'error': 'Trade not found'}), 404
        
    db.session.delete(trade_to_delete)
    db.session.commit()
    
    return jsonify({'message': 'Trade deleted successfully'}), 200
