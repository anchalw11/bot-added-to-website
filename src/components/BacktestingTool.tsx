import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Target, DollarSign, BarChart3, Play, RotateCcw, Save } from 'lucide-react';
import MarketOverviewWidget from './MarketOverviewWidget';

interface BacktestTrade {
  id: string;
  symbol: string;
  direction: 'long' | 'short';
  entryPrice: number;
  exitPrice?: number;
  stopLoss: number;
  takeProfit: number;
  lotSize: number;
  entryTime: Date;
  exitTime?: Date;
  status: 'open' | 'closed' | 'stopped';
  pnl?: number;
  pips?: number;
  notes: string;
}

const BacktestingTool: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('EURUSD');
  const [tradeDirection, setTradeDirection] = useState<'long' | 'short'>('long');
  const [entryPrice, setEntryPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [lotSize, setLotSize] = useState('1.0');
  const [notes, setNotes] = useState('');
  const [backtestTrades, setBacktestTrades] = useState<BacktestTrade[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState(false);

  const symbols = [
    'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
    'EURJPY', 'GBPJPY', 'EURGBP', 'XAUUSD', 'XAGUSD', 'BTCUSD', 'ETHUSD'
  ];

  // Mock current prices for backtesting
  const mockPrices: {[key: string]: number} = {
    'EURUSD': 1.0850, 'GBPUSD': 1.2750, 'USDJPY': 149.50, 'USDCHF': 0.9100,
    'AUDUSD': 0.6650, 'USDCAD': 1.3600, 'NZDUSD': 0.6200, 'EURJPY': 162.25,
    'GBPJPY': 190.62, 'EURGBP': 0.8510, 'XAUUSD': 2020.00, 'XAGUSD': 24.50,
    'BTCUSD': 45000, 'ETHUSD': 2800
  };

  useEffect(() => {
    setCurrentPrice(mockPrices[selectedSymbol] || 1.0000);
  }, [selectedSymbol]);

  const placeDemoTrade = () => {
    if (!entryPrice || !stopLoss || !takeProfit || !lotSize) {
      alert('Please fill in all trade parameters');
      return;
    }

    const trade: BacktestTrade = {
      id: Date.now().toString(),
      symbol: selectedSymbol,
      direction: tradeDirection,
      entryPrice: parseFloat(entryPrice),
      stopLoss: parseFloat(stopLoss),
      takeProfit: parseFloat(takeProfit),
      lotSize: parseFloat(lotSize),
      entryTime: new Date(),
      status: 'open',
      notes
    };

    setBacktestTrades(prev => [trade, ...prev]);
    
    // Clear form
    setEntryPrice('');
    setStopLoss('');
    setTakeProfit('');
    setNotes('');
    
    // Start simulation for this trade
    simulateTradeOutcome(trade);
  };

  const simulateTradeOutcome = (trade: BacktestTrade) => {
    setIsSimulating(true);
    
    // Simulate market movement over time
    const simulationInterval = setInterval(() => {
      const volatility = 0.001; // 0.1% volatility
      const randomMove = (Math.random() - 0.5) * volatility * trade.entryPrice;
      const newPrice = currentPrice + randomMove;
      setCurrentPrice(newPrice);

      // Check if trade hits SL or TP
      let shouldClose = false;
      let exitPrice = newPrice;
      let status: 'closed' | 'stopped' = 'closed';

      if (trade.direction === 'long') {
        if (newPrice <= trade.stopLoss) {
          exitPrice = trade.stopLoss;
          status = 'stopped';
          shouldClose = true;
        } else if (newPrice >= trade.takeProfit) {
          exitPrice = trade.takeProfit;
          status = 'closed';
          shouldClose = true;
        }
      } else {
        if (newPrice >= trade.stopLoss) {
          exitPrice = trade.stopLoss;
          status = 'stopped';
          shouldClose = true;
        } else if (newPrice <= trade.takeProfit) {
          exitPrice = trade.takeProfit;
          status = 'closed';
          shouldClose = true;
        }
      }

      if (shouldClose) {
        clearInterval(simulationInterval);
        setIsSimulating(false);
        
        // Calculate PnL
        const priceDiff = trade.direction === 'long' 
          ? exitPrice - trade.entryPrice 
          : trade.entryPrice - exitPrice;
        
        const pipValue = selectedSymbol.includes('JPY') ? 0.01 : 0.0001;
        const pips = priceDiff / pipValue;
        const pnl = priceDiff * trade.lotSize * 100000; // Standard lot calculation

        // Update trade
        setBacktestTrades(prev => prev.map(t => 
          t.id === trade.id 
            ? { ...t, exitPrice, exitTime: new Date(), status, pnl, pips }
            : t
        ));
      }
    }, 1000); // Update every second

    // Auto-close simulation after 30 seconds if no outcome
    setTimeout(() => {
      clearInterval(simulationInterval);
      setIsSimulating(false);
    }, 30000);
  };

  const calculateRiskReward = () => {
    if (!entryPrice || !stopLoss || !takeProfit) return { risk: 0, reward: 0, ratio: '0:0' };
    
    const entry = parseFloat(entryPrice);
    const sl = parseFloat(stopLoss);
    const tp = parseFloat(takeProfit);
    
    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp - entry);
    const ratio = risk > 0 ? (reward / risk).toFixed(1) : '0';
    
    return { risk, reward, ratio: `1:${ratio}` };
  };

  const resetBacktest = () => {
    setBacktestTrades([]);
    setCurrentPrice(mockPrices[selectedSymbol] || 1.0000);
  };

  const saveBacktestResults = () => {
    const results = {
      symbol: selectedSymbol,
      trades: backtestTrades,
      totalTrades: backtestTrades.length,
      winningTrades: backtestTrades.filter(t => t.pnl && t.pnl > 0).length,
      totalPnL: backtestTrades.reduce((sum, t) => sum + (t.pnl || 0), 0),
      timestamp: new Date().toISOString()
    };
    
    const existingResults = JSON.parse(localStorage.getItem('backtest_results') || '[]');
    existingResults.unshift(results);
    localStorage.setItem('backtest_results', JSON.stringify(existingResults.slice(0, 50)));
    
    alert('Backtest results saved!');
  };

  const riskReward = calculateRiskReward();
  const totalPnL = backtestTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const winRate = backtestTrades.length > 0 
    ? (backtestTrades.filter(t => t.pnl && t.pnl > 0).length / backtestTrades.filter(t => t.status !== 'open').length) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Chart Widget */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Live Chart Analysis</h3>
        <div className="h-96">
          <MarketOverviewWidget />
        </div>
      </div>

      {/* Backtesting Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trade Entry Form */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-400" />
            Demo Trade Entry
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Symbol</label>
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                {symbols.map(symbol => (
                  <option key={symbol} value={symbol}>{symbol}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Direction</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTradeDirection('long')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    tradeDirection === 'long'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  Long
                </button>
                <button
                  onClick={() => setTradeDirection('short')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    tradeDirection === 'short'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <TrendingDown className="w-4 h-4 inline mr-2" />
                  Short
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Entry Price</label>
                <input
                  type="number"
                  step="0.00001"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder={currentPrice.toFixed(5)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Lot Size</label>
                <input
                  type="number"
                  step="0.01"
                  value={lotSize}
                  onChange={(e) => setLotSize(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Stop Loss</label>
                <input
                  type="number"
                  step="0.00001"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Take Profit</label>
                <input
                  type="number"
                  step="0.00001"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Trade Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Why are you taking this trade?"
              />
            </div>

            {/* Risk/Reward Display */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-gray-400">Risk</div>
                  <div className="text-red-400 font-bold">{riskReward.risk.toFixed(5)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Reward</div>
                  <div className="text-green-400 font-bold">{riskReward.reward.toFixed(5)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">R:R Ratio</div>
                  <div className="text-blue-400 font-bold">{riskReward.ratio}</div>
                </div>
              </div>
            </div>

            <button
              onClick={placeDemoTrade}
              disabled={isSimulating}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>{isSimulating ? 'Simulating...' : 'Place Demo Trade'}</span>
            </button>
          </div>
        </div>

        {/* Backtest Statistics */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-green-400" />
            Backtest Results
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">{backtestTrades.length}</div>
                <div className="text-sm text-gray-400">Total Trades</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                <div className={`text-2xl font-bold mb-1 ${winRate >= 70 ? 'text-green-400' : winRate >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {winRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400">Win Rate</div>
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4 text-center">
              <div className={`text-3xl font-bold mb-1 ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${totalPnL.toFixed(2)}
              </div>
              <div className="text-sm text-gray-400">Total P&L</div>
            </div>

            <div className="space-y-2">
              <button
                onClick={resetBacktest}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Backtest</span>
              </button>
              
              <button
                onClick={saveBacktestResults}
                disabled={backtestTrades.length === 0}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Results</span>
              </button>
            </div>
          </div>
        </div>

        {/* Current Market Data */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Market Data</h3>
          
          <div className="space-y-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">{selectedSymbol}</div>
                <div className="text-2xl font-bold text-blue-400">{currentPrice.toFixed(5)}</div>
                <div className="text-xs text-gray-500 mt-1">Current Price</div>
              </div>
            </div>

            <div className="text-sm text-gray-400 space-y-2">
              <div className="flex justify-between">
                <span>Spread:</span>
                <span className="text-white">2.0 pips</span>
              </div>
              <div className="flex justify-between">
                <span>Session:</span>
                <span className="text-white">London</span>
              </div>
              <div className="flex justify-between">
                <span>Volatility:</span>
                <span className="text-white">Medium</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Trades */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Demo Trades</h3>
        
        {backtestTrades.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-400">No demo trades placed yet</div>
            <div className="text-sm text-gray-500 mt-2">Place your first demo trade to start backtesting</div>
          </div>
        ) : (
          <div className="space-y-4">
            {backtestTrades.map(trade => (
              <div key={trade.id} className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      trade.status === 'open' ? 'bg-yellow-400' :
                      trade.status === 'closed' ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    <span className="text-white font-medium">{trade.symbol}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      trade.direction === 'long' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                    }`}>
                      {trade.direction.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${
                      trade.pnl === undefined ? 'text-yellow-400' :
                      trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {trade.pnl !== undefined ? `$${trade.pnl.toFixed(2)}` : 'Open'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {trade.pips !== undefined ? `${trade.pips.toFixed(1)} pips` : 'Running'}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-3 text-sm">
                  <div>
                    <div className="text-gray-400">Entry</div>
                    <div className="text-white">{trade.entryPrice}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">SL</div>
                    <div className="text-red-400">{trade.stopLoss}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">TP</div>
                    <div className="text-green-400">{trade.takeProfit}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Size</div>
                    <div className="text-white">{trade.lotSize}</div>
                  </div>
                </div>
                
                {trade.notes && (
                  <div className="mt-3 text-sm text-gray-300 bg-gray-800/50 rounded p-2">
                    {trade.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BacktestingTool;