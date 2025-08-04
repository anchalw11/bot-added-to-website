# Trading Signal Bot - Smart Money Concepts Analyzer

A professional-grade real-time trading signal generation bot that uses Smart Money Concepts (SMC) to analyze market data and generate high-probability trading signals.

## 🚀 Features

- **Real-time Market Analysis**: Fetches live market data from Financial Modeling Prep API
- **Smart Money Concepts**: Implements professional trading concepts including:
  - Break of Structure (BOS) detection
  - Fair Value Gap (FVG) identification
  - Market bias determination
- **Dynamic API Key Management**: Update API keys without server restart
- **Comprehensive Error Handling**: Robust error handling for API failures and edge cases
- **Multiple Asset Support**: Supports forex pairs, cryptocurrencies, and other financial instruments
- **RESTful API**: Clean API endpoints for integration with trading platforms

## 📋 Requirements

- Node.js 16+ 
- Financial Modeling Prep API key (get one at https://financialmodelingprep.com)

## 🛠️ Installation

1. **Clone or create the project directory:**
```bash
mkdir trading-signal-bot
cd trading-signal-bot
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env and add your FMP API key
```

4. **Start the server:**
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3002`

## 🔧 API Endpoints

### 1. Health Check
```http
GET /health
```
Returns server status and basic information.

### 2. Update API Key
```http
POST /api/set-key
Content-Type: application/json

{
  "newApiKey": "your_new_fmp_api_key"
}
```

### 3. Analyze Symbol
```http
POST /api/analyze-symbol
Content-Type: application/json

{
  "symbol": "EURUSD",
  "timeframe": "15m"
}
```

**Supported Symbols:**
- Forex: `EURUSD`, `GBPUSD`, `USDJPY`, etc.
- Crypto: `BTCUSD`, `ETHUSD`, etc.
- Stocks: `AAPL`, `TSLA`, etc.

**Supported Timeframes:**
- `1m`, `5m`, `15m`, `30m`, `1h`, `4h`, `1d`

### 4. API Key Status
```http
GET /api/key-status
```
Returns current API key configuration status.

## 📊 Response Format

### Successful Analysis Response:
```json
{
  "symbol": "EURUSD",
  "timeframe": "15m",
  "direction": "BUY",
  "entry": "1.08500",
  "stopLoss": "1.08337",
  "targets": {
    "target1": "1.08663",
    "target2": "1.08826", 
    "target3": "1.08989"
  },
  "riskRewardRatio": "1:1, 1:2, 1:3",
  "confidence": 85,
  "analysis": "Bullish momentum detected. Price has broken above the recent high of 1.08450, indicating institutional buying interest. This setup aligns with Smart Money Concepts for a potential long position.",
  "structures": {
    "breakOfStructure": {
      "type": "BULLISH",
      "level": 1.08450,
      "currentPrice": 1.08500,
      "strength": "MODERATE"
    },
    "fairValueGap": null,
    "marketBias": "BULLISH"
  },
  "timestamp": "2025-01-18T15:30:45.123Z",
  "marketData": {
    "currentPrice": "1.08500",
    "high24h": "1.08750",
    "low24h": "1.08200",
    "volume": "N/A"
  }
}
```

### Neutral Signal Response:
```json
{
  "symbol": "EURUSD",
  "timeframe": "15m", 
  "direction": "NEUTRAL",
  "analysis": "No clear trading opportunity detected. Market is in consolidation or lacks sufficient structural confirmation.",
  "confidence": 50,
  "timestamp": "2025-01-18T15:30:45.123Z",
  "structures": {
    "breakOfStructure": null,
    "fairValueGap": null,
    "marketBias": "NEUTRAL"
  }
}
```

## 🧠 Smart Money Concepts Implementation

### Break of Structure (BOS)
- **Bullish BOS**: Current candle's high breaks above the highest high of the last 10 candles
- **Bearish BOS**: Current candle's low breaks below the lowest low of the last 10 candles
- **Strength Classification**: Based on percentage break distance

### Fair Value Gap (FVG)
- **Bullish FVG**: High of first candle < Low of third candle in a 3-candle sequence
- **Bearish FVG**: Low of first candle > High of third candle in a 3-candle sequence
- **Gap Size Analysis**: Measures the size and significance of price imbalances

### Confidence Scoring
- **Base Score**: 50%
- **BOS Bonus**: +15-25% (based on strength)
- **FVG Bonus**: +8-15% (based on strength)  
- **Alignment Bonus**: +10% (when BOS and FVG align)
- **Maximum**: 95%

## 🔍 Usage Examples

### Example 1: Basic Analysis
```javascript
// Analyze EUR/USD on 15-minute timeframe
const response = await fetch('http://localhost:3002/api/analyze-symbol', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    symbol: 'EURUSD',
    timeframe: '15m'
  })
});

const signal = await response.json();
console.log('Trading Signal:', signal);
```

### Example 2: Update API Key
```javascript
// Update FMP API key dynamically
const response = await fetch('http://localhost:3002/api/set-key', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    newApiKey: 'your_new_api_key_here'
  })
});

const result = await response.json();
console.log('API Key Update:', result);
```

## ⚠️ Error Handling

The bot includes comprehensive error handling for:

- **Invalid API Keys**: Clear messages for authentication failures
- **Rate Limiting**: Handles FMP API rate limits gracefully
- **Network Issues**: Timeout and connection error handling
- **Invalid Symbols**: Validation for unsupported trading pairs
- **Insufficient Data**: Checks for minimum data requirements

## 🔐 Security Notes

- API keys are stored in memory and can be updated dynamically
- No sensitive data is logged to console
- Input validation prevents injection attacks
- CORS enabled for cross-origin requests

## 📈 Integration

This bot is designed to integrate with:
- Trading platforms and dashboards
- Alert systems and notifications
- Automated trading systems
- Portfolio management tools

## 🤝 Support

For issues or questions:
1. Check the console logs for detailed error messages
2. Verify your FMP API key is valid and has sufficient quota
3. Ensure the symbol format matches FMP requirements
4. Check network connectivity to FMP servers

## 📄 License

MIT License - Feel free to use and modify for your trading needs.