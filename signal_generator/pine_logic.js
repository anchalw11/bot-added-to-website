// This is a more detailed translation of the PineScript logic.

const BULLISH = 1;
const BEARISH = -1;

class PineLogic {
  constructor(historicalData, riskRewardRatio = 2.0) {
    this.historicalData = historicalData;
    this.riskRewardRatio = riskRewardRatio;
    this.swingHigh = { currentLevel: null, lastLevel: null, crossed: false, barTime: null, barIndex: null };
    this.swingLow = { currentLevel: null, lastLevel: null, crossed: false, barTime: null, barIndex: null };
    this.swingTrend = { bias: 0 };
    this.orderBlocks = [];
    this.atr = this.calculateATR(20);
  }

  calculateATR(period) {
    let tr = [];
    for (let i = 1; i < this.historicalData.length; i++) {
      const high = this.historicalData[i].high;
      const low = this.historicalData[i].low;
      const prevClose = this.historicalData[i - 1].close;
      tr.push(Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose)));
    }
    const atr = tr.slice(-period).reduce((a, b) => a + b, 0) / period;
    return atr;
  }

  findPivots(lookback = 15) { // Increased lookback for more significant pivots
    const pivots = { highs: [], lows: [] };
    for (let i = lookback; i < this.historicalData.length - lookback; i++) {
      const window = this.historicalData.slice(i - lookback, i + lookback + 1);
      const max = Math.max(...window.map(p => p.high));
      const min = Math.min(...window.map(p => p.low));

      if (this.historicalData[i].high === max) {
        pivots.highs.push({
          level: this.historicalData[i].high,
          time: this.historicalData[i].date,
          index: i
        });
      }
      if (this.historicalData[i].low === min) {
        pivots.lows.push({
          level: this.historicalData[i].low,
          time: this.historicalData[i].date,
          index: i
        });
      }
    }
    if (pivots.highs.length > 0) {
        this.swingHigh.lastLevel = this.swingHigh.currentLevel;
        this.swingHigh.currentLevel = pivots.highs[pivots.highs.length - 1].level;
    }
    if (pivots.lows.length > 0) {
        this.swingLow.lastLevel = this.swingLow.currentLevel;
        this.swingLow.currentLevel = pivots.lows[pivots.lows.length - 1].level;
    }
  }

  storeOrderBlock(bias) {
    const bars = this.historicalData.slice(1, 5); // Look at last 4 bars for OB
    let orderBlock = null;

    if (bias === BULLISH) {
        // Find a down-close candle before an up-move
        const potentialOB = bars.find((bar, i) => i > 0 && bar.close < bar.open && bars[i-1].close > bars[i-1].open);
        if (potentialOB) {
            orderBlock = {
                barHigh: potentialOB.high,
                barLow: potentialOB.low,
                barTime: potentialOB.date,
                bias: BULLISH
            };
        }
    } else if (bias === BEARISH) {
        // Find an up-close candle before a down-move
        const potentialOB = bars.find((bar, i) => i > 0 && bar.close > bar.open && bars[i-1].close < bars[i-1].open);
        if (potentialOB) {
            orderBlock = {
                barHigh: potentialOB.high,
                barLow: potentialOB.low,
                barTime: potentialOB.date,
                bias: BEARISH
            };
        }
    }

    if (orderBlock) {
      this.orderBlocks.unshift(orderBlock);
      if (this.orderBlocks.length > 10) {
        this.orderBlocks.pop();
      }
    }
  }

  generateSignal() {
    this.findPivots();
    const latestData = this.historicalData[0];
    let signal = null;

    if (this.swingHigh.currentLevel && latestData.close > this.swingHigh.currentLevel) {
      const isBOS = this.swingTrend.bias === BULLISH;
      this.swingTrend.bias = BULLISH;
      this.storeOrderBlock(BULLISH);
      signal = this.createTradingLevel(BULLISH, this.swingHigh.currentLevel, isBOS);
    } else if (this.swingLow.currentLevel && latestData.close < this.swingLow.currentLevel) {
      const isBOS = this.swingTrend.bias === BEARISH;
      this.swingTrend.bias = BEARISH;
      this.storeOrderBlock(BEARISH);
      signal = this.createTradingLevel(BEARISH, this.swingLow.currentLevel, isBOS);
    }

    return signal;
  }

  createTradingLevel(bias, brokenLevel, isBOS) {
    const entryPrice = this.historicalData[0].close;
    let stopLossLevel;
    
    const relevantOrderBlock = this.orderBlocks.find(ob => ob.bias === bias);

    if (bias === BULLISH) {
      stopLossLevel = relevantOrderBlock ? relevantOrderBlock.barLow - (this.atr * 0.25) : this.swingLow.currentLevel - (this.atr * 0.5);
    } else {
      stopLossLevel = relevantOrderBlock ? relevantOrderBlock.barHigh + (this.atr * 0.25) : this.swingHigh.currentLevel + (this.atr * 0.5);
    }

    const riskDistance = Math.abs(entryPrice - stopLossLevel);
    const takeProfitLevel = bias === BULLISH 
      ? entryPrice + (riskDistance * this.riskRewardRatio)
      : entryPrice - (riskDistance * this.riskRewardRatio);

    return {
      direction: bias === BULLISH ? 'BUY' : 'SELL',
      entry: entryPrice,
      stopLoss: stopLossLevel,
      targets: {
        target1: takeProfitLevel,
        target2: bias === BULLISH ? entryPrice + (riskDistance * (this.riskRewardRatio + 1)) : entryPrice - (riskDistance * (this.riskRewardRatio + 1)),
        target3: bias === BULLISH ? entryPrice + (riskDistance * (this.riskRewardRatio + 2)) : entryPrice - (riskDistance * (this.riskRewardRatio + 2)),
      },
      rsr: this.riskRewardRatio.toFixed(2),
      confidence: isBOS ? 85 : 75,
      analysis: `A ${isBOS ? 'BOS' : 'CHoCH'} signal was detected.`,
      timestamp: new Date().toISOString(),
      lotSize: '1.0 lots',
    };
  }
}

module.exports = PineLogic;
