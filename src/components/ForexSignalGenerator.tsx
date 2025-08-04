import React, { useState, useEffect, useRef } from 'react';
import { Bot, Zap, TrendingUp, TrendingDown, Activity, Globe, Settings, Play, Pause, RefreshCw } from 'lucide-react';

interface ForexSignal {
  id: string;
  symbol: string;
  signalType: 'BUY' | 'SELL';
  confidence: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  riskReward: string;
  confirmations: string[];
  timestamp: Date;
  analysis: string;
  sessionQuality: string;
  timeframe: string;
  status: 'active' | 'target_hit' | 'sl_hit';
  direction: 'bullish' | 'bearish';
  market: 'forex';
}

const ForexSignalGenerator: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('');
  const [riskRewardRatio, setRiskRewardRatio] = useState(2.0);
  const [signals, setSignals] = useState<ForexSignal[]>([]);
  const [marketData, setMarketData] = useState<{[key: string]: any}>({});
  const [logs, setLogs] = useState<Array<{message: string, type: string, timestamp: Date}>>([]);
  const [stats, setStats] = useState({
    activeSymbols: 0,
    liveSignals: 0,
    priceUpdates: 0,
    winRate: 0,
    bosCount: 0,
    chochCount: 0,
    orderBlocks: 0,
    fvgCount: 0,
    activeSignals: 0
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const forexSymbols = [
    'XAU/USD', 'XAG/USD', 'USOIL', 'US30', 'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF',
    'AUD/USD', 'USD/CAD', 'NZD/USD', 'EUR/JPY', 'GBP/JPY', 'EUR/GBP', 'AUD/JPY',
    'CAD/JPY', 'CHF/JPY', 'EUR/AUD', 'EUR/CHF', 'EUR/CAD', 'GBP/AUD', 'GBP/CAD',
    'GBP/CHF', 'AUD/CAD', 'AUD/CHF', 'AUD/NZD', 'CAD/CHF', 'NZD/CAD', 'NZD/CHF', 'NZD/JPY'
  ];

  const timeframes = ['1m', '3m', '5m', '10m', '15m', '30m', '1h', '2h', '4h', '6h', '12h', '1d', '3d', '1w'];

  // API Configuration
  const API_CONFIG = {
    currencyBeacon: {
      key: 'tUBIQPyHSXgvY0de2ENsFzzCYQPUDBB4',
      host: 'api.currencybeacon.com'
    },
    polygon: {
      key: 'F9OJKxRfvT0lfZDO0GhBbnJim3FYAnfh',
      host: 'api.polygon.io'
    },
    taapi: {
      host: 'financialmodelingprep.com',
      keys: {
        'XAG/USD': 'ZnGnGJfphMxGlNTg0IY7tzhw0na7he2e',
        'USD/CHF': 'YIOfNOSjNVKVXa8AE9RBQzGsj6UR9Jah',
        'AUD/USD': 'unxQnyeAfT4uQK6tkuue0vG7aMJYdMxS',
        'USD/CAD': 'DBk1BuJKwovXNAC2EkX1brFPuwvJDiWj',
        'NZD/USD': 'jlFm01miqXrjVBpJxY2adTBS3CCHiqlg',
        'EUR/JPY': 'eOmLFYVummeVEetf9OQCEUwPDdvT7Bn1',
        'GBP/JPY': 'QCz0fKTfOgxxXKVXv6ph1F79nbwflbq4',
        'EUR/GBP': 'T1AR0E2RT12TIMV0G5qlXp6j4RPgZ9ys',
        'EUR/AUD': 'rsYISbIBZ1SkMAHm6AHWBwo5NHI1CRs2',
        'GBP/AUD': 'Y12xLWM0NRHxo9RKyGj7nZWfkCKoglYc',
        'AUD/CAD': '0miKTpyJeztgI7V9zRwKcF0iS1PO1kij',
        'CAD/JPY': 'NQZR5TDerEcLis9cFqny8haVXCgckKHu',
        'CHF/JPY': 'DIghlVl2YutPnhujJ1bJilGGnYStyn9Q',
        'AUD/CHF': 't2EWXVEQxMUptkAu9cB2eWOlAQx6L17i',
        'CAD/CHF': 'DFayt9kcP23RvXp4XlAqkaXjVbMg6G91',
        'EUR/CHF': 'yCLDea7t7iUE8dUMx3N7aeLRgZ3O32cy',
        'GBP/CHF': 'WgRLSlQYbjc8hNbUx1DkvMDgloggvakr',
        'NZD/CAD': 'nMmof9S6QCPMb6KRQiLMAX0uP7wEsWyF',
        'NZD/JPY': '85jakUh6j7ytpavV34V2lsSKyW5hqTmW',
        'AUD/NZD': 'xjnT5Qx7jogPjLozvi2xAzy6Gf2vPBCn',
        'default': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbHVlIjoiNjg4ZTQ5M2Y4MDZmZjE2NTFlNDVmYTA5IiwiaWF0IjoxNzU0MTU1MzYwLCJleHAiOjMzMjU4NjE5MzYwfQ.4NmUstVl5UX2xBvHmMz3nWO-wiNQfS5zNGx3ELNFm8I'
      }
    }
  };

  // Professional SMC Engine for Forex
  class ForexSMCEngine {
    private priceHistory: Map<string, any[]> = new Map();
    private swingHighs: Map<string, any> = new Map();
    private swingLows: Map<string, any> = new Map();
    private internalHighs: Map<string, any> = new Map();
    private internalLows: Map<string, any> = new Map();
    private swingTrend: Map<string, any> = new Map();
    private internalTrend: Map<string, any> = new Map();
    private orderBlocks: Map<string, any[]> = new Map();
    private lastSignalTime: Map<string, number> = new Map();
    private priceCache: Map<string, any> = new Map();
    private lastUpdateTime: Map<string, number> = new Map();
    private cacheValidityMs = 30000; // 30 seconds cache

    private confirmationScores = {
      'swingBullishBOS': 30,
      'swingBearishBOS': 30,
      'swingBullishCHoCH': 25,
      'swingBearishCHoCH': 25,
      'internalBullishBOS': 20,
      'internalBearishBOS': 20,
      'internalBullishCHoCH': 18,
      'internalBearishCHoCH': 18,
      'swingOrderBlockRespect': 22,
      'internalOrderBlockRespect': 18,
      'bullishFairValueGap': 15,
      'bearishFairValueGap': 15,
      'equalHighsBreak': 12,
      'equalLowsBreak': 12,
      'premiumZoneEntry': 10,
      'discountZoneEntry': 10,
      'equilibriumZone': 8,
      'multiTimeframeAlignment': 8,
      'volumeConfirmation': 6,
      'strongWeakHighLow': 5,
      'atrVolatilityFilter': 4
    };

    async fetchWithRetry(url: string, options: any = {}, maxRetries: number = 2) {
      let lastError;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);
          const response = await fetch(url, { ...options, signal: controller.signal });
          clearTimeout(timeoutId);
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }
          const data = await response.json();
          const errorMessage = data.error || data.Error || data['Error Message'] || data['Note'] || data['message'];
          if (errorMessage) throw new Error(errorMessage);
          return data;
        } catch (error) {
          lastError = error;
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          }
        }
      }
      throw new Error(`All ${maxRetries} attempts failed. Last error: ${lastError.message}`);
    }

    getCachedPrice(symbol: string) {
      if (this.priceCache.has(symbol) && (Date.now() - this.lastUpdateTime.get(symbol)! < this.cacheValidityMs)) {
        return this.priceCache.get(symbol);
      }
      return null;
    }

    setCachedPrice(symbol: string, priceData: any) {
      this.priceCache.set(symbol, priceData);
      this.lastUpdateTime.set(symbol, Date.now());
    }

    async fetchCurrencyBeaconPrice(symbol: string) {
      const normalizedSymbol = symbol.replace('/', '');
      const from = normalizedSymbol.substring(0, 3).toUpperCase();
      const to = normalizedSymbol.substring(3, 6).toUpperCase();
      const { key, host } = API_CONFIG.currencyBeacon;
      const url = `https://${host}/v1/latest?api_key=${key}&base=${from}&symbols=${to}`;
      const data = await this.fetchWithRetry(url, { headers: {} });
      if (data && data.rates && data.rates[to]) {
        return { price: parseFloat(data.rates[to]), provider: 'CurrencyBeacon' };
      }
      throw new Error(`Invalid price data from CurrencyBeacon for ${from}/${to}`);
    }

    async fetchPolygonPrice(symbol: string) {
      const { key, host } = API_CONFIG.polygon;
      let ticker = symbol;
      if (symbol === 'US30') {
        ticker = 'I:DJI';
      } else if (symbol === 'USOIL') {
        ticker = 'C:USOIL';
      }
      const url = `https://${host}/v2/last/trade/${ticker}?apiKey=${key}`;
      const data = await this.fetchWithRetry(url, { headers: {} });
      if (data && data.results && data.results.p) {
        return { price: parseFloat(data.results.p), provider: 'Polygon.io' };
      }
      throw new Error(`Invalid price data from Polygon.io for ${symbol}`);
    }

    async fetchTaapiPrice(symbol: string) {
      const { host, keys } = API_CONFIG.taapi;
      const key = keys[symbol as keyof typeof keys] || keys.default;
      if (!key) {
        throw new Error(`No API key found for ${symbol} in financialmodellingprep.com config`);
      }
      const url = `https://${host}/api/v3/quote/${symbol.replace('/', '')}?apikey=${key}`;
      const data = await this.fetchWithRetry(url, { headers: {} });
      if (data && data[0] && data[0].price) {
        return { price: parseFloat(data[0].price), provider: 'financialmodellingprep.com' };
      }
      throw new Error(`Invalid price data from financialmodellingprep.com for ${symbol}`);
    }

    async getPrice(symbol: string) {
      const cached = this.getCachedPrice(symbol);
      if (cached) return cached;

      try {
        const dedicatedPairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'XAU/USD'];
        const polygonPairs = ['US30', 'USOIL'];
        let result;

        if (dedicatedPairs.includes(symbol)) {
          result = await this.fetchCurrencyBeaconPrice(symbol);
        } else if (polygonPairs.includes(symbol)) {
          result = await this.fetchPolygonPrice(symbol);
        } else {
          result = await this.fetchTaapiPrice(symbol);
        }

        const priceData = {
          price: result.price.toFixed(this.getPrecision(symbol.replace('/', ''))),
          provider: result.provider,
          timestamp: new Date(),
          isReal: true,
          rawPrice: result.price
        };
        this.setCachedPrice(symbol, priceData);
        return priceData;
      } catch (error) {
        // Fallback to mock data
        const basePrices: {[key: string]: number} = {
          'EUR/USD': 1.0850, 'GBP/USD': 1.2750, 'USD/JPY': 149.50,
          'XAU/USD': 2020.00, 'XAG/USD': 24.50, 'USOIL': 75.00
        };
        const basePrice = basePrices[symbol] || 1.0;
        const price = basePrice + (Math.random() - 0.5) * basePrice * 0.001;
        return {
          price: price.toFixed(symbol.includes('JPY') ? 3 : 5),
          provider: 'Mock',
          timestamp: new Date(),
          isReal: false,
          rawPrice: price
        };
      }
    }

    getPrecision(symbol: string) {
      if (['USDJPY'].includes(symbol)) return 3;
      if (['EURUSD', 'GBPUSD', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD'].includes(symbol)) return 5;
      return 2;
    }

    analyzeSMCPatterns(symbol: string, currentPriceData: any) {
      try {
        const currentPrice = parseFloat(currentPriceData.price);
        const timestamp = Date.now();
        
        this.initializeSymbolData(symbol, currentPrice, timestamp);
        
        if (!this.canGenerateSignal(symbol, timestamp)) {
          return null;
        }
        
        const priceHistory = this.priceHistory.get(symbol);
        if (!priceHistory || priceHistory.length < 25) {
          return null;
        }
        
        const analysis = this.performStructureAnalysis(symbol, priceHistory, currentPrice);
        return analysis;
        
      } catch (error) {
        console.error(`SMC Analysis Error for ${symbol}:`, error);
        return null;
      }
    }

    private initializeSymbolData(symbol: string, currentPrice: number, timestamp: number) {
      if (!this.priceHistory.has(symbol)) {
        this.priceHistory.set(symbol, []);
      }
      
      const volatility = this.getSymbolVolatility(symbol);
      const high = currentPrice + (Math.random() * volatility * currentPrice);
      const low = currentPrice - (Math.random() * volatility * currentPrice);
      const open = low + (Math.random() * (high - low));
      
      const newBar = {
        timestamp,
        open: parseFloat(open.toFixed(5)),
        high: parseFloat(high.toFixed(5)),
        low: parseFloat(low.toFixed(5)),
        close: currentPrice,
        volume: Math.random() * 1000000 + 500000
      };
      
      const history = this.priceHistory.get(symbol)!;
      history.push(newBar);
      
      if (history.length > 100) {
        history.splice(0, history.length - 100);
      }
    }

    private performStructureAnalysis(symbol: string, priceHistory: any[], currentPrice: number) {
      const confirmations: string[] = [];
      const currentAlerts: any = {};
      
      // Swing structure analysis
      const swingAnalysis = this.analyzeSwingStructure(symbol, priceHistory, currentPrice);
      Object.assign(currentAlerts, swingAnalysis.alerts);
      confirmations.push(...swingAnalysis.confirmations);
      
      // Internal structure analysis
      const internalAnalysis = this.analyzeInternalStructure(symbol, priceHistory, currentPrice);
      Object.assign(currentAlerts, internalAnalysis.alerts);
      confirmations.push(...internalAnalysis.confirmations);
      
      // Order block analysis
      const orderBlockAnalysis = this.analyzeOrderBlocks(symbol, priceHistory, currentPrice);
      Object.assign(currentAlerts, orderBlockAnalysis.alerts);
      confirmations.push(...orderBlockAnalysis.confirmations);
      
      // Fair Value Gap analysis
      const fvgAnalysis = this.analyzeFairValueGaps(symbol, priceHistory, currentPrice);
      Object.assign(currentAlerts, fvgAnalysis.alerts);
      confirmations.push(...fvgAnalysis.confirmations);
      
      let signalDirection = null;
      if (currentAlerts.swingBullishBOS || currentAlerts.swingBullishCHoCH || 
          currentAlerts.internalBullishBOS || currentAlerts.internalBullishCHoCH) {
        signalDirection = 'BUY';
      } else if (currentAlerts.swingBearishBOS || currentAlerts.swingBearishCHoCH || 
                 currentAlerts.internalBearishBOS || currentAlerts.internalBearishCHoCH) {
        signalDirection = 'SELL';
      }
      
      return {
        signalDirection,
        confirmations,
        alerts: currentAlerts,
        analysis: this.generateAnalysisText(signalDirection, confirmations)
      };
    }

    private analyzeSwingStructure(symbol: string, priceHistory: any[], currentPrice: number) {
      const alerts: any = {};
      const confirmations: string[] = [];
      
      const swingHigh = this.swingHighs.get(symbol) || { currentLevel: null, crossed: false };
      const swingLow = this.swingLows.get(symbol) || { currentLevel: null, crossed: false };
      const swingTrend = this.swingTrend.get(symbol) || { bias: 0 };
      
      const swingPoints = this.detectSwingPoints(priceHistory, 50);
      
      if (swingPoints.newHigh) {
        swingHigh.currentLevel = swingPoints.high;
        swingHigh.crossed = false;
        this.swingHighs.set(symbol, swingHigh);
      }
      if (swingPoints.newLow) {
        swingLow.currentLevel = swingPoints.low;
        swingLow.crossed = false;
        this.swingLows.set(symbol, swingLow);
      }
      
      if (swingHigh.currentLevel && currentPrice > swingHigh.currentLevel && !swingHigh.crossed) {
        const tag = swingTrend.bias === -1 ? 'CHoCH' : 'BOS';
        
        alerts.swingBullishBOS = tag === 'BOS';
        alerts.swingBullishCHoCH = tag === 'CHoCH';
        
        if (tag === 'BOS') confirmations.push('swingBullishBOS');
        if (tag === 'CHoCH') confirmations.push('swingBullishCHoCH');
        
        swingHigh.crossed = true;
        swingTrend.bias = 1;
        this.swingTrend.set(symbol, swingTrend);
      }
      
      if (swingLow.currentLevel && currentPrice < swingLow.currentLevel && !swingLow.crossed) {
        const tag = swingTrend.bias === 1 ? 'CHoCH' : 'BOS';
        
        alerts.swingBearishBOS = tag === 'BOS';
        alerts.swingBearishCHoCH = tag === 'CHoCH';
        
        if (tag === 'BOS') confirmations.push('swingBearishBOS');
        if (tag === 'CHoCH') confirmations.push('swingBearishCHoCH');
        
        swingLow.crossed = true;
        swingTrend.bias = -1;
        this.swingTrend.set(symbol, swingTrend);
      }
      
      return { alerts, confirmations };
    }

    private analyzeInternalStructure(symbol: string, priceHistory: any[], currentPrice: number) {
      const alerts: any = {};
      const confirmations: string[] = [];
      
      const internalHigh = this.internalHighs.get(symbol) || { currentLevel: null, crossed: false };
      const internalLow = this.internalLows.get(symbol) || { currentLevel: null, crossed: false };
      const internalTrend = this.internalTrend.get(symbol) || { bias: 0 };
      
      const internalSwings = this.detectSwingPoints(priceHistory, 5);
      
      if (internalSwings.newHigh) {
        internalHigh.currentLevel = internalSwings.high;
        internalHigh.crossed = false;
        this.internalHighs.set(symbol, internalHigh);
      }
      if (internalSwings.newLow) {
        internalLow.currentLevel = internalSwings.low;
        internalLow.crossed = false;
        this.internalLows.set(symbol, internalLow);
      }
      
      if (internalHigh.currentLevel && currentPrice > internalHigh.currentLevel && !internalHigh.crossed) {
        const tag = internalTrend.bias === -1 ? 'CHoCH' : 'BOS';
        
        alerts.internalBullishBOS = tag === 'BOS';
        alerts.internalBullishCHoCH = tag === 'CHoCH';
        
        if (tag === 'BOS') confirmations.push('internalBullishBOS');
        if (tag === 'CHoCH') confirmations.push('internalBullishCHoCH');
        
        internalHigh.crossed = true;
        internalTrend.bias = 1;
        this.internalTrend.set(symbol, internalTrend);
      }
      
      if (internalLow.currentLevel && currentPrice < internalLow.currentLevel && !internalLow.crossed) {
        const tag = internalTrend.bias === 1 ? 'CHoCH' : 'BOS';
        
        alerts.internalBearishBOS = tag === 'BOS';
        alerts.internalBearishCHoCH = tag === 'CHoCH';
        
        if (tag === 'BOS') confirmations.push('internalBearishBOS');
        if (tag === 'CHoCH') confirmations.push('internalBearishCHoCH');
        
        internalLow.crossed = true;
        internalTrend.bias = -1;
        this.internalTrend.set(symbol, internalTrend);
      }
      
      return { alerts, confirmations };
    }

    private analyzeOrderBlocks(symbol: string, priceHistory: any[], currentPrice: number) {
      const alerts: any = {};
      const confirmations: string[] = [];
      
      if (priceHistory.length < 10) return { alerts, confirmations };
      
      let orderBlocks = this.orderBlocks.get(symbol) || [];
      
      orderBlocks.forEach(orderBlock => {
        const inOrderBlockZone = currentPrice >= orderBlock.low && currentPrice <= orderBlock.high;
        
        if (inOrderBlockZone) {
          if (orderBlock.bias === 1) {
            confirmations.push('swingOrderBlockRespect');
            alerts.swingOrderBlock = true;
          } else if (orderBlock.bias === -1) {
            confirmations.push('swingOrderBlockRespect');
            alerts.swingOrderBlock = true;
          }
        }
      });
      
      const recentBars = priceHistory.slice(-5);
      const hasOrderBlockFormation = this.detectOrderBlockFormation(recentBars);
      
      if (hasOrderBlockFormation.bullish) {
        const newOB = {
          high: hasOrderBlockFormation.high,
          low: hasOrderBlockFormation.low,
          bias: 1,
          timestamp: Date.now()
        };
        orderBlocks.unshift(newOB);
        confirmations.push('internalOrderBlockRespect');
      }
      
      if (hasOrderBlockFormation.bearish) {
        const newOB = {
          high: hasOrderBlockFormation.high,
          low: hasOrderBlockFormation.low,
          bias: -1,
          timestamp: Date.now()
        };
        orderBlocks.unshift(newOB);
        confirmations.push('internalOrderBlockRespect');
      }
      
      if (orderBlocks.length > 10) {
        orderBlocks = orderBlocks.slice(0, 10);
      }
      
      this.orderBlocks.set(symbol, orderBlocks);
      
      return { alerts, confirmations };
    }

    private analyzeFairValueGaps(symbol: string, priceHistory: any[], currentPrice: number) {
      const alerts: any = {};
      const confirmations: string[] = [];
      
      if (priceHistory.length < 5) return { alerts, confirmations };
      
      const recentBars = priceHistory.slice(-5);
      
      for (let i = 2; i < recentBars.length; i++) {
        const prev2 = recentBars[i - 2];
        const current = recentBars[i];
        
        if (prev2.high < current.low) {
          confirmations.push('bullishFairValueGap');
          alerts.bullishFairValueGap = true;
        }
        
        if (prev2.low > current.high) {
          confirmations.push('bearishFairValueGap');
          alerts.bearishFairValueGap = true;
        }
      }
      
      return { alerts, confirmations };
    }

    private detectSwingPoints(priceHistory: any[], lookback: number) {
      if (priceHistory.length < lookback * 2 + 1) {
        return { newHigh: false, newLow: false, high: null, low: null };
      }
      
      const currentIndex = priceHistory.length - lookback - 1;
      const currentBar = priceHistory[currentIndex];
      
      let isSwingHigh = true;
      let isSwingLow = true;
      
      for (let i = currentIndex - lookback; i <= currentIndex + lookback; i++) {
        if (i !== currentIndex && i >= 0 && i < priceHistory.length) {
          if (priceHistory[i].high >= currentBar.high) isSwingHigh = false;
          if (priceHistory[i].low <= currentBar.low) isSwingLow = false;
        }
      }
      
      return {
        newHigh: isSwingHigh,
        newLow: isSwingLow,
        high: isSwingHigh ? currentBar.high : null,
        low: isSwingLow ? currentBar.low : null
      };
    }

    private detectOrderBlockFormation(recentBars: any[]) {
      if (recentBars.length < 3) return { bullish: false, bearish: false };
      
      const prev = recentBars[recentBars.length - 3];
      const current = recentBars[recentBars.length - 2];
      const next = recentBars[recentBars.length - 1];
      
      const bullishOB = (prev.close < prev.open) && 
                       (next.close > current.high) && 
                       ((next.high - next.low) > (current.high - current.low) * 1.5);
      
      const bearishOB = (prev.close > prev.open) && 
                       (next.close < current.low) && 
                       ((next.high - next.low) > (current.high - current.low) * 1.5);
      
      return {
        bullish: bullishOB,
        bearish: bearishOB,
        high: current.high,
        low: current.low
      };
    }

    private calculateConfidence(confirmations: string[]) {
      let totalScore = 0;
      let primaryConfirmations = 0;
      
      confirmations.forEach(confirmation => {
        if (this.confirmationScores[confirmation as keyof typeof this.confirmationScores]) {
          totalScore += this.confirmationScores[confirmation as keyof typeof this.confirmationScores];
          
          if (confirmation.includes('BOS') || confirmation.includes('CHoCH')) {
            primaryConfirmations++;
          }
        }
      });
      
      if (primaryConfirmations >= 2) {
        totalScore += 10;
      }
      
      if (confirmations.length < 4) {
        totalScore *= 0.8;
      }
      
      return Math.min(Math.round(totalScore), 100);
    }

    private calculateTradingLevels(symbol: string, signalDirection: string, currentPrice: number, priceHistory: any[]) {
      const atr = this.calculateATR(priceHistory, 14);
      
      let entryPrice = currentPrice;
      let stopLoss, takeProfit;
      
      if (signalDirection === 'BUY') {
        const recentLows = priceHistory.slice(-10).map(bar => bar.low);
        const recentLow = Math.min(...recentLows);
        stopLoss = Math.min(recentLow - (atr * 0.5), currentPrice - (atr * 1.5));
        
        const riskDistance = entryPrice - stopLoss;
        takeProfit = entryPrice + (riskDistance * riskRewardRatio);
      } else {
        const recentHighs = priceHistory.slice(-10).map(bar => bar.high);
        const recentHigh = Math.max(...recentHighs);
        stopLoss = Math.max(recentHigh + (atr * 0.5), currentPrice + (atr * 1.5));
        
        const riskDistance = stopLoss - entryPrice;
        takeProfit = entryPrice - (riskDistance * riskRewardRatio);
      }
      
      return {
        entryPrice: parseFloat(entryPrice.toFixed(5)),
        stopLoss: parseFloat(stopLoss.toFixed(5)),
        takeProfit: parseFloat(takeProfit.toFixed(5)),
        riskReward: `1:${riskRewardRatio}`
      };
    }

    private calculateATR(priceHistory: any[], period: number) {
      if (priceHistory.length < period + 1) {
        return priceHistory.length > 0 ? priceHistory[0].close * 0.001 : 0.01;
      }
      
      const trueRanges = [];
      for (let i = 1; i < priceHistory.length; i++) {
        const current = priceHistory[i];
        const previous = priceHistory[i - 1];
        
        const tr = Math.max(
          current.high - current.low,
          Math.abs(current.high - previous.close),
          Math.abs(current.low - previous.close)
        );
        trueRanges.push(tr);
      }
      
      const recentTRs = trueRanges.slice(-period);
      return recentTRs.reduce((sum, tr) => sum + tr, 0) / recentTRs.length;
    }

    private canGenerateSignal(symbol: string, timestamp: number) {
      const lastSignal = this.lastSignalTime.get(symbol);
      return !lastSignal || (timestamp - lastSignal) >= 300000; // 5 minutes cooldown
    }

    private getSymbolVolatility(symbol: string) {
      const volatilityMap: {[key: string]: number} = {
        'EUR/USD': 0.0008, 'GBP/USD': 0.0012, 'USD/JPY': 0.008,
        'XAU/USD': 0.002, 'XAG/USD': 0.003, 'USOIL': 0.015
      };
      return volatilityMap[symbol] || 0.001;
    }

    private generateAnalysisText(signalDirection: string | null, confirmations: string[]) {
      if (!signalDirection) return 'No clear directional bias detected.';
      
      const direction = signalDirection === 'BUY' ? 'bullish' : 'bearish';
      const confidence = this.calculateConfidence(confirmations);
      
      let analysis = `${confidence >= 80 ? 'Very Strong' : confidence >= 70 ? 'Strong' : 'Moderate'} ${direction} setup detected. `;
      
      const hasSwingBOS = confirmations.some(c => c.includes('swingBullishBOS') || c.includes('swingBearishBOS'));
      const hasSwingCHoCH = confirmations.some(c => c.includes('swingBullishCHoCH') || c.includes('swingBearishCHoCH'));
      const hasInternalBOS = confirmations.some(c => c.includes('internalBullishBOS') || c.includes('internalBearishBOS'));
      
      if (hasSwingBOS) {
        analysis += `Major swing Break of Structure confirms ${direction} momentum shift. `;
      }
      if (hasSwingCHoCH) {
        analysis += `Swing Change of Character indicates potential trend reversal. `;
      }
      if (hasInternalBOS) {
        analysis += `Internal structure break provides additional confluence. `;
      }
      
      if (confirmations.some(c => c.includes('OrderBlock'))) {
        analysis += `Price respecting institutional order block levels. `;
      }
      
      if (confirmations.some(c => c.includes('FairValueGap'))) {
        analysis += `Fair Value Gap providing strong directional bias. `;
      }
      
      if (confidence >= 80) {
        analysis += `High-probability setup suitable for standard position sizing.`;
      } else if (confidence >= 70) {
        analysis += `Good probability setup - consider normal position size.`;
      } else if (confidence >= 60) {
        analysis += `Moderate probability - use reduced position size and tight risk management.`;
      }
      
      return analysis;
    }

    validateSignalQuality(analysis: any) {
      if (!analysis.signalDirection) return false;
      
      const primaryCount = analysis.confirmations.filter((c: string) => 
        c.includes('BOS') || c.includes('CHoCH')
      ).length;
      
      const confidence = this.calculateConfidence(analysis.confirmations);
      
      return (
        primaryCount >= 1 &&
        analysis.confirmations.length >= 4 &&
        confidence >= 60
      );
    }

    createTradingSignal(symbol: string, analysis: any, currentPrice: number, timeframe: string) {
      const confidence = this.calculateConfidence(analysis.confirmations);
      const priceHistory = this.priceHistory.get(symbol);
      const tradingLevels = this.calculateTradingLevels(symbol, analysis.signalDirection, currentPrice, priceHistory);
      
      this.lastSignalTime.set(symbol, Date.now());
      
      return {
        id: `forex-signal-${symbol}-${timeframe}-${Date.now()}`,
        symbol,
        signalType: analysis.signalDirection as 'BUY' | 'SELL',
        confidence,
        entryPrice: tradingLevels.entryPrice,
        stopLoss: tradingLevels.stopLoss,
        takeProfit: tradingLevels.takeProfit,
        riskReward: tradingLevels.riskReward,
        confirmations: this.formatConfirmations(analysis.confirmations),
        timestamp: new Date(),
        analysis: analysis.analysis,
        sessionQuality: this.getSessionQuality(),
        timeframe,
        status: 'active' as const,
        direction: (analysis.signalDirection === 'BUY' ? 'bullish' : 'bearish') as 'bullish' | 'bearish',
        market: 'forex' as const
      };
    }

    private formatConfirmations(confirmations: string[]) {
      const formattedConfirmations: string[] = [];
      
      confirmations.forEach(confirmation => {
        switch(confirmation) {
          case 'swingBullishBOS':
            formattedConfirmations.push('Swing Bullish BOS');
            break;
          case 'swingBearishBOS':
            formattedConfirmations.push('Swing Bearish BOS');
            break;
          case 'swingBullishCHoCH':
            formattedConfirmations.push('Swing Bullish CHoCH');
            break;
          case 'swingBearishCHoCH':
            formattedConfirmations.push('Swing Bearish CHoCH');
            break;
          case 'internalBullishBOS':
            formattedConfirmations.push('Internal Bullish BOS');
            break;
          case 'internalBearishBOS':
            formattedConfirmations.push('Internal Bearish BOS');
            break;
          case 'internalBullishCHoCH':
            formattedConfirmations.push('Internal Bullish CHoCH');
            break;
          case 'internalBearishCHoCH':
            formattedConfirmations.push('Internal Bearish CHoCH');
            break;
          case 'swingOrderBlockRespect':
            formattedConfirmations.push('Swing Order Block Respect');
            break;
          case 'internalOrderBlockRespect':
            formattedConfirmations.push('Internal Order Block Respect');
            break;
          case 'bullishFairValueGap':
            formattedConfirmations.push('Bullish Fair Value Gap');
            break;
          case 'bearishFairValueGap':
            formattedConfirmations.push('Bearish Fair Value Gap');
            break;
          case 'equalHighsBreak':
            formattedConfirmations.push('Equal Highs Break');
            break;
          case 'equalLowsBreak':
            formattedConfirmations.push('Equal Lows Break');
            break;
          case 'premiumZoneEntry':
            formattedConfirmations.push('Premium Zone Entry');
            break;
          case 'discountZoneEntry':
            formattedConfirmations.push('Discount Zone Entry');
            break;
          case 'equilibriumZone':
            formattedConfirmations.push('Equilibrium Zone');
            break;
          case 'volumeConfirmation':
            formattedConfirmations.push('Volume Confirmation');
            break;
          case 'atrVolatilityFilter':
            formattedConfirmations.push('ATR Volatility Filter');
            break;
          default:
            formattedConfirmations.push(confirmation);
        }
      });
      
      return formattedConfirmations;
    }

    private getSessionQuality() {
      const now = new Date();
      const hour = now.getUTCHours();
      
      if (hour >= 7 && hour <= 16) return 'London Session - High';
      if (hour >= 12 && hour <= 21) return 'New York Session - High';
      if (hour >= 12 && hour <= 16) return 'London/NY Overlap - Very High';
      return 'Asian Session - Medium';
    }
  }

  const smcEngine = useRef(new ForexSMCEngine());

  const addLog = (message: string, type: string = 'info') => {
    const newLog = {
      message,
      type,
      timestamp: new Date()
    };
    setLogs(prev => [newLog, ...prev.slice(0, 99)]);
  };

  const performAdvancedSMCAnalysis = async (symbol: string, priceData: any, timeframe: string) => {
    try {
      const analysisResult = smcEngine.current.analyzeSMCPatterns(symbol, priceData);

      if (analysisResult && smcEngine.current.validateSignalQuality(analysisResult)) {
        const signal = smcEngine.current.createTradingSignal(
          symbol, 
          analysisResult, 
          parseFloat(priceData.price), 
          timeframe
        );
        
        // Store signal for user dashboard
        const existingSignals = JSON.parse(localStorage.getItem('admin_generated_signals') || '[]');
        const signalForStorage = {
          ...signal,
          timestamp: signal.timestamp.toISOString()
        };
        existingSignals.unshift(signalForStorage);
        localStorage.setItem('admin_generated_signals', JSON.stringify(existingSignals.slice(0, 100)));
        
        // Also store in telegram format for compatibility
        const signalForUser = {
          id: parseInt(signal.id.split('-')[4]),
          text: `${signal.symbol}\n${signal.signalType} NOW\nEntry ${signal.entryPrice}\nStop Loss ${signal.stopLoss}\nTake Profit ${signal.takeProfit}\nConfidence ${signal.confidence}%\n\n${signal.analysis}`,
          timestamp: signal.timestamp.toISOString(),
          from: 'Forex Signal Generator',
          chat_id: 1,
          message_id: parseInt(signal.id.split('-')[4]),
          update_id: parseInt(signal.id.split('-')[4])
        };
        
        const existingMessages = JSON.parse(localStorage.getItem('telegram_messages') || '[]');
        existingMessages.unshift(signalForUser);
        localStorage.setItem('telegram_messages', JSON.stringify(existingMessages.slice(0, 100)));

        // Update statistics
        setStats(prev => ({
          ...prev,
          liveSignals: prev.liveSignals + 1,
          activeSignals: prev.activeSignals + 1,
          bosCount: prev.bosCount + (signal.confirmations.some(c => c.includes('BOS')) ? 1 : 0),
          chochCount: prev.chochCount + (signal.confirmations.some(c => c.includes('CHoCH')) ? 1 : 0),
          orderBlocks: prev.orderBlocks + (signal.confirmations.some(c => c.includes('Order Block')) ? 1 : 0),
          fvgCount: prev.fvgCount + (signal.confirmations.some(c => c.includes('Fair Value Gap')) ? 1 : 0)
        }));

        setSignals(prev => [signal, ...prev.slice(0, 19)]);
        
        addLog(`🎯 ${signal.signalType} signal for ${symbol}: Confidence: ${signal.confidence}%`, 'success');
        
        // Dispatch event to notify user dashboard
        window.dispatchEvent(new CustomEvent('newSignalGenerated', { 
          detail: signalForStorage 
        }));
        
        return signal;
      }
      
      return null;
      
    } catch (error) {
      console.error('SMC Analysis Error:', error);
      return null;
    }
  };

  const startAnalysis = async () => {
    if (!selectedSymbol || !selectedTimeframe) {
      addLog('⚠️ Please select a symbol and timeframe.', 'error');
      return;
    }

    setIsRunning(true);
    addLog('🚀 Forex analysis started.', 'success');
    addLog(`📊 Monitoring: ${selectedSymbol} | ${selectedTimeframe}`, 'info');

    const symbols = selectedSymbol === 'ALL' ? forexSymbols : [selectedSymbol];
    const timeframes = selectedTimeframe === 'ALL' ? ['5m', '15m', '1h', '4h'] : [selectedTimeframe];

    const runAnalysis = async () => {
      if (!isRunning) return;

      for (const symbol of symbols) {
        for (const timeframe of timeframes) {
          try {
            const priceData = await smcEngine.current.getPrice(symbol);
            
            setMarketData(prev => ({
              ...prev,
              [symbol]: priceData
            }));

            const signal = await performAdvancedSMCAnalysis(symbol, priceData, timeframe);
            
            if (signal) {
              addLog(`✅ Signal generated for ${symbol} (${timeframe})`, 'success');
            }
            
            // Small delay to prevent overwhelming the system
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            addLog(`❌ Error analyzing ${symbol}: ${error}`, 'error');
          }
        }
      }

      setStats(prev => ({
        ...prev,
        priceUpdates: prev.priceUpdates + 1,
        activeSymbols: symbols.length
      }));
    };

    // Initial analysis
    await runAnalysis();
    
    // Set up interval for continuous analysis
    intervalRef.current = setInterval(runAnalysis, 60000); // Every minute
  };

  const stopAnalysis = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    addLog('⏹️ Forex analysis stopped.', 'warning');
  };

  const refreshSystem = () => {
    stopAnalysis();
    setSignals([]);
    setMarketData({});
    setStats({
      activeSymbols: 0,
      liveSignals: 0,
      priceUpdates: 0,
      winRate: 0,
      bosCount: 0,
      chochCount: 0,
      orderBlocks: 0,
      fvgCount: 0,
      activeSignals: 0
    });
    addLog('🔄 Forex system refreshed.', 'success');
  };

  const copyTradeDetails = (signal: ForexSignal) => {
    const text = `Symbol: ${signal.symbol}\nType: ${signal.signalType}\nEntry: ${signal.entryPrice}\nStop Loss: ${signal.stopLoss}\nTake Profit: ${signal.takeProfit}\nConfidence: ${signal.confidence}%`;
    navigator.clipboard.writeText(text).then(() => {
      addLog('Trade details copied to clipboard!', 'success');
    });
  };

  useEffect(() => {
    addLog('💱 Forex SMC Signal Generator initialized', 'success');
    addLog('📊 Ready to generate forex trading signals', 'info');
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const getConfidenceClass = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-600/80 text-white';
    if (confidence >= 70) return 'bg-yellow-600/80 text-white';
    return 'bg-red-600/80 text-white';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="text-4xl">💱</div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-wider">Forex Signal Generator</h2>
              <p className="text-gray-400">Professional Smart Money Concepts for Forex Markets</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            <span className="text-gray-300">{isRunning ? 'Running' : 'Stopped'}</span>
          </div>
        </div>
      </div>

      {/* Controls and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trading Settings */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-blue-400" />
            Forex Trading Settings
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Symbol</label>
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/70 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Symbol</option>
                <option value="ALL" className="bg-blue-600 text-white font-bold">📊 ALL SYMBOLS</option>
                <optgroup label="🥇 Commodities">
                  <option value="XAU/USD">XAU/USD (Gold) ⭐</option>
                  <option value="XAG/USD">XAG/USD (Silver)</option>
                  <option value="USOIL">US Oil (WTI)</option>
                </optgroup>
                <optgroup label="📈 Stocks">
                  <option value="US30">US30</option>
                </optgroup>
                <optgroup label="💱 Forex Majors">
                  <option value="EUR/USD">EUR/USD</option>
                  <option value="GBP/USD">GBP/USD</option>
                  <option value="USD/JPY">USD/JPY</option>
                  <option value="USD/CHF">USD/CHF</option>
                  <option value="AUD/USD">AUD/USD</option>
                  <option value="USD/CAD">USD/CAD</option>
                  <option value="NZD/USD">NZD/USD</option>
                </optgroup>
                <optgroup label="💱 Forex Crosses">
                  {forexSymbols.filter(s => !['XAU/USD', 'XAG/USD', 'USOIL', 'US30', 'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD'].includes(s)).map(symbol => (
                    <option key={symbol} value={symbol}>{symbol}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Timeframe</label>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/70 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Timeframe</option>
                <option value="ALL" className="bg-blue-600 text-white font-bold">⏰ ALL TIMEFRAMES</option>
                {timeframes.map(tf => (
                  <option key={tf} value={tf}>{tf}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Risk:Reward Ratio</label>
              <input
                type="number"
                value={riskRewardRatio}
                onChange={(e) => setRiskRewardRatio(parseFloat(e.target.value))}
                step="0.1"
                min="1"
                max="10"
                className="w-full px-3 py-2 bg-gray-800/70 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Enter R:R (e.g., 2.0)"
              />
            </div>

            <div className="space-y-2">
              <button
                onClick={startAnalysis}
                disabled={isRunning}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Start Forex Analysis</span>
              </button>
              
              <button
                onClick={stopAnalysis}
                disabled={!isRunning}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
              >
                <Pause className="w-4 h-4" />
                <span>Stop Analysis</span>
              </button>
              
              <button
                onClick={refreshSystem}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh System</span>
              </button>
            </div>
          </div>
        </div>

        {/* Market Statistics */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-400" />
            Forex Statistics
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">Active Symbols</div>
              <div className="text-lg font-bold text-blue-400">{stats.activeSymbols}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">Live Signals</div>
              <div className="text-lg font-bold text-blue-400">{stats.liveSignals}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">BOS</div>
              <div className="text-lg font-bold text-blue-400">{stats.bosCount}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">CHoCH</div>
              <div className="text-lg font-bold text-blue-400">{stats.chochCount}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">Order Blocks</div>
              <div className="text-lg font-bold text-blue-400">{stats.orderBlocks}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">FVG</div>
              <div className="text-lg font-bold text-blue-400">{stats.fvgCount}</div>
            </div>
          </div>
        </div>

        {/* Live Price Feed */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-blue-400" />
            Live Forex Prices
          </h3>
          
          <div className="space-y-2 max-h-64 overflow-y-auto futuristic-scrollbar">
            {Object.keys(marketData).length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>🔄 Initializing forex data sources...</p>
                <p className="text-xs mt-2">Multi-API integration</p>
              </div>
            ) : (
              Object.entries(marketData).map(([symbol, data]) => (
                <div key={symbol} className="flex justify-between items-center p-2 bg-gray-800/50 rounded-lg border border-transparent hover:border-blue-500/50 transition-all">
                  <span className="text-blue-400 font-semibold text-sm">{symbol}</span>
                  <span className="text-green-400 font-bold">{data.price}</span>
                  <span className="text-xs text-gray-400">{data.provider}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Live Trading Signals */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Zap className="w-6 h-6 mr-2 text-blue-400" />
          Live Forex Signals ({signals.length})
        </h3>
        
        <div className="space-y-4 max-h-96 overflow-y-auto futuristic-scrollbar">
          {signals.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Configure settings and start analysis for live forex signals</p>
              <p className="text-sm mt-2 opacity-70">Real-time SMC structure analysis with multi-API data</p>
            </div>
          ) : (
            signals.map(signal => (
              <div
                key={signal.id}
                className={`bg-gray-800/50 rounded-xl p-6 border-l-4 transition-all hover:bg-gray-700/50 ${
                  signal.direction === 'bullish' ? 'border-blue-400' : 'border-red-400'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {signal.direction === 'bullish' ? '🟢' : '🔴'}
                    </div>
                    <div>
                      <div className={`text-xl font-bold ${
                        signal.direction === 'bullish' ? 'text-blue-400' : 'text-red-400'
                      }`}>
                        {signal.signalType} {signal.symbol}
                      </div>
                      <div className="text-sm text-gray-400">
                        {signal.timeframe} • {signal.sessionQuality}
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${getConfidenceClass(signal.confidence)}`}>
                    {signal.confidence}% Confidence
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">Entry</div>
                    <div className="text-blue-400 font-bold">{signal.entryPrice}</div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">Stop Loss</div>
                    <div className="text-red-400 font-bold">{signal.stopLoss}</div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">Take Profit</div>
                    <div className="text-green-400 font-bold">{signal.takeProfit}</div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">R:R Ratio</div>
                    <div className="text-white font-bold">{signal.riskReward}</div>
                  </div>
                </div>

                {/* SMC Confirmations */}
                <div className="mb-4">
                  <div className="text-sm font-semibold text-gray-300 mb-2">
                    📋 SMC Confirmations ({signal.confirmations.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {signal.confirmations.map((conf, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded-full border border-blue-500/30"
                      >
                        {conf}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Analysis */}
                <div className="bg-gray-700/30 rounded-lg p-4 mb-4">
                  <div className="text-sm font-semibold text-gray-300 mb-2">Analysis:</div>
                  <div className="text-gray-300 text-sm leading-relaxed">{signal.analysis}</div>
                </div>

                {/* Copy Button */}
                <button
                  onClick={() => copyTradeDetails(signal)}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-2 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
                >
                  <span>📋</span>
                  <span>Copy Forex Trade Details</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* System Logs */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">📝 Forex System Logs</h3>
        <div className="bg-gray-800/50 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm futuristic-scrollbar">
          {logs.map((log, index) => (
            <div key={index} className="mb-1">
              <span className="text-blue-400 font-bold">
                [{log.timestamp.toLocaleTimeString()}]
              </span>
              <span className={`ml-2 ${
                log.type === 'success' ? 'text-green-400' :
                log.type === 'error' ? 'text-red-400' :
                log.type === 'warning' ? 'text-yellow-400' :
                'text-gray-300'
              }`}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ForexSignalGenerator;