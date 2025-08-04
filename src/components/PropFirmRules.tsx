import React, { useState } from 'react';
import { Shield, AlertTriangle, Target, Clock, DollarSign, TrendingUp, TrendingDown, CheckCircle, XCircle, Info } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useTradingPlan } from '../contexts/TradingPlanContext';

const PropFirmRules: React.FC = () => {
  const { user } = useUser();
  const { propFirm, accountConfig } = useTradingPlan();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock prop firm data if not available from context
  const mockPropFirm = {
    name: 'FTMO',
    logo: '🏆',
    rules: {
      dailyLoss: 5,
      maxDrawdown: 10,
      profitTarget: 10,
      minTradingDays: 10,
      maxPositionSize: 2,
      scalingTarget: 10
    }
  };

  const currentPropFirm = propFirm || mockPropFirm;
  const currentAccountSize = accountConfig?.size || 100000;

  const ruleCategories = [
    { id: 'all', label: 'All Rules', icon: <Shield className="w-4 h-4" /> },
    { id: 'risk', label: 'Risk Management', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'profit', label: 'Profit Targets', icon: <Target className="w-4 h-4" /> },
    { id: 'time', label: 'Time Limits', icon: <Clock className="w-4 h-4" /> },
    { id: 'trading', label: 'Trading Rules', icon: <TrendingUp className="w-4 h-4" /> }
  ];

  const rules = [
    {
      id: 'daily-loss',
      category: 'risk',
      title: 'Daily Loss Limit',
      description: 'Maximum loss allowed in a single trading day',
      value: `${currentPropFirm.rules.dailyLoss}%`,
      dollarValue: `$${(currentAccountSize * currentPropFirm.rules.dailyLoss / 100).toLocaleString()}`,
      status: 'safe',
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'text-red-400',
      bgColor: 'bg-red-600/20',
      borderColor: 'border-red-600',
      details: [
        'Calculated from your starting balance each day',
        'Resets at 5 PM EST daily',
        'Includes floating and realized losses',
        'Breaching this rule results in immediate account termination'
      ]
    },
    {
      id: 'max-drawdown',
      category: 'risk',
      title: 'Maximum Drawdown',
      description: 'Maximum total loss from the highest equity peak',
      value: `${currentPropFirm.rules.maxDrawdown}%`,
      dollarValue: `$${(currentAccountSize * currentPropFirm.rules.maxDrawdown / 100).toLocaleString()}`,
      status: 'safe',
      icon: <TrendingDown className="w-5 h-5" />,
      color: 'text-orange-400',
      bgColor: 'bg-orange-600/20',
      borderColor: 'border-orange-600',
      details: [
        'Calculated from the highest balance reached',
        'Includes both open and closed positions',
        'Trailing drawdown - moves with your highest balance',
        'Most common reason for account termination'
      ]
    },
    {
      id: 'profit-target',
      category: 'profit',
      title: 'Profit Target',
      description: 'Required profit to pass the challenge phase',
      value: `${currentPropFirm.rules.profitTarget}%`,
      dollarValue: `$${(currentAccountSize * currentPropFirm.rules.profitTarget / 100).toLocaleString()}`,
      status: 'pending',
      icon: <Target className="w-5 h-5" />,
      color: 'text-green-400',
      bgColor: 'bg-green-600/20',
      borderColor: 'border-green-600',
      details: [
        'Must be achieved through closed trades only',
        'Open positions do not count toward target',
        'Required to advance to next phase',
        'Can be achieved over multiple trading sessions'
      ]
    },
    {
      id: 'min-trading-days',
      category: 'time',
      title: 'Minimum Trading Days',
      description: 'Minimum number of days you must trade',
      value: `${currentPropFirm.rules.minTradingDays} days`,
      dollarValue: 'Required',
      status: 'pending',
      icon: <Clock className="w-5 h-5" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-600/20',
      borderColor: 'border-blue-600',
      details: [
        'Must have at least one trade per qualifying day',
        'Weekends and holidays do not count',
        'Can be non-consecutive days',
        'Required before requesting payout'
      ]
    },
    {
      id: 'max-position-size',
      category: 'trading',
      title: 'Maximum Position Size',
      description: 'Maximum lot size per single trade',
      value: `${currentPropFirm.rules.maxPositionSize}%`,
      dollarValue: `$${(currentAccountSize * currentPropFirm.rules.maxPositionSize / 100).toLocaleString()}`,
      status: 'safe',
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-purple-400',
      bgColor: 'bg-purple-600/20',
      borderColor: 'border-purple-600',
      details: [
        'Calculated as percentage of account balance',
        'Applies to individual trades, not total exposure',
        'Includes all open positions in the same instrument',
        'Violation results in immediate disqualification'
      ]
    },
    {
      id: 'scaling-target',
      category: 'profit',
      title: 'Scaling Target',
      description: 'Profit required to scale to larger account',
      value: `${currentPropFirm.rules.scalingTarget}%`,
      dollarValue: `$${(currentAccountSize * currentPropFirm.rules.scalingTarget / 100).toLocaleString()}`,
      status: 'future',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-600/20',
      borderColor: 'border-yellow-600',
      details: [
        'Achieved through consistent profitable trading',
        'Allows access to larger account sizes',
        'Requires maintaining all other rules',
        'Scaling typically increases account by 25-100%'
      ]
    }
  ];

  // Additional trading rules
  const tradingRules = [
    {
      title: 'Overnight Positions',
      description: 'Holding positions overnight',
      allowed: true,
      details: 'You can hold positions over weekends and holidays'
    },
    {
      title: 'News Trading',
      description: 'Trading during high-impact news events',
      allowed: false,
      details: 'Trading is prohibited 2 minutes before and after major news releases'
    },
    {
      title: 'Weekend Holding',
      description: 'Keeping positions open over weekends',
      allowed: true,
      details: 'Positions can be held over weekends, but monitor gap risk'
    },
    {
      title: 'Hedging',
      description: 'Opening opposite positions in the same instrument',
      allowed: true,
      details: 'Hedging is allowed but counts toward total position size'
    },
    {
      title: 'Expert Advisors (EAs)',
      description: 'Using automated trading systems',
      allowed: true,
      details: 'EAs are permitted but you remain responsible for all trades'
    },
    {
      title: 'Copy Trading',
      description: 'Copying trades from other traders',
      allowed: false,
      details: 'All trades must be your own analysis and decisions'
    }
  ];

  const filteredRules = selectedCategory === 'all' 
    ? rules 
    : rules.filter(rule => rule.category === selectedCategory);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'danger':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getCurrentProgress = (ruleId: string) => {
    // Mock current progress - in real app this would come from trading data
    const progress = {
      'daily-loss': { current: 1.2, percentage: 24 },
      'max-drawdown': { current: 2.1, percentage: 21 },
      'profit-target': { current: 6.8, percentage: 68 },
      'min-trading-days': { current: 7, percentage: 70 },
      'max-position-size': { current: 0.8, percentage: 40 },
      'scaling-target': { current: 6.8, percentage: 68 }
    };
    return progress[ruleId as keyof typeof progress] || { current: 0, percentage: 0 };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">{currentPropFirm.logo}</div>
            <div>
              <h2 className="text-2xl font-bold text-white">{currentPropFirm.name} Rules</h2>
              <p className="text-gray-400">
                Account Size: ${currentAccountSize.toLocaleString()} • 
                Challenge Type: {accountConfig?.challengeType || '2-step'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Compliance Status</div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-semibold">All Rules Compliant</span>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {ruleCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {category.icon}
              <span className="text-sm font-medium">{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRules.map(rule => {
          const progress = getCurrentProgress(rule.id);
          return (
            <div key={rule.id} className={`bg-gray-800 rounded-xl border ${rule.borderColor} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${rule.bgColor}`}>
                    <div className={rule.color}>
                      {rule.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{rule.title}</h3>
                    <p className="text-sm text-gray-400">{rule.description}</p>
                  </div>
                </div>
                {getStatusIcon(rule.status)}
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-2xl font-bold text-white">{rule.value}</span>
                  <span className="text-lg font-semibold text-gray-300">{rule.dollarValue}</span>
                </div>
                
                {rule.category === 'risk' || rule.category === 'profit' ? (
                  <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>Current: {progress.current}%</span>
                      <span>{progress.percentage}% of limit</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          progress.percentage > 80 ? 'bg-red-500' :
                          progress.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ) : rule.id === 'min-trading-days' ? (
                  <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>Completed: {progress.current} days</span>
                      <span>{progress.percentage}% complete</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-300">Key Details:</h4>
                <ul className="space-y-1">
                  {rule.details.map((detail, index) => (
                    <li key={index} className="text-xs text-gray-400 flex items-start space-x-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trading Rules */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Trading Restrictions & Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tradingRules.map((rule, index) => (
            <div key={index} className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium">{rule.title}</h4>
                <div className="flex items-center space-x-2">
                  {rule.allowed ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-sm font-medium ${
                    rule.allowed ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {rule.allowed ? 'Allowed' : 'Prohibited'}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-2">{rule.description}</p>
              <p className="text-xs text-gray-500">{rule.details}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Management Tips */}
      <div className="bg-blue-600/20 border border-blue-600 rounded-xl p-6">
        <div className="flex items-center space-x-2 text-blue-400 mb-4">
          <Info className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Risk Management Tips</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-white font-medium">Daily Loss Management</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Never risk more than 1-2% per trade</li>
              <li>• Set daily loss limits at 3-4% maximum</li>
              <li>• Stop trading after 2-3 consecutive losses</li>
              <li>• Use proper position sizing always</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-medium">Drawdown Protection</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Monitor your highest balance daily</li>
              <li>• Reduce position sizes as you approach limits</li>
              <li>• Use trailing stops to protect profits</li>
              <li>• Never add to losing positions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropFirmRules;