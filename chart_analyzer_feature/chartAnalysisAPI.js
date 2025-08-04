const express = require('express');
const axios = require('axios');
const router = express.Router();

// Your API Key for Financial Modeling Prep
let apiKey = '7WXq12kDDw8rBrx4ZJZ0SaTSjMekuKYR'; // Default key, will be updated by the user

// In-memory store for signals sent to users
let userSignals = [];

// --- Smart Money Concepts Analysis Engine (Data-Driven) ---
class SmartMoneyAnalyzer {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.fmpApi = axios.create({
      baseURL: 'https://financialmodelingprep.com/api/v3',
      params: { apikey: this.apiKey }
    });
  }

  // Main analysis function
  async analyzeSymbol(symbol, timeframe) {
    try {
      const historicalData = await this.fetchHistoricalData(symbol, timeframe);
      if (historicalData.length < 20) { // Need enough data for analysis
        throw new Error('Not enough historical data to perform analysis.');
      }
      
      const structures = this.detectStructures(historicalData);
      const analysis = this.applySMCLogic(symbol, timeframe, historicalData, structures);
      
      return analysis;
    } catch (error) {
      console.error(`Analysis for ${symbol} failed:`, error.message);
      throw new Error(`Analysis for ${symbol} failed: ${error.message}`);
    }
  }

  // Fetch historical data from FMP
  async fetchHistoricalData(symbol, timeframe) {
    try {
      // FMP uses different endpoint patterns for forex vs. others
      const endpoint = symbol.includes('/') ? `/historical-chart/${timeframe}/${symbol.replace('/', '')}` : `/historical-chart/${timeframe}/${symbol}`;
      const response = await this.fmpApi.get(endpoint);
      return response.data;
    } catch (error) {
      // Log the detailed error from the API call
      console.error('FMP API Error:', error.response ? error.response.data : error.message);
      throw new Error(`Failed to fetch historical data for ${symbol}.`);
    }
  }

  // Detect SMC structures from historical data
  detectStructures(data) {
    // Simplified logic for structure detection based on price action
    const lastCandle = data[data.length - 1];
    const prevCandle = data[data.length - 2];

    const isBullish = lastCandle.close > lastCandle.open;
    const isBearish = lastCandle.close < lastCandle.open;

    // Basic Break of Structure (BOS) / Change of Character (CHoCH)
    const highPoint = Math.max(...data.slice(-10).map(c => c.high));
    const lowPoint = Math.min(...data.slice(-10).map(c => c.low));
    
    let breakOfStructure = null;
    if (lastCandle.high > highPoint) breakOfStructure = 'BULLISH';
    if (lastCandle.low < lowPoint) breakOfStructure = 'BEARISH';

    // Fair Value Gap (FVG) detection (simplified)
    let fairValueGap = null;
    if (data.length > 2) {
        const first = data[data.length - 3];
        const third = data[data.length - 1];
        if (isBullish && first.high < third.low) {
            fairValueGap = { type: 'BULLISH', top: third.low, bottom: first.high };
        }
        if (isBearish && first.low > third.high) {
            fairValueGap = { type: 'BEARISH', top: first.low, bottom: third.high };
        }
    }
    
    return { breakOfStructure, fairValueGap };
  }

  // Apply Smart Money Concepts logic to generate a signal
  applySMCLogic(symbol, timeframe, data, structures) {
    const currentPrice = data[data.length - 1].close;
    let direction = 'NEUTRAL';
    let analysisText = 'Market is consolidating. ';

    if (structures.breakOfStructure === 'BULLISH' || structures.fairValueGap?.type === 'BULLISH') {
        direction = 'BUY';
        analysisText = 'Bullish structure detected with a potential break of structure or fair value gap. ';
    } else if (structures.breakOfStructure === 'BEARISH' || structures.fairValueGap?.type === 'BEARISH') {
        direction = 'SELL';
        analysisText = 'Bearish structure detected with a potential break of structure or fair value gap. ';
    }

    if (direction === 'NEUTRAL') {
        return {
            symbol,
            direction: 'NEUTRAL',
            analysis: 'No clear trading signal based on current market structure.',
            timestamp: new Date().toISOString(),
        };
    }

    const signal = this.generateSignal(direction, currentPrice);
    const confidence = this.calculateConfidence(structures);

    return {
      symbol,
      timeframe,
      direction,
      entry: signal.entry,
      stopLoss: signal.stopLoss,
      targets: signal.targets,
      rsr: this.calculateRiskReward(signal),
      confidence,
      analysis: analysisText + `Recommending a ${direction} position.`,
      timestamp: new Date().toISOString(),
    };
  }

  // Generate entry, stop loss, and targets
  generateSignal(direction, currentPrice) {
    const riskPercentage = 0.015; // 1.5%
    const rewardRatio1 = 1;
    const rewardRatio2 = 2;
    const rewardRatio3 = 3;

    let entry, stopLoss, targets;

    if (direction === 'BUY') {
      entry = currentPrice;
      stopLoss = entry * (1 - riskPercentage);
      const riskAmount = entry - stopLoss;
      targets = {
        target1: entry + riskAmount * rewardRatio1,
        target2: entry + riskAmount * rewardRatio2,
        target3: entry + riskAmount * rewardRatio3,
      };
    } else { // SELL
      entry = currentPrice;
      stopLoss = entry * (1 + riskPercentage);
      const riskAmount = stopLoss - entry;
      targets = {
        target1: entry - riskAmount * rewardRatio1,
        target2: entry - riskAmount * rewardRatio2,
        target3: entry - riskAmount * rewardRatio3,
      };
    }

    return {
      direction,
      entry: this.formatPrice(entry),
      stopLoss: this.formatPrice(stopLoss),
      targets: {
        target1: this.formatPrice(targets.target1),
        target2: this.formatPrice(targets.target2),
        target3: this.formatPrice(targets.target3),
      }
    };
  }

  calculateRiskReward(signal) {
    const entry = parseFloat(signal.entry);
    const stopLoss = parseFloat(signal.stopLoss);
    const target1 = parseFloat(signal.targets.target1);
    const risk = Math.abs(entry - stopLoss);
    const reward = Math.abs(target1 - entry);
    return risk > 0 ? (reward / risk).toFixed(2) : 'N/A';
  }

  calculateConfidence(structures) {
    let confidence = 50;
    if (structures.breakOfStructure) confidence += 25;
    if (structures.fairValueGap) confidence += 15;
    return Math.min(confidence, 95);
  }

  formatPrice(price) {
    return price.toFixed(price > 10 ? 2 : 5);
  }
}

// --- API Routes ---
let analyzer = new SmartMoneyAnalyzer(apiKey);

// Endpoint to set the API key
router.post('/set-key', (req, res) => {
  try {
    const { newApiKey } = req.body;
    if (!newApiKey) {
      return res.status(400).json({ error: 'newApiKey is required.' });
    }
    apiKey = newApiKey;
    // Re-initialize the analyzer with the new key
    analyzer = new SmartMoneyAnalyzer(apiKey);
    res.json({ success: true, message: 'API key updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update API key.' });
  }
});

// New endpoint for symbol-based analysis
router.post('/analyze-symbol', async (req, res) => {
  try {
    const { symbol, timeframe } = req.body;
    if (!symbol || !timeframe) {
      return res.status(400).json({ error: 'Symbol and timeframe are required.' });
    }
    const analysis = await analyzer.analyzeSymbol(symbol, timeframe);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to send a signal to users (stores it in memory)
router.post('/signals/send', (req, res) => {
  try {
    const signalData = req.body;
    if (!signalData || !signalData.symbol) {
      return res.status(400).json({ error: 'Invalid signal data.' });
    }
    
    // Avoid duplicates
    if (!userSignals.find(s => s.id === signalData.id)) {
        userSignals.push(signalData);
    }
    
    res.json({ success: true, message: 'Signal sent to users.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send signal.' });
  }
});

// Endpoint for users to fetch the latest signals
router.get('/signals', (req, res) => {
  res.json(userSignals);
});

module.exports = router;
