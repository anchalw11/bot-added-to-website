import React, { useState, useEffect } from 'react';
import { Building, TrendingUp, TrendingDown, DollarSign, Target, AlertTriangle, Plus, Settings, Eye } from 'lucide-react';

interface PropFirmAccount {
  id: string;
  propFirm: string;
  accountSize: number;
  currentBalance: number;
  phase: 'Challenge' | 'Verification' | 'Funded';
  profitTarget: number;
  currentProfit: number;
  dailyLoss: number;
  maxDrawdown: number;
  currentDrawdown: number;
  tradingDays: number;
  minTradingDays: number;
  status: 'active' | 'passed' | 'failed' | 'pending';
  lastUpdate: Date;
}

const MultiAccountTracker: React.FC = () => {
  const [accounts, setAccounts] = useState<PropFirmAccount[]>([
    {
      id: '1',
      propFirm: 'FTMO',
      accountSize: 100000,
      currentBalance: 108500,
      phase: 'Challenge',
      profitTarget: 10000,
      currentProfit: 8500,
      dailyLoss: 5000,
      maxDrawdown: 10000,
      currentDrawdown: 1200,
      tradingDays: 8,
      minTradingDays: 10,
      status: 'active',
      lastUpdate: new Date()
    },
    {
      id: '2',
      propFirm: 'MyForexFunds',
      accountSize: 200000,
      currentBalance: 215600,
      phase: 'Funded',
      profitTarget: 16000,
      currentProfit: 15600,
      dailyLoss: 10000,
      maxDrawdown: 24000,
      currentDrawdown: 800,
      tradingDays: 25,
      minTradingDays: 5,
      status: 'passed',
      lastUpdate: new Date()
    },
    {
      id: '3',
      propFirm: 'The5%ers',
      accountSize: 50000,
      currentBalance: 52800,
      phase: 'Verification',
      profitTarget: 3000,
      currentProfit: 2800,
      dailyLoss: 2500,
      maxDrawdown: 2000,
      currentDrawdown: 300,
      tradingDays: 12,
      minTradingDays: 6,
      status: 'active',
      lastUpdate: new Date()
    }
  ]);

  const [showAddAccount, setShowAddAccount] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-blue-400 bg-blue-600/20';
      case 'passed': return 'text-green-400 bg-green-600/20';
      case 'failed': return 'text-red-400 bg-red-600/20';
      case 'pending': return 'text-yellow-400 bg-yellow-600/20';
      default: return 'text-gray-400 bg-gray-600/20';
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'Challenge': return 'text-orange-400 bg-orange-600/20';
      case 'Verification': return 'text-blue-400 bg-blue-600/20';
      case 'Funded': return 'text-green-400 bg-green-600/20';
      default: return 'text-gray-400 bg-gray-600/20';
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const totalAccountValue = accounts.reduce((sum, account) => sum + account.currentBalance, 0);
  const totalProfit = accounts.reduce((sum, account) => sum + account.currentProfit, 0);
  const activeAccounts = accounts.filter(account => account.status === 'active').length;
  const fundedAccounts = accounts.filter(account => account.phase === 'Funded').length;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-blue-400">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">${totalAccountValue.toLocaleString()}</div>
          <div className="text-sm text-gray-400">Total Account Value</div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-green-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">${totalProfit.toLocaleString()}</div>
          <div className="text-sm text-gray-400">Total Profit</div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-purple-400">
              <Building className="w-6 h-6" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{activeAccounts}</div>
          <div className="text-sm text-gray-400">Active Accounts</div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-yellow-400">
              <Target className="w-6 h-6" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{fundedAccounts}</div>
          <div className="text-sm text-gray-400">Funded Accounts</div>
        </div>
      </div>

      {/* Accounts List */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Account Overview</h3>
            <p className="text-gray-400">Monitor all your prop firm accounts in one place</p>
          </div>
          <button
            onClick={() => setShowAddAccount(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Account</span>
          </button>
        </div>

        <div className="space-y-4">
          {accounts.map((account) => (
            <div key={account.id} className="bg-gray-700/50 rounded-xl p-6 border border-gray-600">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">{account.propFirm}</h4>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPhaseColor(account.phase)}`}>
                        {account.phase}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(account.status)}`}>
                        {account.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">${account.currentBalance.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">${account.accountSize.toLocaleString()} Account</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profit Progress */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Profit Target</span>
                    <span className="text-white text-sm">
                      ${account.currentProfit.toLocaleString()} / ${account.profitTarget.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${calculateProgress(account.currentProfit, account.profitTarget)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400">
                    {calculateProgress(account.currentProfit, account.profitTarget).toFixed(1)}% Complete
                  </div>
                </div>

                {/* Drawdown Monitor */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Drawdown</span>
                    <span className="text-white text-sm">
                      ${account.currentDrawdown.toLocaleString()} / ${account.maxDrawdown.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        (account.currentDrawdown / account.maxDrawdown) > 0.8 ? 'bg-red-500' :
                        (account.currentDrawdown / account.maxDrawdown) > 0.6 ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${calculateProgress(account.currentDrawdown, account.maxDrawdown)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400">
                    {calculateProgress(account.currentDrawdown, account.maxDrawdown).toFixed(1)}% Used
                  </div>
                </div>

                {/* Trading Days */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Trading Days</span>
                    <span className="text-white text-sm">
                      {account.tradingDays} / {account.minTradingDays}
                    </span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${calculateProgress(account.tradingDays, account.minTradingDays)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400">
                    {account.tradingDays >= account.minTradingDays ? 'Requirement Met' : 
                     `${account.minTradingDays - account.tradingDays} days remaining`}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-600">
                <div className="text-xs text-gray-400">
                  Last updated: {account.lastUpdate.toLocaleString()}
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-blue-400 hover:text-blue-300 transition-colors p-2">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="text-gray-400 hover:text-gray-300 transition-colors p-2">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Alerts */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">Risk Alerts</h3>
        </div>
        
        <div className="space-y-3">
          {accounts.filter(account => 
            (account.currentDrawdown / account.maxDrawdown) > 0.7 ||
            (account.currentProfit / account.profitTarget) > 0.9
          ).map(account => (
            <div key={`alert-${account.id}`} className="bg-yellow-600/20 border border-yellow-600 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-yellow-400 font-medium">{account.propFirm}</span>
                  <p className="text-gray-300 text-sm">
                    {(account.currentDrawdown / account.maxDrawdown) > 0.7 && 
                      `High drawdown: ${((account.currentDrawdown / account.maxDrawdown) * 100).toFixed(1)}%`}
                    {(account.currentProfit / account.profitTarget) > 0.9 && 
                      `Near profit target: ${((account.currentProfit / account.profitTarget) * 100).toFixed(1)}%`}
                  </p>
                </div>
                <button className="text-yellow-400 hover:text-yellow-300 text-sm">
                  View Details
                </button>
              </div>
            </div>
          ))}
          
          {accounts.filter(account => 
            (account.currentDrawdown / account.maxDrawdown) > 0.7 ||
            (account.currentProfit / account.profitTarget) > 0.9
          ).length === 0 && (
            <div className="text-center py-4 text-gray-400">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">All accounts are within safe parameters</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Account Modal */}
      {showAddAccount && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-semibold text-white">Add New Account</h4>
              <button
                onClick={() => setShowAddAccount(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Prop Firm</label>
                <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500">
                  <option>FTMO</option>
                  <option>MyForexFunds</option>
                  <option>The5%ers</option>
                  <option>FundingPips</option>
                  <option>QuantTekel</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Account Size</label>
                <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500">
                  <option>$10,000</option>
                  <option>$25,000</option>
                  <option>$50,000</option>
                  <option>$100,000</option>
                  <option>$200,000</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Current Phase</label>
                <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500">
                  <option>Challenge</option>
                  <option>Verification</option>
                  <option>Funded</option>
                </select>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowAddAccount(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowAddAccount(false)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors"
                >
                  Add Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiAccountTracker;