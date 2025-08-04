// =================================================================
// API CONFIGURATION
// =================================================================
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

// =================================================================
// ENHANCED FETCH WITH RETRY LOGIC
// =================================================================
async function fetchWithRetry(url, options = {}, maxRetries = 2) {
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
            log(`❌ Attempt ${attempt} failed: ${error.message}`, 'warning');
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
    }
    throw new Error(`All ${maxRetries} attempts failed. Last error: ${lastError.message}`);
}

// =================================================================
// GLOBAL VARIABLES
// =================================================================
let isAnalysisRunning = false;
let currentTimezone = 'UTC';
let marketData = {};
let targetRatios = [];
let priceUpdateCount = 0;
let activeConnections = [];

// =================================================================
// PRICE & DATA ENGINE (HYBRID)
// =================================================================
class DataEngine {
    constructor() {
        this.priceCache = new Map();
        this.lastUpdateTime = new Map();
        this.cacheValidityMs = 30000; // 30 seconds cache
    }

    getCachedPrice(symbol) {
        if (this.priceCache.has(symbol) && (Date.now() - this.lastUpdateTime.get(symbol) < this.cacheValidityMs)) {
            log(`💾 Using cached price for ${symbol}`, 'info');
            return this.priceCache.get(symbol);
        }
        return null;
    }

    setCachedPrice(symbol, priceData) {
        this.priceCache.set(symbol, priceData);
        this.lastUpdateTime.set(symbol, Date.now());
    }

    async fetchCurrencyBeaconPrice(symbol) {
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

    async fetchPolygonPrice(symbol) {
        const { key, host } = API_CONFIG.polygon;
        let ticker = symbol;
        if (symbol === 'US30') {
            ticker = 'I:DJI'; // Dow Jones Industrial Average
        } else if (symbol === 'USOIL') {
            ticker = 'C:USOIL'; // Crude Oil
        }
        const url = `https://${host}/v2/last/trade/${ticker}?apiKey=${key}`;
        const data = await fetchWithRetry(url, { headers: {} });
        if (data && data.results && data.results.p) {
            return { price: parseFloat(data.results.p), provider: 'Polygon.io' };
        }
        throw new Error(`Invalid price data from Polygon.io for ${symbol}`);
    }

    async fetchTaapiPrice(symbol) {
        const { host, keys } = API_CONFIG.taapi;
        const key = keys[symbol] || keys.default;
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

    async getPrice(symbol) {
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
        } catch (error) {
            log(`❌ Price fetch for ${symbol} failed: ${error.message}`, 'error');
            throw error;
        }
    }
}
const dataEngine = new DataEngine();

// =================================================================
// MAIN CONTROL FUNCTIONS
// =================================================================
function changeTimezone() {
    currentTimezone = document.getElementById('timezoneSelect').value;
    updateDateTime();
    log(`🌍 Timezone changed to: ${currentTimezone}`, 'success');
}

async function startAnalysis() {
    const symbolSelect = document.getElementById('symbol');
    const timeframeSelect = document.getElementById('timeframe');
    const targetsInput = document.getElementById('targets');
    if (!symbolSelect.value || !timeframeSelect.value) {
        log('⚠️ Please select a symbol and timeframe.', 'error');
        return;
    }
    try {
        targetRatios = targetsInput.value.trim().split(',').map(r => parseFloat(r.trim())).filter(r => r > 0);
        if (targetRatios.length === 0) throw new Error('Invalid R:R ratios');
    } catch (e) {
        log('⚠️ Invalid R:R format. Use comma-separated numbers (e.g., 1,2,3).', 'error');
        return;
    }

    isAnalysisRunning = true;
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;
    log('🚀 Analysis started.', 'success');
    log(`📊 Monitoring: ${symbolSelect.value} | ${timeframeSelect.value} | Targets: ${targetRatios.join(', ')}`, 'info');

    await fetchRealTimeData();
    const dataInterval = setInterval(fetchRealTimeData, 60000); // Fetch every 60 seconds
    activeConnections.push({ type: 'data_feed', intervalId: dataInterval });
}

function stopAnalysis() {
    isAnalysisRunning = false;
    activeConnections.forEach(conn => clearInterval(conn.intervalId));
    activeConnections = [];
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    log('⏹️ Analysis stopped.', 'warning');
}

function refreshSystem() {
    stopAnalysis();
    marketData = {};
    priceUpdateCount = 0;
    document.getElementById('priceFeed').innerHTML = '<div style="text-align: center; padding: 40px; opacity: 0.7;"><p>🔄 Initializing...</p></div>';
    document.getElementById('signalsContainer').innerHTML = '<div class="no-signals"><p> Configure settings and start analysis for live signals</p></div>';
    log('🔄 System refreshed.', 'success');
}

// =================================================================
// DATA FETCHING & ANALYSIS
// =================================================================
async function fetchRealTimeData() {
    if (!isAnalysisRunning) return;
    const symbolSelect = document.getElementById('symbol');
    let symbols;

    if (symbolSelect.value === 'ALL') {
        // Dynamically get all symbol values from the dropdown options
        symbols = Array.from(symbolSelect.options)
            .map(option => option.value)
            .filter(value => value && value !== 'ALL' && value !== ""); // Exclude empty and placeholder values
    } else {
        symbols = [symbolSelect.value];
    }
    
    log(`🚀 Initiating parallel fetch for ${symbols.length} symbols...`, 'info');

    const promises = symbols.map(symbol => dataEngine.getPrice(symbol));

    const results = await Promise.allSettled(promises);
    
    let successCount = 0;
    results.forEach((result, index) => {
        const symbol = symbols[index];
        if (result.status === 'fulfilled') {
            const priceData = result.value;
            if (priceData) {
                marketData[symbol] = priceData;
                successCount++;
                log(`✅ Fetched: ${symbol} = ${priceData.price} via ${priceData.provider}`, 'success');
            }
        } else {
            // Log the specific error for the failed symbol
            log(`❌ Fetch failed for symbol ${symbol}: ${result.reason.message}`, 'error');
        }
    });

    if (successCount > 0) {
        updatePriceFeed();
        priceUpdateCount++;
        document.getElementById('priceUpdates').textContent = priceUpdateCount;
        document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();
    }
}



// =================================================================
// UI & UTILITY FUNCTIONS
// =================================================================
function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: currentTimezone, timeZoneName: 'short' };
    document.getElementById('currentDateTime').textContent = now.toLocaleDateString('en-US', options);
}

function getPrecision(symbol) {
    if (['USDJPY'].includes(symbol)) return 3;
    if (['EURUSD', 'GBPUSD', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD'].includes(symbol)) return 5;
    return 2;
}

function log(message, type = 'info') {
    const logEntry = document.createElement('div');
    const timestamp = new Date().toLocaleTimeString('en-US', { timeZone: currentTimezone, hour12: false });
    const typeClass = { success: 'log-success', error: 'log-error', warning: 'log-warning' }[type] || '';
    logEntry.innerHTML = `<span class="log-time">[${timestamp}]</span> <span class="${typeClass}">${message}</span>`;
    const logsContainer = document.getElementById('logs');
    logsContainer.insertBefore(logEntry, logsContainer.firstChild);
    if (logsContainer.children.length > 100) logsContainer.removeChild(logsContainer.lastChild);
}

function updatePriceFeed() {
    const priceFeed = document.getElementById('priceFeed');
    priceFeed.innerHTML = '';
    Object.entries(marketData).forEach(([symbol, data]) => {
        if (!data || !data.price) return;
        const priceItem = document.createElement('div');
        priceItem.className = 'price-item flash';
        priceItem.innerHTML = `<span class="symbol-name">${symbol}</span>
            <span class="price-value">${data.price}</span>
            <span class="price-change positive">Live</span>`;
        priceFeed.appendChild(priceItem);
    });
    if (Object.keys(marketData).length === 0) {
        priceFeed.innerHTML = '<div style="text-align: center; padding: 40px; opacity: 0.7;"><p>⏳ Waiting for price data...</p></div>';
    }
}

// =================================================================
// INITIALIZATION
// =================================================================
document.addEventListener('DOMContentLoaded', function() {
    setInterval(updateDateTime, 1000);
    updateDateTime();
    log('🚀 System Ready.', 'success');
    log('📊 Using Final Hybrid Engine (CurrencyBeacon & taapi.io).', 'info');
});
