const WebSocket = require('ws');

class FinnhubConnector {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.socket = null;
    this.onMessage = null;
    this.subscriptions = new Set();
  }

  connect() {
    this.socket = new WebSocket(`wss://ws.finnhub.io?token=${this.apiKey}`);

    this.socket.on('open', () => {
      console.log('✅ Connected to Finnhub WebSocket');
      // Resubscribe to any symbols that were subscribed before a disconnect
      this.subscriptions.forEach(symbol => this.subscribe(symbol));
    });

    this.socket.on('message', (data) => {
      const message = JSON.parse(data);
      if (this.onMessage) {
        this.onMessage(message);
      }
    });

    this.socket.on('close', () => {
      console.log('Disconnected from Finnhub WebSocket. Reconnecting...');
      setTimeout(() => this.connect(), 1000); // Reconnect after 1 second
    });

    this.socket.on('error', (error) => {
      console.error('Finnhub WebSocket error:', error);
    });
  }

  subscribe(symbol) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': symbol }));
      this.subscriptions.add(symbol);
      console.log(`Subscribed to ${symbol}`);
    }
  }

  unsubscribe(symbol) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ 'type': 'unsubscribe', 'symbol': symbol }));
      this.subscriptions.delete(symbol);
      console.log(`Unsubscribed from ${symbol}`);
    }
  }

  setOnMessageCallback(callback) {
    this.onMessage = callback;
  }
}

module.exports = FinnhubConnector;
