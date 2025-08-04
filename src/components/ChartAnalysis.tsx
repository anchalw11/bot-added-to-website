import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Copy, Check, Send } from 'lucide-react';

const assets = [
  'ALL', 'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'NZDUSD', 'USDCAD',
  'EURGBP', 'EURAUD', 'GBPJPY', 'GBPCHF', 'AUDJPY', 'EURJPY', 'CADJPY',
  'CHFJPY', 'NZDJPY', 'XAUUSD', 'XAGUSD', 'USOIL', 'US30', 'US100'
];

const timeframes = ['ALL', '1min', '5min', '15min', '1hour', '4hour', 'daily'];

interface Signal {
  id: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  entry: number;
  stopLoss: number;
  targets: {
    target1: number;
    target2: number;
    target3: number;
  };
  rsr: string;
  confidence: number;
  analysis: string;
  timestamp: string;
  lotSize: string;
  timeframe: string;
}

const ChartAnalysis = () => {
  const [selectedAsset, setSelectedAsset] = useState(assets[0]);
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframes[0]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [filteredSignals, setFilteredSignals] = useState<Signal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const fetchSignal = useCallback(async (asset: string, timeframe: string) => {
    try {
      const response = await fetch(`http://localhost:5004/api/signal?asset=${asset}&timeframe=${timeframe}`);
      if (!response.ok) {
        // console.error(`Signal fetch failed for ${asset} ${timeframe}`);
        return;
      }
      const data = await response.json();
      if (data.symbol) {
        const newSignal = { ...data, id: new Date().toISOString(), timeframe };
        setSignals(prevSignals => {
          const isDuplicate = prevSignals.some(
            s => s.symbol === newSignal.symbol && s.timeframe === newSignal.timeframe && s.direction === newSignal.direction
          );
          if (!isDuplicate) {
            return [newSignal, ...prevSignals];
          }
          return prevSignals;
        });
      }
    } catch (error) {
      console.error("Failed to fetch signal:", error);
    }
  }, []);

  const fetchAllSignals = useCallback(async () => {
    setIsLoading(true);
    const assetsToFetch = assets.slice(1); // Always fetch all assets
    const timeframesToFetch = timeframes.slice(1); // Always fetch all timeframes

    await Promise.all(
      assetsToFetch.flatMap(asset =>
        timeframesToFetch.map(timeframe => fetchSignal(asset, timeframe))
      )
    );
    setIsLoading(false);
  }, [fetchSignal]);

  useEffect(() => {
    fetchAllSignals(); // Initial fetch
    const interval = setInterval(fetchAllSignals, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [fetchAllSignals]);

  useEffect(() => {
    let tempSignals = signals;
    if (selectedAsset !== 'ALL') {
      tempSignals = tempSignals.filter(s => s.symbol === selectedAsset);
    }
    if (selectedTimeframe !== 'ALL') {
      tempSignals = tempSignals.filter(s => s.timeframe === selectedTimeframe);
    }
    setFilteredSignals(tempSignals);
  }, [signals, selectedAsset, selectedTimeframe]);

  const handleCopy = (signal: Signal) => {
    const tradeDetails = `
      Symbol: ${signal.symbol}
      Direction: ${signal.direction}
      Entry: ${signal.entry}
      Stop Loss: ${signal.stopLoss}
      Take Profit: ${signal.targets.target1}
    `;
    navigator.clipboard.writeText(tradeDetails.trim());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSend = (signal: Signal) => {
    const existingSignals = JSON.parse(localStorage.getItem('admin_signals') || '[]');
    const newSignalData = {
      ...signal,
      timestamp: new Date().toISOString()
    };
    existingSignals.unshift(newSignalData);
    localStorage.setItem('admin_signals', JSON.stringify(existingSignals));

    const signalForUser = {
      id: parseInt(signal.id),
      text: `${signal.symbol}\n${signal.direction} NOW\nEntry ${signal.entry}\nStop Loss ${signal.stopLoss}\nTake Profit ${signal.targets.target1}\nConfidence ${signal.confidence}%\n\n${signal.analysis}`,
      timestamp: new Date().toISOString(),
      from: 'Signal Master',
      chat_id: 1,
      message_id: parseInt(signal.id),
      update_id: parseInt(signal.id)
    };
    
    const existingMessages = JSON.parse(localStorage.getItem('telegram_messages') || '[]');
    existingMessages.unshift(signalForUser);
    localStorage.setItem('telegram_messages', JSON.stringify(existingMessages));

    window.dispatchEvent(new CustomEvent('newSignalSent', { 
      detail: newSignalData 
    }));

    alert(`Signal for ${signal.symbol} sent to users!`);
  };

  return (
    <div className="p-4 text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Signals Center</h2>
        <div className="flex gap-4">
          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="bg-gray-800 text-white p-2 rounded"
          >
            {assets.map(asset => <option key={asset} value={asset}>{asset}</option>)}
          </select>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="bg-gray-800 text-white p-2 rounded"
          >
            {timeframes.map(tf => <option key={tf} value={tf}>{tf}</option>)}
          </select>
          <button
            onClick={fetchAllSignals}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {isLoading ? 'Refreshing...' : 'Refresh All'}
          </button>
          <button
            onClick={() => setSignals([])}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Clear All
          </button>
        </div>
      </div>
      
      {isLoading && signals.length === 0 && <p>Loading signals...</p>}
      
      <div className="space-y-4">
        {filteredSignals.map((signal) => (
          <div key={signal.id} className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-4">
                  <h3 className="text-3xl font-bold">{signal.symbol}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${signal.direction === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {signal.direction}
                  </span>
                  <span className="text-xs bg-gray-700 px-2 py-1 rounded">active</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{new Date(signal.timestamp).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Confidence</p>
                <p className="text-2xl font-bold text-green-400">{signal.confidence}%</p>
              </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-5 gap-6 mt-6 text-center">
              <div>
                <p className="text-sm text-gray-400">Entry</p>
                <p className="text-xl font-semibold">{signal.entry}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Stop Loss</p>
                <p className="text-xl font-semibold text-red-400">{signal.stopLoss}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Take Profit</p>
                <p className="text-xl font-semibold text-green-400">{signal.targets.target1}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">RSR</p>
                <p className="text-xl font-semibold">{signal.rsr}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Recommended Lot Size</p>
                <p className="text-xl font-semibold">{signal.lotSize}</p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-400">Analysis</p>
              <p>{signal.analysis}</p>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => handleCopy(signal)}
                className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 rounded-lg py-3 font-semibold transition-colors"
              >
                {isCopied ? <Check size={20} /> : <Copy size={20} />}
                {isCopied ? 'Copied!' : 'Copy Trade'}
              </button>
              <button
                onClick={() => handleSend(signal)}
                className="flex items-center justify-center gap-2 w-full bg-purple-600 hover:bg-purple-700 rounded-lg py-3 font-semibold transition-colors"
              >
                <Send size={20} />
                Send to Users
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartAnalysis;
