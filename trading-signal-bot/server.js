const express = require('express');
const cors = require('cors');
const SmartMoneyAnalyzer = require('./src/SmartMoneyAnalyzer');
const apiKeyManager = require('./src/apiKeyManager');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize the Smart Money Analyzer
let analyzer = new SmartMoneyAnalyzer();

// --- Request Throttling ---
let lastRequestTimestamp = 0;
const REQUEST_COOLDOWN = 15000; // 15 seconds

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Trading Signal Bot',
    version: '1.0.0'
  });
});

// Main analysis endpoint
app.post('/api/analyze-symbol', async (req, res) => {
  const now = Date.now();
  if (now - lastRequestTimestamp < REQUEST_COOLDOWN) {
    const timeLeft = Math.ceil((REQUEST_COOLDOWN - (now - lastRequestTimestamp)) / 1000);
    return res.status(429).json({
      error: 'Too Many Requests',
      details: `Please wait ${timeLeft} seconds before making another request.`,
      symbol: req.body.symbol,
      timeframe: req.body.timeframe,
    });
  }
  lastRequestTimestamp = now;

  try {
    const { symbol, timeframe } = req.body;
    
    // Validate input parameters
    if (!symbol || typeof symbol !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid symbol. Please provide a valid symbol (e.g., "EURUSD", "BTCUSD").' 
      });
    }
    
    if (!timeframe || typeof timeframe !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid timeframe. Please provide a valid timeframe (e.g., "5m", "1h", "1d").' 
      });
    }

    console.log(`🔍 Analyzing ${symbol} on ${timeframe} timeframe...`);
    
    // Get the API key for the given symbol
    const apiKey = apiKeyManager.getNextKey(symbol);
    if (!apiKey) {
      return res.status(400).json({
        error: 'Invalid symbol. No API key found for the provided symbol.',
      });
    }

    const host = apiKeyManager.getHostForPair(symbol);

    // Perform the analysis
    const analysisResult = await analyzer.analyzeSymbol(symbol, timeframe, apiKey, host);
    
    // Check if the API call failed due to a key limit
    if (analysisResult.error && analysisResult.error.includes('limit')) {
      apiKeyManager.rotateKey(symbol);
      // Optionally, you can retry the request with the new key here
    }

    console.log(`✅ Analysis completed for ${symbol}:`, {
      direction: analysisResult.signalType || analysisResult.direction,
      confidence: analysisResult.confidence,
      entry: analysisResult.entryPrice || 'N/A'
    });
    
    res.json(analysisResult);
    
  } catch (error) {
    console.error(`❌ Analysis failed for ${req.body.symbol || 'unknown symbol'}:`, error.message);
    
    res.status(500).json({ 
      error: 'Analysis failed',
      details: error.message,
      symbol: req.body.symbol || 'unknown',
      timeframe: req.body.timeframe || 'unknown',
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'POST /api/analyze-symbol',
    ],
    timestamp: new Date().toISOString()
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Trading Signal Bot started successfully!`);
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   POST /api/analyze-symbol - Analyze trading symbol`);
  console.log(`   GET /health - Health check`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Trading Signal Bot...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down Trading Signal Bot...');
  process.exit(0);
});
