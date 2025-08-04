import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Calendar, DollarSign, TrendingUp, AlertTriangle, CheckCircle, ArrowRight, ArrowLeft, Download } from 'lucide-react';
import { useTradingPlan } from '../contexts/TradingPlanContext';
import { useUser } from '../contexts/UserContext';
import Header from './Header';

const TradingPlanGenerator: React.FC = () => {
  const navigate = useNavigate();
  const { propFirm, accountConfig, riskConfig, updateTradingPlan } = useTradingPlan();
  const { user, setUser } = useUser();
  const [selectedPlan, setSelectedPlan] = useState<'30day' | '45day' | '60day'>('30day');

  // Redirect if required data is missing
  if (!propFirm || !accountConfig || !riskConfig) {
    navigate('/setup/prop-firm');
    return null;
  }

  const accountSize = accountConfig.size;
  
  // Derive risk tolerance from risk percentage
  const getRiskTolerance = (riskPercentage: number): 'conservative' | 'moderate' | 'aggressive' => {
    if (riskPercentage <= 0.5) return 'conservative';
    if (riskPercentage <= 1) return 'moderate';
    return 'aggressive';
  };
  
  const riskTolerance = getRiskTolerance(riskConfig.riskPercentage);

  // Extract profit target from prop firm rules
  const extractProfitTarget = (profitTargetString: string): number => {
    // Extract first percentage from strings like "10% (Phase 1), 5% (Phase 2)" or "10%"
    const match = profitTargetString.match(/(\d+(?:\.\d+)?)%/);
    return match ? parseFloat(match[1]) : 10; // Default to 10% if can't parse
  };

  // Extract daily loss from prop firm rules
  const extractDailyLoss = (dailyLossString: string): number => {
    const match = dailyLossString.match(/(\d+(?:\.\d+)?)%/);
    return match ? parseFloat(match[1]) : 5; // Default to 5% if can't parse
  };

  // Extract max drawdown from prop firm rules
  const extractMaxDrawdown = (maxLossString: string): number => {
    const match = maxLossString.match(/(\d+(?:\.\d+)?)%/);
    return match ? parseFloat(match[1]) : 10; // Default to 10% if can't parse
  };

  // Extract min trading days
  const extractMinTradingDays = (minDaysString: string): number => {
    const match = minDaysString.match(/(\d+)/);
    return match ? parseInt(match[1]) : 10; // Default to 10 days if can't parse
  };

  const rules = {
    dailyLoss: extractDailyLoss(propFirm.dailyLossLimit),
    maxDrawdown: extractMaxDrawdown(propFirm.maximumLoss),
    profitTarget: extractProfitTarget(propFirm.profitTargets),
    minTradingDays: extractMinTradingDays(propFirm.minTradingDays),
    maxPositionSize: 2, // Default
    scalingTarget: 10, // Default
    consistencyRule: propFirm.consistencyRule || false,
    consistencyPercentage: propFirm.consistencyPercentage || 0
  };

  // Risk parameters based on tolerance
  const riskParams = {
    conservative: { baseRisk: 0.5, maxRisk: 1.0, targetMultiplier: 2 },
    moderate: { baseRisk: 1.0, maxRisk: 1.5, targetMultiplier: 2.5 },
    aggressive: { baseRisk: 1.5, maxRisk: 2.0, targetMultiplier: 3 }
  };

  const params = riskParams[riskTolerance];

  // Generate trading plan
  const generateTradingPlan = (timeline: '30day' | '45day' | '60day') => {
    const profitTarget = (accountSize * rules.profitTarget) / 100;
    const riskPerTrade = riskConfig.riskPercentage;
    const rewardRatio = riskConfig.riskRewardRatio;
    const maxConsecutiveLosses = riskConfig.maxConsecutiveLosses || 3;
    const tradingExperience = riskConfig.tradingExperience || 'intermediate';
    
    // Calculate realistic timeline based on user parameters
    const avgTradesPerDay = tradingExperience === 'beginner' ? 1 : 
                           tradingExperience === 'intermediate' ? 1.5 : 2;
    const winRate = 0.65; // 65% estimated win rate
    const avgRewardPerWin = (accountSize * riskPerTrade * rewardRatio) / 100;
    const avgLossPerLoss = (accountSize * riskPerTrade) / 100;
    
    // Calculate expected profit per trade
    const expectedProfitPerTrade = (winRate * avgRewardPerWin) - ((1 - winRate) * avgLossPerLoss);
    const tradesNeeded = Math.ceil(profitTarget / expectedProfitPerTrade);
    const estimatedDays = Math.ceil(tradesNeeded / avgTradesPerDay);
    
    // Add buffer for drawdown periods
    const bufferDays = Math.ceil(estimatedDays * 0.3);
    const totalDays = estimatedDays + bufferDays;
    
    // Generate dynamic trading plan
    const trades = [];
    let currentRisk = riskPerTrade;
    let consecutiveLosses = 0;
    let totalProfit = 0;
    let tradeCount = 0;
    
    // Calculate lot size based on risk percentage
    function calculateLotSize(riskPercent: number, accountBalance: number) {
      const riskAmount = (accountBalance * riskPercent) / 100;
      const pipValue = 10; // Simplified: $10 per pip for standard lot
      const averagePipsAtRisk = 20; // Average 20 pips stop loss
      return Math.round((riskAmount / (averagePipsAtRisk * pipValue)) * 100) / 100;
    }

    while (totalProfit < profitTarget && tradeCount < tradesNeeded * 1.5) {
      tradeCount++;
      
      // Simulate trade outcome
      const isWin = Math.random() < winRate;
      
      if (isWin) {
        const profit = (accountSize * currentRisk * rewardRatio) / 100;
        totalProfit += profit;
        consecutiveLosses = 0;
        
        // Slightly increase risk after wins (max 0.1% increase)
        if (currentRisk < params.maxRisk) {
          currentRisk = Math.min(params.maxRisk, currentRisk + 0.1);
        }
        
        trades.push({
          id: tradeCount,
          risk: currentRisk,
          reward: currentRisk * rewardRatio,
          outcome: 'win',
          expectedReturn: profit,
          lotSize: calculateLotSize(currentRisk, accountSize),
          description: `Trade ${tradeCount} - WIN (+${profit.toFixed(0)})`,
          timeframe: '1H',
          pairs: ['EURUSD', 'GBPUSD', 'USDJPY'],
          stopLoss: 0,
          takeProfit: 0
        });
      } else {
        const loss = (accountSize * currentRisk) / 100;
        totalProfit -= loss;
        consecutiveLosses++;
        
        // Decrease risk after consecutive losses
        if (consecutiveLosses >= maxConsecutiveLosses) {
          currentRisk = Math.max(0.25, currentRisk * 0.8); // Reduce by 20%
          consecutiveLosses = 0; // Reset counter after adjustment
        }
        
        trades.push({
          id: tradeCount,
          risk: currentRisk,
          reward: 0,
          outcome: 'loss',
          expectedReturn: -loss,
          lotSize: calculateLotSize(currentRisk, accountSize),
          description: `Trade ${tradeCount} - LOSS (-${loss.toFixed(0)})`,
          timeframe: '1H',
          pairs: ['EURUSD', 'GBPUSD', 'USDJPY'],
          stopLoss: 0,
          takeProfit: 0
        });
      }
    }

    const winningTrades = trades.filter(t => t.outcome === 'win');
    const losingTrades = trades.filter(t => t.outcome === 'loss');

    return {
      trades,
      timeline: {
        estimatedDays: totalDays,
        tradesNeeded: tradesNeeded,
        avgTradesPerDay: avgTradesPerDay,
        total: totalDays
      },
      targets: {
        totalTarget: profitTarget,
        expectedProfit: totalProfit,
        winningTrades: winningTrades.length,
        losingTrades: losingTrades.length,
        finalWinRate: (winningTrades.length / trades.length) * 100
      }
    };
  };

  const plan = generateTradingPlan(selectedPlan);

  const handleContinue = () => {
    // Save the generated plan to context
    updateTradingPlan(plan);
    // Mark setup as complete
    if (user) {
      setUser({ ...user, setupComplete: true });
    }
    // Navigate to dashboard
    navigate('/dashboard');
  };

  const downloadPlan = () => {
    const planData = {
      propFirm: propFirm.name,
      accountSize: accountConfig.size,
      challengeType: accountConfig.challengeType,
      riskPercentage: riskConfig.riskPercentage,
      riskRewardRatio: riskConfig.riskRewardRatio,
      timeline: selectedPlan,
      trades: plan.trades,
      targets: plan.targets,
      timeline_details: plan.timeline
    };
    
    const dataStr = JSON.stringify(planData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${propFirm.name}_Trading_Plan_${accountConfig.size}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <Header />
      
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-2 text-blue-400 mb-4">
              <Target className="w-6 h-6" />
              <span className="text-sm font-medium">Step 4 of 5</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Your Custom Trading Plan</h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-6">
              Personalized trading strategy for your {propFirm.name} {accountConfig.challengeType} challenge
            </p>
            
            {/* Configuration Summary */}
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700 p-4 max-w-lg mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-blue-400 font-semibold">{propFirm.name}</div>
                  <div className="text-gray-400">Prop Firm</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-semibold">${accountConfig.size.toLocaleString()}</div>
                  <div className="text-gray-400">Account Size</div>
                </div>
                <div className="text-center">
                  <div className="text-purple-400 font-semibold">{riskConfig.riskPercentage}%</div>
                  <div className="text-gray-400">Risk Per Trade</div>
                </div>
                <div className="text-center">
                  <div className="text-yellow-400 font-semibold">1:{riskConfig.riskRewardRatio}</div>
                  <div className="text-gray-400">Risk:Reward</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Plan Selection */}
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Select Trading Plan Timeline</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: '30day', label: '30-Day Plan', desc: 'Aggressive timeline' },
                  { id: '45day', label: '45-Day Plan', desc: 'Balanced approach' },
                  { id: '60day', label: '60-Day Plan', desc: 'Conservative timeline' }
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedPlan(option.id as any)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedPlan === option.id
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-semibold text-white">{option.label}</div>
                      <div className="text-sm text-gray-400 mt-1">{option.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Prop Firm Rules */}
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">{propFirm.name} Trading Rules</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-white font-medium">Daily Loss Limit</span>
                  </div>
                  <div className="text-2xl font-bold text-red-400">{rules.dailyLoss}%</div>
                  <div className="text-sm text-gray-400">${(accountSize * rules.dailyLoss / 100).toLocaleString()}</div>
                </div>
                
                <div className="bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span className="text-white font-medium">Profit Target</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-500">{rules.profitTarget}%</div>
                  <div className="text-sm text-gray-400">${(accountSize * rules.profitTarget / 100).toLocaleString()}</div>
                </div>
                
                <div className="bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-yellow-400" />
                    <span className="text-white font-medium">Max Drawdown</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-400">{rules.maxDrawdown}%</div>
                  <div className="text-sm text-gray-400">${(accountSize * rules.maxDrawdown / 100).toLocaleString()}</div>
                </div>
              </div>

              {/* Consistency Rule Display */}
              {rules.consistencyRule && (
                <div className="mt-4 bg-orange-600/20 border border-orange-600 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    <span className="text-white font-medium">Consistency Rule</span>
                  </div>
                  <div className="text-lg font-bold text-orange-400">{rules.consistencyPercentage}%</div>
                  <div className="text-sm text-gray-400">
                    Maximum daily profit as % of total target: ${((accountSize * rules.profitTarget / 100) * rules.consistencyPercentage / 100).toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            {/* Trading Sequence */}
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Detailed Trading Sequence</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {plan.trades.slice(0, 20).map((trade, index) => (
                  <div key={trade.id} className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                          trade.outcome === 'win' ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                          {trade.id}
                        </div>
                        <span className="text-white font-medium">Trade {trade.id}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          trade.outcome === 'win' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                        }`}>
                          {trade.outcome.toUpperCase()}
                        </span>
                      </div>
                      <div className={`font-semibold ${
                        trade.expectedReturn >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {trade.expectedReturn >= 0 ? '+' : ''}${trade.expectedReturn.toFixed(0)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">Risk</div>
                        <div className="text-white font-medium">{trade.risk.toFixed(2)}%</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Lot Size</div>
                        <div className="text-blue-400 font-medium">{trade.lotSize}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Timeframe</div>
                        <div className="text-white">{trade.timeframe}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Pairs</div>
                        <div className="text-white">{trade.pairs.join(', ')}</div>
                      </div>
                    </div>
                  </div>
                ))}
                {plan.trades.length > 20 && (
                  <div className="text-center text-gray-400 text-sm">
                    ... and {plan.trades.length - 20} more trades
                  </div>
                )}
              </div>
            </div>

            {/* Plan Timeline */}
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Personalized Trading Plan Timeline</h3>
              <div className="bg-gray-700/50 rounded-xl p-6">
                <h4 className="text-white font-medium mb-4">Your Custom Plan Results</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Estimated Timeline:</span>
                      <span className="text-white font-semibold">{plan.timeline.estimatedDays} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Trades Needed:</span>
                      <span className="text-white font-semibold">{plan.timeline.tradesNeeded}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avg Trades/Day:</span>
                      <span className="text-white font-semibold">{plan.timeline.avgTradesPerDay}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Starting Risk:</span>
                      <span className="text-white font-semibold">{riskConfig.riskPercentage}%</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Profit Target:</span>
                      <span className="text-blue-500 font-semibold">${plan.targets.totalTarget.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Expected Wins:</span>
                      <span className="text-green-400 font-semibold">{plan.targets.winningTrades}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Expected Losses:</span>
                      <span className="text-red-400 font-semibold">{plan.targets.losingTrades}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Final Win Rate:</span>
                      <span className="text-blue-500 font-semibold">{plan.targets.finalWinRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Management Protocol */}
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Dynamic Risk Management Protocol</h3>
              <div className="bg-blue-600/20 border border-blue-600 rounded-lg p-4 mb-4">
                <h4 className="text-blue-400 font-semibold mb-2">Adaptive Risk System</h4>
                <p className="text-gray-300 text-sm">
                  Your plan automatically adjusts risk based on performance. After {riskConfig.maxConsecutiveLosses || 3} consecutive losses, 
                  risk reduces by 20%. After wins, risk gradually increases up to your maximum of {params.maxRisk}%.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-white text-sm">Starting risk per trade: {riskConfig.riskPercentage}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-white text-sm">Risk-reward ratio: 1:{riskConfig.riskRewardRatio}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-white text-sm">Max consecutive losses: {riskConfig.maxConsecutiveLosses || 3}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-white text-sm">Daily loss limit: {rules.dailyLoss}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-white text-sm">Max drawdown: {rules.maxDrawdown}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-white text-sm">
                      {rules.consistencyRule ? `Consistency rule: ${rules.consistencyPercentage}%` : 'No consistency rule'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={downloadPlan}
                  className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Plan</span>
                </button>
                
                <button
                  onClick={handleContinue}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors shadow-lg"
                >
                  <span>Continue to Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={() => navigate('/setup/risk')}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Risk Config</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingPlanGenerator;