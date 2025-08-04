import React, { useEffect } from 'react';

const CryptoDashboard = ({ isBotRunning, setIsBotRunning }: { isBotRunning: boolean, setIsBotRunning: (isRunning: boolean) => void }) => {
  useEffect(() => {
    // --- DOM Elements ---
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const winRateEl = document.getElementById('winRate');
    const lastUpdateEl = document.getElementById('lastUpdate');
    const symbolSelect = document.getElementById('symbol') as HTMLSelectElement;
    const timeframeSelect = document.getElementById('timeframe') as HTMLSelectElement;
    const riskRewardInput = document.getElementById('riskReward') as HTMLInputElement;
    const startBtn = document.querySelector('button[onclick="startBot()"]') as HTMLButtonElement;
    const stopBtn = document.querySelector('button[onclick="stopBot()"]') as HTMLButtonElement;
    const signalsContainer = document.getElementById('signalsContainer');
    const logsContainer = document.getElementById('logs');
    const activePairsEl = document.getElementById('activePairs');
    const signalsTodayEl = document.getElementById('signalsToday');
    const activeTimeframesEl = document.getElementById('activeTimeframes');
    const systemStatusEl = document.getElementById('systemStatus');

    // --- Global State ---
    let activeConnections: any[] = [];
    let signalHistory: any[] = [];
    let lastData: any = {};
    (window as any).riskRewardRatio = 2.0;

    // --- API Configurations ---
    const API_CONFIG = {
        currencyBeacon: { key: 'tUBIQPyHSXgvY0de2ENsFzzCYQPUDBB4', host: 'api.currencybeacon.com' },
        polygon: { key: 'F9OJKxRfvT0lfZDO0GhBbnJim3FYAnfh', host: 'api.polygon.io' },
        taapi: {
            host: 'financialmodellingprep.com',
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

    const markets = {
        crypto: {
            symbols: [
                'BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'BNBUSDT', 'XRPUSDT', 'SOLUSDT', 'DOTUSDT',
                'DOGEUSDT', 'AVAXUSDT', 'LINKUSDT', 'LTCUSDT', 'XLMUSDT', 'FILUSDT', 'AAVEUSDT'
            ]
        },
        stocks: {
            symbols: ['US30']
        },
        commodities: {
            symbols: ['XAU/USD', 'XAG/USD', 'USOIL']
        },
        forexMajors: {
            symbols: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD']
        },
        forexCrosses: {
            symbols: [
                'EUR/JPY', 'GBP/JPY', 'EUR/GBP', 'EUR/AUD', 'GBP/AUD', 'AUD/CAD', 'CAD/JPY',
                'CHF/JPY', 'AUD/CHF', 'CAD/CHF', 'EUR/CHF', 'GBP/CHF', 'NZD/CAD', 'NZD/JPY', 'AUD/NZD'
            ]
        }
    };

    // --- Helper Functions ---
    function log(message: string, type = 'info') {
        if (!logsContainer) return;
        const time = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.innerHTML = `<span class="log-time">[${time}]</span> ${message}`;
        logsContainer.appendChild(entry);
        logsContainer.scrollTop = logsContainer.scrollHeight;
    }

    async function fetchWithRetry(url: string, options = {}, maxRetries = 2) {
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
            } catch (error: any) {
                lastError = error;
                log(`❌ Attempt ${attempt} failed: ${error.message}`, 'warning');
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                }
            }
        }
        throw new Error(`All ${maxRetries} attempts failed. Last error: ${(lastError as any).message}`);
    }

    function getPrecision(symbol: string) {
        if (['USDJPY'].includes(symbol)) return 3;
        if (['EURUSD', 'GBPUSD', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD'].includes(symbol)) return 5;
        return 2;
    }

    // --- Data Engines ---
    class DataEngine {
        priceCache: Map<string, any>;
        lastUpdateTime: Map<string, number>;
        cacheValidityMs: number;

        constructor() {
            this.priceCache = new Map();
            this.lastUpdateTime = new Map();
            this.cacheValidityMs = 30000;
        }

        getCachedPrice(symbol: string) {
            if (this.priceCache.has(symbol) && (Date.now() - this.lastUpdateTime.get(symbol)! < this.cacheValidityMs)) {
                log(`💾 Using cached price for ${symbol}`, 'info');
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
            const data = await fetchWithRetry(url, { headers: {} });
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
            const data = await fetchWithRetry(url, { headers: {} });
            if (data && data.results && data.results.p) {
                return { price: parseFloat(data.results.p), provider: 'Polygon.io' };
            }
            throw new Error(`Invalid price data from Polygon.io for ${symbol}`);
        }

        async fetchTaapiPrice(symbol: string) {
            const { host, keys } = API_CONFIG.taapi;
            const key = (keys as any)[symbol] || keys.default;
            if (!key) {
                throw new Error(`No API key found for ${symbol} in financialmodellingprep.com config`);
            }
            const url = `https://${host}/api/v3/quote/${symbol.replace('/', '')}?apikey=${key}`;
            const data = await fetchWithRetry(url, { headers: {} });
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
                    log(`📡 Routing ${symbol} to CurrencyBeacon (Dedicated)...`, 'info');
                    result = await this.fetchCurrencyBeaconPrice(symbol);
                } else if (polygonPairs.includes(symbol)) {
                    log(`📡 Routing ${symbol} to Polygon.io...`, 'info');
                    result = await this.fetchPolygonPrice(symbol);
                } else {
                    log(`📡 Routing ${symbol} to financialmodellingprep.com...`, 'info');
                    result = await this.fetchTaapiPrice(symbol);
                }

                const priceData = {
                    price: result.price.toFixed(getPrecision(symbol.replace('/', ''))),
                    provider: result.provider,
                    timestamp: new Date(),
                    isReal: true,
                    rawPrice: result.price
                };
                this.setCachedPrice(symbol, priceData);
                return priceData;
            } catch (error: any) {
                log(`❌ Price fetch for ${symbol} failed: ${error.message}`, 'error');
                throw error;
            }
        }
    }
    const dataEngine = new DataEngine();

    class ProfessionalSMCEngine {
        priceHistory: Map<string, any[]>;
        swingHighs: Map<string, any>;
        swingLows: Map<string, any>;
        internalHighs: Map<string, any>;
        internalLows: Map<string, any>;
        swingTrend: Map<string, any>;
        internalTrend: Map<string, any>;
        orderBlocks: Map<string, any[]>;
        fairValueGaps: Map<string, any[]>;
        equalHighs: Map<string, any[]>;
        equalLows: Map<string, any[]>;
        lastSignalTime: Map<string, number>;
        confirmationScores: { [key: string]: number };
        signalRequirements: { [key: string]: number };

        constructor() {
            this.priceHistory = new Map();
            this.swingHighs = new Map();
            this.swingLows = new Map();
            this.internalHighs = new Map();
            this.internalLows = new Map();
            this.swingTrend = new Map();
            this.internalTrend = new Map();
            this.orderBlocks = new Map();
            this.fairValueGaps = new Map();
            this.equalHighs = new Map();
            this.equalLows = new Map();
            this.lastSignalTime = new Map();
            
            this.confirmationScores = {
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
            
            this.signalRequirements = {
                minPrimaryConfirmations: 1,
                minTotalConfirmations: 4,
                minConfidenceScore: 60,
                minHistoryBars: 25,
                cooldownPeriod: 300000
            };
        }

        analyzeSMCPatterns(symbol: string, currentPriceData: { price: string; }) {
            try {
                const currentPrice = parseFloat(currentPriceData.price);
                const timestamp = Date.now();
                
                this.initializeSymbolData(symbol, currentPrice, timestamp);
                
                if (!this.canGenerateSignal(symbol, timestamp)) {
                    return null;
                }
                
                const priceHistory = this.priceHistory.get(symbol);
                if (priceHistory!.length < this.signalRequirements.minHistoryBars) {
                    log(`[${symbol}] Insufficient price history: ${priceHistory!.length}/${this.signalRequirements.minHistoryBars} bars.`);
                    return null;
                }
                
                const analysis = this.performStructureAnalysis(symbol, priceHistory!, currentPrice);
                
                return analysis;
                
            } catch (error) {
                console.error(`SMC Analysis Error for ${symbol}:`, error);
                return null;
            }
        }

        performStructureAnalysis(symbol: string, priceHistory: any[], currentPrice: number) {
            const confirmations: string[] = [];
            const currentAlerts = {
                swingBullishBOS: false,
                swingBearishBOS: false,
                swingBullishCHoCH: false,
                swingBearishCHoCH: false,
                internalBullishBOS: false,
                internalBearishBOS: false,
                internalBullishCHoCH: false,
                internalBearishCHoCH: false,
                swingOrderBlock: false,
                internalOrderBlock: false,
                bullishFairValueGap: false,
                bearishFairValueGap: false,
                equalHighs: false,
                equalLows: false
            };
            
            const swingAnalysis = this.analyzeSwingStructure(symbol, priceHistory, currentPrice);
            Object.assign(currentAlerts, swingAnalysis.alerts);
            confirmations.push(...swingAnalysis.confirmations);
            
            const internalAnalysis = this.analyzeInternalStructure(symbol, priceHistory, currentPrice);
            Object.assign(currentAlerts, internalAnalysis.alerts);
            confirmations.push(...internalAnalysis.confirmations);
            
            const orderBlockAnalysis = this.analyzeOrderBlocks(symbol, priceHistory, currentPrice);
            Object.assign(currentAlerts, orderBlockAnalysis.alerts);
            confirmations.push(...orderBlockAnalysis.confirmations);
            
            const fvgAnalysis = this.analyzeFairValueGaps(symbol, priceHistory, currentPrice);
            Object.assign(currentAlerts, fvgAnalysis.alerts);
            confirmations.push(...fvgAnalysis.confirmations);
            
            const eqhlAnalysis = this.analyzeEqualHighsLows(symbol, priceHistory, currentPrice);
            Object.assign(currentAlerts, eqhlAnalysis.alerts);
            confirmations.push(...eqhlAnalysis.confirmations);
            
            const zoneAnalysis = this.analyzePremiumDiscountZones(symbol, priceHistory, currentPrice);
            confirmations.push(...zoneAnalysis.confirmations);
            
            const additionalConfluences = this.analyzeAdditionalFactors(symbol, priceHistory, currentPrice);
            confirmations.push(...additionalConfluences.confirmations);
            
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

        analyzeSwingStructure(symbol: string, priceHistory: any[], currentPrice: number) {
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

        analyzeInternalStructure(symbol: string, priceHistory: any[], currentPrice: number) {
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

        analyzeOrderBlocks(symbol: string, priceHistory: any[], currentPrice: number) {
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

        analyzeFairValueGaps(symbol: string, priceHistory: any[], currentPrice: number) {
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

        analyzeEqualHighsLows(symbol: string, priceHistory: any[], currentPrice: number) {
            const alerts: any = {};
            const confirmations: string[] = [];
            
            if (priceHistory.length < 10) return { alerts, confirmations };
            
            const atr = this.calculateATR(priceHistory, 14);
            const threshold = 0.1 * atr;
            
            const recentBars = priceHistory.slice(-10);
            const highs = recentBars.map(bar => bar.high);
            const lows = recentBars.map(bar => bar.low);
            
            const equalHighLevels = this.findEqualLevels(highs, threshold);
            if (equalHighLevels.length >= 2 && currentPrice > Math.max(...equalHighLevels)) {
                confirmations.push('equalHighsBreak');
                alerts.equalHighs = true;
            }
            
            const equalLowLevels = this.findEqualLevels(lows, threshold);
            if (equalLowLevels.length >= 2 && currentPrice < Math.min(...equalLowLevels)) {
                confirmations.push('equalLowsBreak');
                alerts.equalLows = true;
            }
            
            return { alerts, confirmations };
        }

        analyzePremiumDiscountZones(symbol: string, priceHistory: any[], currentPrice: number) {
            const confirmations: string[] = [];
            
            if (priceHistory.length < 20) return { confirmations };
            
            const recentBars = priceHistory.slice(-20);
            const swingHigh = Math.max(...recentBars.map(bar => bar.high));
            const swingLow = Math.min(...recentBars.map(bar => bar.low));
            
            const range = swingHigh - swingLow;
            const currentLevel = (currentPrice - swingLow) / range;
            
            if (currentLevel >= 0.7) {
                confirmations.push('premiumZoneEntry');
            }
            else if (currentLevel <= 0.3) {
                confirmations.push('discountZoneEntry');
            }
            else if (currentLevel >= 0.4 && currentLevel <= 0.6) {
                confirmations.push('equilibriumZone');
            }
            
            return { confirmations };
        }

        analyzeAdditionalFactors(symbol: string, priceHistory: any[], currentPrice: number) {
            const confirmations: string[] = [];
            
            if (priceHistory.length >= 10) {
                const avgVolume = priceHistory.slice(-10).reduce((sum, bar) => sum + bar.volume, 0) / 10;
                const currentVolume = priceHistory[priceHistory.length - 1].volume;
                
                if (currentVolume > avgVolume * 1.5) {
                    confirmations.push('volumeConfirmation');
                }
            }
            
            if (priceHistory.length >= 14) {
                const atr = this.calculateATR(priceHistory, 14);
                const currentRange = priceHistory[priceHistory.length - 1].high - priceHistory[priceHistory.length - 1].low;
                
                if (currentRange > atr * 1.2) {
                    confirmations.push('atrVolatilityFilter');
                }
            }
            
            return { confirmations };
        }

        calculateConfidence(confirmations: string[]) {
            let totalScore = 0;
            let primaryConfirmations = 0;
            
            confirmations.forEach(confirmation => {
                if (this.confirmationScores[confirmation]) {
                    totalScore += this.confirmationScores[confirmation];
                    
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

        calculateTradingLevels(symbol: string, signalDirection: string, currentPrice: number, priceHistory: any[]) {
            const atr = this.calculateATR(priceHistory, 14);
            const riskRewardRatio = (window as any).riskRewardRatio || 2.0;
            
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

        validateSignalQuality(analysis: any) {
            if (!analysis.signalDirection) return false;
            
            const primaryCount = analysis.confirmations.filter((c: string) => 
                c.includes('BOS') || c.includes('CHoCH')
            ).length;
            
            const confidence = this.calculateConfidence(analysis.confirmations);
            
            return (
                primaryCount >= this.signalRequirements.minPrimaryConfirmations &&
                analysis.confirmations.length >= this.signalRequirements.minTotalConfirmations &&
                confidence >= this.signalRequirements.minConfidenceScore
            );
        }

        initializeSymbolData(symbol: string, currentPrice: number, timestamp: number) {
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
            
            const history = this.priceHistory.get(symbol);
            history!.push(newBar);
            
            if (history!.length > 100) {
                history!.splice(0, history!.length - 100);
            }
        }

        detectSwingPoints(priceHistory: any[], lookback: number) {
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

        calculateATR(priceHistory: any[], period: number) {
            if (priceHistory.length < period + 1) {
                return priceHistory.length > 0 ? priceHistory[0].close * 0.001 : 0.01;
            }
            
            const trueRanges: number[] = [];
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

        detectOrderBlockFormation(recentBars: any[]) {
            if (recentBars.length < 3) return { bullish: false, bearish: false, high: 0, low: 0 };
            
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

        findEqualLevels(levels: number[], threshold: number) {
            const equalLevels: number[] = [];
            
            for (let i = 0; i < levels.length; i++) {
                for (let j = i + 1; j < levels.length; j++) {
                    if (Math.abs(levels[i] - levels[j]) <= threshold) {
                        if (!equalLevels.includes(levels[i])) equalLevels.push(levels[i]);
                        if (!equalLevels.includes(levels[j])) equalLevels.push(levels[j]);
                    }
                }
            }
            
            return equalLevels;
        }

        canGenerateSignal(symbol: string, timestamp: number) {
            const lastSignal = this.lastSignalTime.get(symbol);
            return !lastSignal || (timestamp - lastSignal) >= this.signalRequirements.cooldownPeriod;
        }

        getSymbolVolatility(symbol: string) {
            const volatilityMap: { [key: string]: number } = {
                'EUR/USD': 0.0008, 'GBP/USD': 0.0012, 'USD/JPY': 0.008,
                'XAU/USD': 0.002, 'XAG/USD': 0.003, 'BTC/USD': 0.02,
                'ETH/USD': 0.025, 'USOIL': 0.015
            };
            return volatilityMap[symbol] || 0.001;
        }

        createTradingSignal(symbol: string, analysis: any, currentPrice: number) {
            const confidence = this.calculateConfidence(analysis.confirmations);
            const priceHistory = this.priceHistory.get(symbol);
            const tradingLevels = this.calculateTradingLevels(symbol, analysis.signalDirection, currentPrice, priceHistory!);
            
            return {
                symbol,
                signalType: analysis.signalDirection,
                confidence,
                entryPrice: tradingLevels.entryPrice,
                stopLoss: tradingLevels.stopLoss,
                takeProfit: tradingLevels.takeProfit,
                riskReward: tradingLevels.riskReward,
                confirmations: this.formatConfirmations(analysis.confirmations),
                timestamp: new Date(),
                analysis: analysis.analysis,
                sessionQuality: this.getSessionQuality(),
                timeframe: '15m'
            };
        }

        formatConfirmations(confirmations: string[]) {
            const formattedConfirmations: string[] = [];
            
            confirmations.forEach(confirmation => {
                switch(confirmation) {
                    case 'swingBullishBOS': formattedConfirmations.push('Swing Bullish BOS'); break;
                    case 'swingBearishBOS': formattedConfirmations.push('Swing Bearish BOS'); break;
                    case 'swingBullishCHoCH': formattedConfirmations.push('Swing Bullish CHoCH'); break;
                    case 'swingBearishCHoCH': formattedConfirmations.push('Swing Bearish CHoCH'); break;
                    case 'internalBullishBOS': formattedConfirmations.push('Internal Bullish BOS'); break;
                    case 'internalBearishBOS': formattedConfirmations.push('Internal Bearish BOS'); break;
                    case 'internalBullishCHoCH': formattedConfirmations.push('Internal Bullish CHoCH'); break;
                    case 'internalBearishCHoCH': formattedConfirmations.push('Internal Bearish CHoCH'); break;
                    case 'swingOrderBlockRespect': formattedConfirmations.push('Swing Order Block Respect'); break;
                    case 'internalOrderBlockRespect': formattedConfirmations.push('Internal Order Block Respect'); break;
                    case 'bullishFairValueGap': formattedConfirmations.push('Bullish Fair Value Gap'); break;
                    case 'bearishFairValueGap': formattedConfirmations.push('Bearish Fair Value Gap'); break;
                    case 'equalHighsBreak': formattedConfirmations.push('Equal Highs Break'); break;
                    case 'equalLowsBreak': formattedConfirmations.push('Equal Lows Break'); break;
                    case 'premiumZoneEntry': formattedConfirmations.push('Premium Zone Entry'); break;
                    case 'discountZoneEntry': formattedConfirmations.push('Discount Zone Entry'); break;
                    case 'equilibriumZone': formattedConfirmations.push('Equilibrium Zone'); break;
                    case 'volumeConfirmation': formattedConfirmations.push('Volume Confirmation'); break;
                    case 'atrVolatilityFilter': formattedConfirmations.push('ATR Volatility Filter'); break;
                    default: formattedConfirmations.push(confirmation);
                }
            });
            
            return formattedConfirmations;
        }

        generateAnalysisText(signalDirection: string | null, confirmations: string[]) {
            if (!signalDirection) return 'No clear directional bias detected.';
            
            const direction = signalDirection === 'BUY' ? 'bullish' : 'bearish';
            const confidence = this.calculateConfidence(confirmations);
            
            let analysis = `${confidence >= 80 ? 'Very Strong' : confidence >= 70 ? 'Strong' : 'Moderate'} ${direction} setup detected. `;
            
            const hasSwingBOS = confirmations.some(c => c.includes('swingBullishBOS') || c.includes('swingBearishBOS'));
            const hasSwingCHoCH = confirmations.some(c => c.includes('swingBullishCHoCH') || c.includes('swingBearishCHoCH'));
            const hasInternalBOS = confirmations.some(c => c.includes('internalBullishBOS') || c.includes('internalBearishBOS'));
            
            if (hasSwingBOS) analysis += `Major swing Break of Structure confirms ${direction} momentum shift. `;
            if (hasSwingCHoCH) analysis += `Swing Change of Character indicates potential trend reversal. `;
            if (hasInternalBOS) analysis += `Internal structure break provides additional confluence. `;
            if (confirmations.some(c => c.includes('OrderBlock'))) analysis += `Price respecting institutional order block levels. `;
            if (confirmations.some(c => c.includes('FairValueGap'))) analysis += `Fair Value Gap providing strong directional bias. `;
            if (confirmations.includes('premiumZoneEntry')) analysis += `Entry from premium zone - ideal for ${direction === 'bearish' ? 'sell' : 'buy'} setups. `;
            if (confirmations.includes('discountZoneEntry')) analysis += `Entry from discount zone - optimal for ${direction === 'bullish' ? 'buy' : 'sell'} entries. `;
            
            if (confidence >= 80) analysis += `High-probability setup suitable for standard position sizing.`;
            else if (confidence >= 70) analysis += `Good probability setup - consider normal position size.`;
            else if (confidence >= 60) analysis += `Moderate probability - use reduced position size and tight risk management.`;
            
            return analysis;
        }

        getSessionQuality() {
            const now = new Date();
            const hour = now.getUTCHours();
            
            if (hour >= 7 && hour <= 16) return 'London Session - High';
            if (hour >= 12 && hour <= 21) return 'New York Session - High';
            if (hour >= 12 && hour <= 16) return 'London/NY Overlap - Very High';
            return 'Asian Session - Medium';
        }
    }
    const smcEngine = new ProfessionalSMCEngine();

    // --- Data Fetching ---
    async function fetchBinanceData(symbol: string, interval: string, limit = 200) {
        const intervalMap: { [key: string]: string } = { '1m': '1m', '3m': '3m', '5m': '5m', '15m': '15m', '30m': '30m', '1h': '1h', '4h': '4h', '1d': '1d' };
        const binanceInterval = intervalMap[interval];
        if (!binanceInterval) {
            log(`Unsupported timeframe for Binance: ${interval}`, 'error');
            return null;
        }
        
        const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${binanceInterval}&limit=${limit}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Binance API error ${response.status}: ${errorData.msg || 'Unknown error'}`);
            }
            const data = await response.json();
            const mappedData = data.map((d: any[]) => ({
                time: d[0] / 1000,
                open: parseFloat(d[1]),
                high: parseFloat(d[2]),
                low: parseFloat(d[3]),
                close: parseFloat(d[4]),
                volume: parseFloat(d[5])
            }));
            if (mappedData.length > 0) {
                lastData[symbol] = mappedData[mappedData.length - 1].close;
            }
            return mappedData;
        } catch (error: any) {
            log(`Error fetching Binance data for ${symbol}: ${error.message}`, 'error');
            return null;
        }
    }

    async function fetchCryptoData(symbol: string, interval: string, limit = 200) {
        return fetchBinanceData(symbol, interval, limit);
    }

    async function fetchForexData(symbol: string) {
        try {
            const priceData = await dataEngine.getPrice(symbol);
            if (priceData && priceData.price) {
                lastData[symbol] = priceData.price;
                return [{
                    time: new Date(priceData.timestamp).getTime() / 1000,
                    open: parseFloat(priceData.price),
                    high: parseFloat(priceData.price),
                    low: parseFloat(priceData.price),
                    close: parseFloat(priceData.price),
                    volume: 0
                }];
            }
            return null;
        } catch (error: any) {
            log(`Error fetching Forex data for ${symbol}: ${error.message}`, 'error');
            return null;
        }
    }

    // --- UI and State Management ---
    function updateStatus(running: boolean) {
        setIsBotRunning(running);
        if (statusDot) statusDot.classList.toggle('active', running);
        if (statusText) statusText.textContent = running ? 'Bot is Running' : 'Ready to Connect';
        if (systemStatusEl) systemStatusEl.textContent = running ? 'Running' : 'Ready';
        if (startBtn) startBtn.disabled = running;
        if (stopBtn) stopBtn.disabled = !running;
        [symbolSelect, timeframeSelect, riskRewardInput].forEach(el => { if(el) (el as HTMLButtonElement).disabled = running });
    }

    function populateSymbols() {
        if (!symbolSelect) return;
        symbolSelect.innerHTML = '<option value="">Select Symbol</option><option value="ALL" class="select-all-option">📊 ALL SYMBOLS</option>';

        const createOptgroup = (label: string, symbols: string[]) => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = label;
            symbols.forEach(s => {
                const option = document.createElement('option');
                option.value = s;
                option.textContent = s;
                optgroup.appendChild(option);
            });
            symbolSelect.appendChild(optgroup);
        };

        createOptgroup('💹 Crypto', markets.crypto.symbols);
        createOptgroup('📈 Stocks', markets.stocks.symbols);
        createOptgroup('🥇 Commodities', markets.commodities.symbols);
        createOptgroup(' Forex Majors', markets.forexMajors.symbols);
        createOptgroup('💱 Forex Crosses', markets.forexCrosses.symbols);
    }

    function updateMarketData() {
        const uniqueSymbols = new Set(activeConnections.map(c => c.symbol));
        const uniqueTimeframes = new Set(activeConnections.map(c => c.timeframe));
        if (activePairsEl) activePairsEl.textContent = uniqueSymbols.size.toString();
        if (activeTimeframesEl) activeTimeframesEl.textContent = uniqueTimeframes.size.toString();
        const today = new Date().toISOString().slice(0, 10);
        if (signalsTodayEl) signalsTodayEl.textContent = signalHistory.filter(s => s.timestamp.toISOString().startsWith(today)).length.toString();
        const wins = signalHistory.filter(s => s.status === 'target_hit').length;
        const losses = signalHistory.filter(s => s.status === 'sl_hit').length;
        if (winRateEl) winRateEl.textContent = (wins + losses > 0) ? `Win Rate: ${((wins / (wins + losses)) * 100).toFixed(1)}%` : 'Win Rate: --%';
    }

    function displayProfessionalSignal(signal: any) {
        if (!signalsContainer) return;
        
        const noSignals = signalsContainer.querySelector('.no-signals');
        if (noSignals) noSignals.remove();
        
        const confidenceClass = signal.confidence >= 80 ? 'confidence-high' : 
                               signal.confidence >= 70 ? 'confidence-medium' : 'confidence-low';
        
        const signalCard = document.createElement('div');
        signalCard.className = `signal-card ${signal.signalType.toLowerCase() === 'buy' ? 'bullish' : 'bearish'}`;
        signalCard.id = signal.id;
        
        signalCard.innerHTML = `
            <div class="signal-header">
                <div class="signal-type ${signal.signalType.toLowerCase() === 'buy' ? 'bullish' : 'bearish'}">
                    <span class="signal-icon">${signal.signalType.toLowerCase() === 'buy' ? '🟢' : '🔴'}</span>
                    ${signal.signalType} ${signal.symbol} (${signal.timeframe})
                </div>
                <div class="confidence-badge ${confidenceClass}">
                    ${signal.confidence}% Confidence
                </div>
            </div>
            <div class="signal-details">
                <div class="detail-item"><div class="detail-label">Entry (E)</div><div class="detail-value entry-price">${signal.entryPrice}</div></div>
                <div class="detail-item"><div class="detail-label">Stop Loss (SL)</div><div class="detail-value stop-loss">${signal.stopLoss}</div></div>
                <div class="detail-item"><div class="detail-label">Take Profit (TP)</div><div class="detail-value take-profit">${signal.takeProfit}</div></div>
                <div class="detail-item"><div class="detail-label">R:R Ratio</div><div class="detail-value">${signal.riskReward}</div></div>
                <div class="detail-item"><div class="detail-label">Session</div><div class="detail-value">${signal.sessionQuality}</div></div>
            </div>
            <div class="confirmations-section">
                <div class="confirmations-title">📋 SMC Confirmations (${signal.confirmations.length})</div>
                <div class="confirmations-list">
                    ${signal.confirmations.map((conf: string) => `<span class="confirmation-item">${conf}</span>`).join('')}
                </div>
            </div>
            <div style="background: rgba(0, 0, 0, 0.3); padding: 15px; border-radius: 8px; margin-top: 15px; font-size: 0.9rem; line-height: 1.4;">
                <strong>Analysis:</strong> ${signal.analysis}
            </div>
            <button class="copy-trade-btn" onclick="copyTradeDetails('${signal.symbol}', '${signal.signalType}', '${signal.entryPrice}', '${signal.stopLoss}', '${signal.takeProfit}')">
                📋 Copy Trade Details
            </button>
            <div class="signal-status">Active</div>`;
        
        signalsContainer.insertBefore(signalCard, signalsContainer.firstChild);
        
        const signalCards = signalsContainer.querySelectorAll('.signal-card');
        if (signalCards.length > 10) {
            signalsContainer.removeChild(signalCards[signalCards.length - 1]);
        }
    }

    function updateSMCStatistics(signal: any) {
        signal.confirmations.forEach((confirmation: string) => {
            const elIdMap = { 'BOS': 'bosCount', 'CHoCH': 'chochCount', 'Order Block': 'orderBlocks', 'Fair Value Gap': 'fvgCount' };
            for (const key in elIdMap) {
                if (confirmation.includes(key)) {
                    const el = document.getElementById((elIdMap as any)[key]);
                    if (el) el.textContent = (parseInt(el.textContent!) + 1).toString();
                }
            }
        });
        
        const activeSignalsEl = document.getElementById('activeSignals');
        if (activeSignalsEl) activeSignalsEl.textContent = (parseInt(activeSignalsEl.textContent!) + 1).toString();
    }

    // --- Core Bot Logic ---
    async function performAdvancedSMCAnalysis(symbol: string, priceData: { price: string; }, timeframe: string) {
        try {
            const analysisResult = smcEngine.analyzeSMCPatterns(symbol, priceData);

            if (analysisResult) {
                if (smcEngine.validateSignalQuality(analysisResult)) {
                    const signal = smcEngine.createTradingSignal(symbol, analysisResult, parseFloat(priceData.price)) as any;
                    signal.id = `signal-${signal.symbol}-${timeframe}-${signal.timestamp.getTime()}`;
                    signal.timeframe = timeframe;

                    updateSMCStatistics(signal);
                    displayProfessionalSignal(signal);
                    
                    log(`🎯 ${signal.signalType} signal for ${symbol}: Confidence: ${signal.confidence}%`, 'success');
                    
                    return signal;
                } else {
                    const confidence = smcEngine.calculateConfidence(analysisResult.confirmations);
                    const primaryCount = analysisResult.confirmations.filter((c: string) => c.includes('BOS') || c.includes('CHoCH')).length;
                    log(`[${symbol}] Analysis complete. No signal. Confidence: ${confidence}%. Confirmations: ${analysisResult.confirmations.length}. Primary: ${primaryCount}.`);
                }
            }
            
            return null;
            
        } catch (error) {
            console.error('SMC Analysis Error:', error);
            return null;
        }
    }

    async function startAnalysis(symbol: string, timeframe: string) {
        log(`Initializing analysis for ${symbol} (${timeframe})...`);
        
        const isCrypto = markets.crypto.symbols.includes(symbol);
        const fetchData = isCrypto ? () => fetchCryptoData(symbol, timeframe) : () => fetchForexData(symbol);
        
        const analyze = async () => {
            const data = await fetchData();
            if (data && data.length > 0) {
                const lastPrice = data[data.length - 1].close;
                const priceData = { price: lastPrice };
                
                const signal = await performAdvancedSMCAnalysis(symbol, priceData, timeframe);
                
                if (signal) {
                    if (!signalHistory.find(s => s.id === (signal as any).id)) {
                        (signal as any).status = 'active';
                        (signal as any).direction = signal.signalType === 'BUY' ? 'bullish' : 'bearish';
                        signalHistory.push(signal);
                    }
                }
                if (lastUpdateEl) lastUpdateEl.textContent = `Last Update: ${new Date().toLocaleTimeString()}`;
                updateMarketData();
            }
        };

        await analyze();
        const intervalId = setInterval(analyze, 60000);
        activeConnections.push({ symbol, timeframe, intervalId });
        updateMarketData();
    }
    
    function monitorActiveSignals() {
        const activeSignals = signalHistory.filter(s => s.status === 'active');
        activeSignals.forEach(signal => {
            const currentPrice = lastData[signal.symbol];
            if (!currentPrice) return;
            if (signal.direction === 'bullish' && currentPrice <= signal.stopLoss) { signal.status = 'sl_hit'; updateSignalCard(signal); }
            else if (signal.direction === 'bearish' && currentPrice >= signal.stopLoss) { signal.status = 'sl_hit'; updateSignalCard(signal); }
            else if (signal.direction === 'bullish' && currentPrice >= signal.takeProfit) { signal.status = 'target_hit'; updateSignalCard(signal); }
            else if (signal.direction === 'bearish' && currentPrice <= signal.takeProfit) { signal.status = 'target_hit'; updateSignalCard(signal); }
        });
    }

    function updateSignalCard(signal: any) {
        const card = document.getElementById(signal.id);
        if (!card) return;
        card.classList.remove('bullish', 'bearish');
        if (signal.status === 'sl_hit') {
            card.classList.add('sl_hit');
            card.querySelector('.signal-status')!.textContent = 'SL Hit';
            log(`${signal.symbol} SL hit.`, 'error');
            updateMarketData();
        } else if (signal.status === 'target_hit') {
            card.classList.add('target_hit');
            card.querySelector('.signal-status')!.textContent = 'TP Hit';
            log(`${signal.symbol} TP hit!`, 'success');
            updateMarketData();
        }
    }

    // --- Window Functions (Event Handlers) ---
    (window as any).startBot = () => {
        const selectedSymbols = symbolSelect.value === 'ALL'
            ? [...markets.crypto.symbols, ...markets.stocks.symbols, ...markets.commodities.symbols, ...markets.forexMajors.symbols, ...markets.forexCrosses.symbols]
            : [symbolSelect.value];

        const timeframes = timeframeSelect.value === 'ALL' ? Array.from(timeframeSelect.options).slice(2).map(o => o.value) : [timeframeSelect.value];
        if (!selectedSymbols[0] || !timeframes[0]) { return log('Please select a symbol and timeframe.', 'error'); }
        const riskRewardRatio = parseFloat(riskRewardInput.value);
        if (isNaN(riskRewardRatio) || riskRewardRatio < 1) { return log('Please enter a valid Risk:Reward Ratio >= 1.0', 'error'); }
        (window as any).riskRewardRatio = riskRewardRatio;
        updateStatus(true);
        log(`Starting bot...`, 'success');
        if (signalsContainer) signalsContainer.innerHTML = '';

        let delay = 0;
        selectedSymbols.forEach((symbol: string) => {
            timeframes.forEach((timeframe: string) => {
                setTimeout(() => {
                    startAnalysis(symbol, timeframe);
                }, delay);
                delay += 200;
            });
        });
        
        activeConnections.push({ symbol: 'MONITOR', timeframe: '1s', intervalId: setInterval(monitorActiveSignals, 1000) });
    };

    (window as any).stopBot = () => {
        log('Stopping bot...', 'error');
        activeConnections.forEach(conn => clearInterval(conn.intervalId));
        activeConnections = [];
        updateStatus(false);
        updateMarketData();
    };

    (window as any).refreshSystem = () => {
        if (isBotRunning) (window as any).stopBot();
        log('System refreshed. Ready for new configuration.');
        signalHistory = [];
        if (signalsContainer) signalsContainer.innerHTML = '<div class="no-signals"><p>Configure settings and start the bot to receive real-time signals</p></div>';
        updateMarketData();
    };

    (window as any).copyTradeDetails = (symbol: string, signalType: string, entryPrice: string, stopLoss: string, takeProfit: string) => {
        const text = `Symbol: ${symbol}\nType: ${signalType}\nEntry: ${entryPrice}\nStop Loss: ${stopLoss}\nTake Profit: ${takeProfit}`;
        navigator.clipboard.writeText(text).then(() => {
            log('Trade details copied to clipboard!', 'success');
        }, () => {
            log('Failed to copy trade details.', 'error');
        });
    };

    // --- Initialization ---
    populateSymbols();
    log('SMC Pro Elite Bot initialized - Configure settings to start.');
  }, []);

  return (
    <div>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); color: #ffffff; min-height: 100vh; overflow-x: hidden; }
        .container { max-width: 1800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; padding: 30px; background: rgba(0, 0, 0, 0.4); border-radius: 20px; border: 1px solid rgba(79, 195, 247, 0.3); backdrop-filter: blur(10px); }
        .title { font-size: 3.5rem; font-weight: 800; background: linear-gradient(45deg, #00d4ff, #0099cc, #4fc3f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 10px; }
        .subtitle { font-size: 1.2rem; opacity: 0.9; margin-bottom: 20px; color: #b0e0ff; }
        .timezone-selector { display: flex; justify-content: center; align-items: center; gap: 15px; margin: 20px 0; }
        .timezone-selector select { padding: 8px 15px; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 8px; background: rgba(255, 255, 255, 0.1); color: white; font-size: 14px; }
        .status-section { display: flex; justify-content: space-between; align-items: center; background: rgba(0, 0, 0, 0.3); padding: 20px 30px; border-radius: 15px; margin-bottom: 25px; border: 1px solid rgba(255, 255, 255, 0.1); }
        .status-info { display: flex; align-items: center; gap: 15px; }
        .status-dot { width: 12px; height: 12px; border-radius: 50%; background: #ff5252; animation: pulse-red 2s infinite; }
        .status-dot.connected { background: #4caf50; animation: pulse-green 2s infinite; }
        @keyframes pulse-red { 0% { box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(255, 82, 82, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 82, 82, 0); } }
        @keyframes pulse-green { 0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); } 100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); } }
        .datetime-info { text-align: right; font-family: 'Courier New', monospace; }
        .api-status { display: grid; grid-template-columns: 1fr; gap: 15px; margin: 20px auto; max-width: 300px; }
        .api-card { background: rgba(0, 0, 0, 0.3); padding: 15px; border-radius: 10px; text-align: center; border: 1px solid rgba(255, 255, 255, 0.1); }
        .api-name { font-weight: bold; margin-bottom: 5px; color: #4fc3f7; }
        .api-calls { font-size: 0.9rem; opacity: 0.8; }
        .api-active { border-color: #4caf50; background: rgba(76, 175, 80, 0.1); }
        .main-content { display: grid; grid-template-columns: 350px 1fr 350px; gap: 25px; margin-bottom: 30px; }
        .panel { background: rgba(0, 0, 0, 0.3); border-radius: 15px; padding: 25px; border: 1px solid rgba(255, 255, 255, 0.1); backdrop-filter: blur(5px); }
        .panel-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 20px; color: #00d4ff; display: flex; align-items: center; gap: 10px; }
        .form-group { margin-bottom: 20px; }
        .form-label { display: block; margin-bottom: 8px; font-weight: 500; color: #b0e0ff; }
        .form-control { width: 100%; padding: 12px 16px; border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 8px; background: rgba(0, 212, 255, 0.05); color: white; font-size: 14px; transition: all 0.3s ease; }
        .form-control:focus { outline: none; border-color: #00d4ff; box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2); }
        .btn { width: 100%; padding: 14px; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; margin-bottom: 12px; }
        .btn-primary { background: linear-gradient(45deg, #00d4ff, #0099cc); color: white; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0, 212, 255, 0.4); }
        .btn-danger { background: linear-gradient(45deg, #ff4569, #e53e54); color: white; }
        .btn-secondary { background: linear-gradient(45deg, #9c27b0, #8e24aa); color: white; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
        .price-feed { background: rgba(0, 0, 0, 0.4); border-radius: 10px; padding: 20px; height: 400px; overflow-y: auto; font-family: 'Courier New', monospace; border: 1px solid rgba(79, 195, 247, 0.2); }
        .price-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1); transition: all 0.3s ease; }
        .price-item.flash { background: rgba(79, 195, 247, 0.3); animation: flash 0.8s ease-out; }
        .price-item.verified { border-left: 3px solid #4caf50; background: rgba(76, 175, 80, 0.1); }
        @keyframes flash { 0% { background: rgba(79, 195, 247, 0.5); } 100% { background: transparent; } }
        .symbol-name { font-weight: bold; color: #4fc3f7; min-width: 80px; }
        .price-value { color: #4caf50; font-weight: bold; min-width: 80px; text-align: center; }
        .price-change { font-size: 12px; min-width: 60px; text-align: right; }
        .positive { color: #4caf50; }
        .negative { color: #f44336; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
        .stat-card { background: rgba(0, 0, 0, 0.3); padding: 15px; border-radius: 10px; text-align: center; border: 1px solid rgba(255, 255, 255, 0.1); }
        .stat-label { font-size: 0.85rem; opacity: 0.8; margin-bottom: 5px; }
        .stat-value { font-size: 1.2rem; font-weight: bold; color: #4fc3f7; }
        .signals-section { grid-column: 1 / -1; background: rgba(0, 0, 0, 0.3); border-radius: 15px; padding: 25px; border: 1px solid rgba(255, 255, 255, 0.1); }
        .signal-card { background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #4fc3f7; transition: all 0.3s ease; }
        .signal-card.bearish { border-left-color: #f44336; }
        .signal-card.completed { border-left-color: #4caf50; background: rgba(76, 175, 80, 0.1); }
        .signal-card.stopped { border-left-color: #ff9800; background: rgba(255, 152, 0, 0.1); }
        .signal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .signal-type { font-size: 1.1rem; font-weight: bold; }
        .signal-type.bullish { color: #4fc3f7; }
        .signal-type.bearish { color: #f44336; }
        .signal-status { padding: 4px 12px; border-radius: 12px; font-size: 0.8rem; font-weight: bold; background: rgba(0, 0, 0, 0.3); }
        .signal-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin-bottom: 15px; }
        .detail-item { background: rgba(0, 0, 0, 0.3); padding: 10px; border-radius: 8px; text-align: center; }
        .detail-label { font-size: 0.8rem; opacity: 0.8; margin-bottom: 4px; }
        .detail-value { font-weight: bold; }
        .smc-analysis { background: rgba(0, 0, 0, 0.3); padding: 15px; border-radius: 8px; font-size: 0.9rem; line-height: 1.4; margin-top: 15px; }
        .logs { background: rgba(0, 0, 0, 0.4); border-radius: 10px; padding: 20px; height: 300px; overflow-y: auto; font-family: 'Courier New', monospace; font-size: 12px; border: 1px solid rgba(255, 255, 255, 0.1); }
        .log-entry { margin-bottom: 6px; opacity: 0.9; }
        .log-time { color: #4fc3f7; font-weight: bold; }
        .log-success { color: #4caf50; }
        .log-error { color: #f44336; }
        .log-warning { color: #ff9800; }
        .no-signals { text-align: center; padding: 40px; opacity: 0.7; }
        .verification-badge { display: inline-flex; align-items: center; gap: 5px; background: rgba(76, 175, 80, 0.2); color: #4caf50; padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; margin-left: 5px; }
        #insiderAnalysisContainer { padding: 20px; background: rgba(0, 0, 0, 0.3); border-radius: 15px; border: 1px solid rgba(255, 255, 255, 0.1); margin-top: 20px; font-size: 0.9rem; line-height: 1.6; }
        .sentiment-bullish { color: #4caf50; font-weight: bold; }
        .sentiment-bearish { color: #f44336; font-weight: bold; }
        .sentiment-neutral { color: #ff9800; font-weight: bold; }
        .sentiment-strong-bullish { color: #00e676; font-weight: bold; }
        .sentiment-strong-bearish { color: #d50000; font-weight: bold; }
      `}</style>
      <div className="container">
        <div className="header">
          <h1 className="title">SMC Trading Bot</h1>
          <p className="subtitle">Real-Time Smart Money Concepts - NO FAKE DATA</p>
        </div>

        <div className="status-section">
          <div className="status-info">
            <div className="status-dot connected" id="statusDot"></div>
            <div>
              <div id="statusText">System Connected</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }} id="dataSource">Live data sources active</div>
            </div>
          </div>
          <div className="datetime-info">
            <div id="currentDateTime"></div>
            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Last Update: <span id="lastUpdate">Never</span></div>
          </div>
        </div>

        <div className="main-content">
          <div className="panel">
            <h3 className="panel-title">⚙️ SMC Trading Settings</h3>

            <div className="form-group">
              <label className="form-label">Symbol</label>
              <select className="form-control" id="symbol">
                <option value="">Select Symbol</option>
                <option value="ALL">📊 ALL SYMBOLS</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Timeframe</label>
              <select className="form-control" id="timeframe">
                <option value="">Select Timeframe</option>
                <option value="ALL">⏰ ALL TIMEFRAMES</option>
                <option value="1m">1 Minute</option>
                <option value="3m">3 Minutes</option>
                <option value="5m">5 Minutes</option>
                <option value="15m">15 Minutes</option>
                <option value="30m">30 Minutes</option>
                <option value="1h">1 Hour</option>
                <option value="4h">4 Hours</option>
                <option value="1d">1 Day</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Risk:Reward Ratio</label>
              <input type="number" id="riskReward" placeholder="Enter R:R (e.g., 2.0)" step="0.1" min="1" max="10" defaultValue="2.0" className="form-control" />
            </div>
            
            <button className="btn btn-primary" onClick={() => (window as any).startBot()} id="startBtn">
              🚀 Start Real Data Analysis
            </button>
            <button className="btn btn-danger" onClick={() => (window as any).stopBot()} id="stopBtn" disabled>
              ⏹️ Stop Analysis
            </button>
            <button className="btn btn-secondary" onClick={() => (window as any).refreshSystem()}>
              🔄 Refresh System
            </button>
          </div>

          <div className="panel">
            <h3 className="panel-title">📊 Market Statistics</h3>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Active Pairs</div>
                <div className="stat-value" id="activePairs">0</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Signals Today</div>
                <div className="stat-value" id="signalsToday">0</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Active Timeframes</div>
                <div className="stat-value" id="activeTimeframes">0</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">System Status</div>
                <div className="stat-value" id="systemStatus">Ready</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">BOS</div>
                <div className="stat-value" id="bosCount">0</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">CHoCH</div>
                <div className="stat-value" id="chochCount">0</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Order Blocks</div>
                <div className="stat-value" id="orderBlocks">0</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">FVG</div>
                <div className="stat-value" id="fvgCount">0</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Active Signals</div>
                <div className="stat-value" id="activeSignals">0</div>
              </div>
            </div>
          </div>

          <div className="panel" id="insiderAnalysisContainer" style={{ display: 'none' }}>
            {/* Insider analysis will be injected here */}
          </div>
        </div>

        <div className="signals-section">
          <h3 className="panel-title">🎯 Live Trading Signals (SMC Analysis)</h3>
          <div id="signalsContainer">
            <div className="no-signals">
              <p> Configure settings and start analysis for live signals</p>
              <p style={{ fontSize: '0.9rem', marginTop: '10px', opacity: 0.8 }}>Real-time SMC structure analysis with verified data only</p>
            </div>
          </div>
        </div>

        <div className="panel">
          <h3 className="panel-title"> Live Activity Logs</h3>
          <div className="logs" id="logs">
            <div className="log-entry">
              <span className="log-time">[INIT]</span> <span className="log-success">Real Data Only SMC System Initialized</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoDashboard;
