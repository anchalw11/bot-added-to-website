import React, { useState } from 'react';
import { Calendar, TrendingUp, TrendingDown, Target, Brain, Award, Tag, Save, X } from 'lucide-react';

interface TradingJournalEntryProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: JournalEntry) => void;
  editEntry?: JournalEntry | null;
}

interface JournalEntry {
  id: string;
  // Trade Details
  dateTime: string;
  symbol: string;
  entryPrice: number;
  exitPrice: number;
  positionSize: number;
  direction: 'long' | 'short';
  stopLoss: number;
  takeProfit: number;
  riskRewardRatio: number;
  rMultiple: number;
  
  // Market Analysis
  preMarketConditions: string;
  keyLevels: string;
  marketSentiment: string;
  relevantNews: string;
  technicalSetup: string;
  strategyUsed: string;
  timeFrame: string;
  
  // Execution Review
  tradeManagement: string;
  emotionalState: string;
  planDeviations: string;
  entryTiming: 'excellent' | 'good' | 'average' | 'poor';
  exitTiming: 'excellent' | 'good' | 'average' | 'poor';
  
  // Performance Metrics
  profitLoss: number;
  profitLossPercentage: number;
  winRate: number;
  riskManagementScore: number;
  ruleAdherence: number;
  
  // Learning & Improvement
  whatWentWell: string;
  mistakesMade: string;
  improvementAreas: string;
  actionItems: string;
  
  // Tags & Categories
  tradingStrategy: string;
  marketConditions: string;
  emotionalTags: string[];
  setupQuality: 'A' | 'B' | 'C';
  
  createdAt: string;
  updatedAt: string;
}

const TradingJournalEntry: React.FC<TradingJournalEntryProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editEntry 
}) => {
  const [entry, setEntry] = useState<Partial<JournalEntry>>({
    dateTime: new Date().toISOString().slice(0, 16),
    symbol: '',
    entryPrice: 0,
    exitPrice: 0,
    positionSize: 0,
    direction: 'long',
    stopLoss: 0,
    takeProfit: 0,
    riskRewardRatio: 0,
    rMultiple: 0,
    preMarketConditions: '',
    keyLevels: '',
    marketSentiment: '',
    relevantNews: '',
    technicalSetup: '',
    strategyUsed: '',
    timeFrame: '15m',
    tradeManagement: '',
    emotionalState: '',
    planDeviations: '',
    entryTiming: 'good',
    exitTiming: 'good',
    profitLoss: 0,
    profitLossPercentage: 0,
    winRate: 0,
    riskManagementScore: 8,
    ruleAdherence: 8,
    whatWentWell: '',
    mistakesMade: '',
    improvementAreas: '',
    actionItems: '',
    tradingStrategy: '',
    marketConditions: '',
    emotionalTags: [],
    setupQuality: 'B',
    ...editEntry
  });

  const [activeTab, setActiveTab] = useState('details');

  const emotionalTagOptions = [
    'Confident', 'Hesitant', 'FOMO', 'Disciplined', 'Anxious', 'Calm', 
    'Impatient', 'Focused', 'Greedy', 'Fearful', 'Neutral', 'Excited'
  ];

  const strategyOptions = [
    'Breakout', 'Reversal', 'Trend Following', 'Scalping', 'Swing Trading',
    'Mean Reversion', 'Momentum', 'Support/Resistance', 'ICT/SMC', 'News Trading'
  ];

  const marketConditionOptions = [
    'Trending Up', 'Trending Down', 'Ranging', 'Volatile', 'Quiet', 
    'High Volume', 'Low Volume', 'News Event', 'Session Open', 'Session Close'
  ];

  const timeFrameOptions = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'];

  const handleInputChange = (field: string, value: any) => {
    setEntry(prev => ({ ...prev, [field]: value }));
    
    // Auto-calculate fields
    if (field === 'entryPrice' || field === 'exitPrice' || field === 'stopLoss') {
      const entryPrice = field === 'entryPrice' ? value : prev.entryPrice || 0;
      const exitPrice = field === 'exitPrice' ? value : prev.exitPrice || 0;
      const stopLoss = field === 'stopLoss' ? value : prev.stopLoss || 0;
      
      if (entryPrice && exitPrice && stopLoss) {
        const risk = Math.abs(entryPrice - stopLoss);
        const reward = Math.abs(exitPrice - entryPrice);
        const riskRewardRatio = risk > 0 ? reward / risk : 0;
        const rMultiple = prev.direction === 'long' 
          ? (exitPrice - entryPrice) / (entryPrice - stopLoss)
          : (entryPrice - exitPrice) / (stopLoss - entryPrice);
        const profitLoss = prev.direction === 'long' 
          ? (exitPrice - entryPrice) * (prev.positionSize || 0)
          : (entryPrice - exitPrice) * (prev.positionSize || 0);
        const profitLossPercentage = entryPrice > 0 ? (profitLoss / (entryPrice * (prev.positionSize || 0))) * 100 : 0;
        
        setEntry(prev => ({
          ...prev,
          riskRewardRatio: Math.round(riskRewardRatio * 100) / 100,
          rMultiple: Math.round(rMultiple * 100) / 100,
          profitLoss: Math.round(profitLoss * 100) / 100,
          profitLossPercentage: Math.round(profitLossPercentage * 100) / 100
        }));
      }
    }
  };

  const toggleEmotionalTag = (tag: string) => {
    const currentTags = entry.emotionalTags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    setEntry(prev => ({ ...prev, emotionalTags: newTags }));
  };

  const handleSave = () => {
    const completeEntry: JournalEntry = {
      id: editEntry?.id || Date.now().toString(),
      createdAt: editEntry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...entry as JournalEntry
    };
    onSave(completeEntry);
    onClose();
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'details', label: 'Trade Details', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'analysis', label: 'Market Analysis', icon: <Brain className="w-4 h-4" /> },
    { id: 'execution', label: 'Execution Review', icon: <Target className="w-4 h-4" /> },
    { id: 'performance', label: 'Performance', icon: <Award className="w-4 h-4" /> },
    { id: 'learning', label: 'Learning', icon: <Tag className="w-4 h-4" /> }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            {editEntry ? 'Edit' : 'New'} Trading Journal Entry
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 px-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab.icon}
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={entry.dateTime}
                    onChange={(e) => handleInputChange('dateTime', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Symbol/Instrument</label>
                  <input
                    type="text"
                    value={entry.symbol}
                    onChange={(e) => handleInputChange('symbol', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="EURUSD, AAPL, BTC/USD"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Entry Price</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={entry.entryPrice}
                    onChange={(e) => handleInputChange('entryPrice', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Exit Price</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={entry.exitPrice}
                    onChange={(e) => handleInputChange('exitPrice', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Position Size</label>
                  <input
                    type="number"
                    step="0.01"
                    value={entry.positionSize}
                    onChange={(e) => handleInputChange('positionSize', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Direction</label>
                  <select
                    value={entry.direction}
                    onChange={(e) => handleInputChange('direction', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="long">Long</option>
                    <option value="short">Short</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Stop Loss</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={entry.stopLoss}
                    onChange={(e) => handleInputChange('stopLoss', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Take Profit</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={entry.takeProfit}
                    onChange={(e) => handleInputChange('takeProfit', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Risk-Reward Ratio</div>
                  <div className="text-xl font-bold text-blue-400">1:{entry.riskRewardRatio?.toFixed(2) || '0.00'}</div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">R-Multiple</div>
                  <div className={`text-xl font-bold ${(entry.rMultiple || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {entry.rMultiple?.toFixed(2) || '0.00'}R
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Pre-Market Conditions</label>
                <textarea
                  value={entry.preMarketConditions}
                  onChange={(e) => handleInputChange('preMarketConditions', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe market conditions before the trade..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Key Levels</label>
                <textarea
                  value={entry.keyLevels}
                  onChange={(e) => handleInputChange('keyLevels', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Support, resistance, pivot points..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Market Sentiment</label>
                  <select
                    value={entry.marketSentiment}
                    onChange={(e) => handleInputChange('marketSentiment', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select sentiment</option>
                    <option value="bullish">Bullish</option>
                    <option value="bearish">Bearish</option>
                    <option value="neutral">Neutral</option>
                    <option value="uncertain">Uncertain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Time Frame</label>
                  <select
                    value={entry.timeFrame}
                    onChange={(e) => handleInputChange('timeFrame', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  >
                    {timeFrameOptions.map(tf => (
                      <option key={tf} value={tf}>{tf}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Relevant News</label>
                <textarea
                  value={entry.relevantNews}
                  onChange={(e) => handleInputChange('relevantNews', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Economic events, news that affected the trade..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Technical Setup</label>
                <textarea
                  value={entry.technicalSetup}
                  onChange={(e) => handleInputChange('technicalSetup', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Chart patterns, indicators, technical analysis..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Strategy Used</label>
                <select
                  value={entry.strategyUsed}
                  onChange={(e) => handleInputChange('strategyUsed', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select strategy</option>
                  {strategyOptions.map(strategy => (
                    <option key={strategy} value={strategy}>{strategy}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {activeTab === 'execution' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Trade Management Decisions</label>
                <textarea
                  value={entry.tradeManagement}
                  onChange={(e) => handleInputChange('tradeManagement', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="How did you manage the trade? Any adjustments made?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Emotional State During Trade</label>
                <textarea
                  value={entry.emotionalState}
                  onChange={(e) => handleInputChange('emotionalState', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="How did you feel during the trade? Any emotional challenges?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Deviations from Original Plan</label>
                <textarea
                  value={entry.planDeviations}
                  onChange={(e) => handleInputChange('planDeviations', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Did you stick to your plan? Any changes made?"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Entry Timing Quality</label>
                  <select
                    value={entry.entryTiming}
                    onChange={(e) => handleInputChange('entryTiming', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="average">Average</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Exit Timing Quality</label>
                  <select
                    value={entry.exitTiming}
                    onChange={(e) => handleInputChange('exitTiming', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="average">Average</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Profit/Loss Amount</div>
                  <div className={`text-2xl font-bold ${(entry.profitLoss || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${entry.profitLoss?.toFixed(2) || '0.00'}
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Profit/Loss Percentage</div>
                  <div className={`text-2xl font-bold ${(entry.profitLossPercentage || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {entry.profitLossPercentage?.toFixed(2) || '0.00'}%
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Win Rate for This Setup (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={entry.winRate}
                  onChange={(e) => handleInputChange('winRate', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Risk Management Score (1-10)</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={entry.riskManagementScore}
                    onChange={(e) => handleInputChange('riskManagementScore', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center text-white font-semibold">{entry.riskManagementScore}/10</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rule Adherence Score (1-10)</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={entry.ruleAdherence}
                    onChange={(e) => handleInputChange('ruleAdherence', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center text-white font-semibold">{entry.ruleAdherence}/10</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'learning' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">What Went Well</label>
                <textarea
                  value={entry.whatWentWell}
                  onChange={(e) => handleInputChange('whatWentWell', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Positive aspects of this trade..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Mistakes Made & Lessons Learned</label>
                <textarea
                  value={entry.mistakesMade}
                  onChange={(e) => handleInputChange('mistakesMade', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="What could have been done better?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Areas for Improvement</label>
                <textarea
                  value={entry.improvementAreas}
                  onChange={(e) => handleInputChange('improvementAreas', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Specific areas to focus on..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Action Items for Future Trades</label>
                <textarea
                  value={entry.actionItems}
                  onChange={(e) => handleInputChange('actionItems', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Concrete steps to improve future performance..."
                />
              </div>

              {/* Tags & Categories */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Trading Strategy</label>
                  <select
                    value={entry.tradingStrategy}
                    onChange={(e) => handleInputChange('tradingStrategy', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select strategy</option>
                    {strategyOptions.map(strategy => (
                      <option key={strategy} value={strategy}>{strategy}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Market Conditions</label>
                  <select
                    value={entry.marketConditions}
                    onChange={(e) => handleInputChange('marketConditions', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select conditions</option>
                    {marketConditionOptions.map(condition => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Emotional Tags</label>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {emotionalTagOptions.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleEmotionalTag(tag)}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          (entry.emotionalTags || []).includes(tag)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Setup Quality Rating</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['A', 'B', 'C'].map(grade => (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => handleInputChange('setupQuality', grade)}
                        className={`px-4 py-3 rounded-lg font-semibold transition-colors ${
                          entry.setupQuality === grade
                            ? grade === 'A' ? 'bg-green-600 text-white' :
                              grade === 'B' ? 'bg-yellow-600 text-white' : 'bg-red-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        Grade {grade}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Entry</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradingJournalEntry;