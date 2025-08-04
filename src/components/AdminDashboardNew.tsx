import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Target, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  LogOut,
  Activity,
  BarChart3,
  Zap,
  Globe,
  Bot,
  Cpu,
  Database,
  Server
} from 'lucide-react';
import { useSignalDistribution } from './SignalDistributionService';
import { notificationService } from '../services/notificationService';
import ChartAnalysis from './ChartAnalysis';
import AutomatedSignals from './AutomatedSignals';
import SettingsModal from './SettingsModal';
import { Settings } from 'lucide-react';
import FuturisticBackground from './FuturisticBackground';
import FuturisticCursor from './FuturisticCursor';
import CryptoSignalGenerator from './CryptoSignalGenerator';
import ForexSignalGenerator from './ForexSignalGenerator';

interface User {
  id: string;
  name: string;
  email: string;
  membershipTier: string;
  accountSize: number;
  riskPercentage: number;
  riskRewardRatio: number;
  propFirm: string;
  isActive: boolean;
}

interface Signal {
  id: string;
  pair: string;
  direction: 'BUY' | 'SELL';
  entry: string;
  stopLoss: string;
  takeProfit: string[];
  confidence: number;
  analysis: string;
  ictConcepts: string[];
  timestamp: Date;
  sentToUsers: number;
  status: 'draft' | 'sent' | 'active' | 'closed';
}

interface Screenshot {
  id: string;
  user: string;
  email: string;
  propFirm: string;
  filePath: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Check admin authentication
  // useEffect(() => {
  //   const isAuthenticated = localStorage.getItem('admin_authenticated');
  //   if (!isAuthenticated) {
  //     navigate('/admin');
  //   }
  // }, [navigate]);

  const { distributeSignal } = useSignalDistribution();
  const [activeUsers, setActiveUsers] = useState<User[]>([]);

  const [signals, setSignals] = useState<Signal[]>([]);
  const [newSignal, setNewSignal] = useState({
    pair: 'EURUSD',
    direction: 'BUY' as 'BUY' | 'SELL',
    entry: '',
    stopLoss: '',
    takeProfit: '',
    confidence: 90,
    analysis: '',
    ictConcepts: [] as string[],
    timeframe: '15m'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [lastSignalSent, setLastSignalSent] = useState<Date | null>(null);
  const [deletingSignalId, setDeletingSignalId] = useState<string | null>(null);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);

  // Load real users from localStorage and user context
  useEffect(() => {
    const loadRealUsers = () => {
      const realUsers: User[] = [];
      
      // Get current logged-in user if exists
      const currentUserData = localStorage.getItem('user_data');
      if (currentUserData) {
        const userData = JSON.parse(currentUserData);
        realUsers.push({
          id: userData.id || '1',
          name: userData.name || 'Current User',
          email: userData.email || 'user@example.com',
          membershipTier: userData.membershipTier || 'Professional',
          accountSize: 100000, // Default account size
          riskPercentage: 1, // Default risk percentage
          riskRewardRatio: 2, // Default risk-reward ratio
          propFirm: 'FTMO', // Default prop firm
          isActive: true
        });
      }
      
      // Get users who have taken trades
      const takenTrades = JSON.parse(localStorage.getItem('taken_trades') || '[]');
      const userSettings = JSON.parse(localStorage.getItem('user_settings') || '{}');
      
      // Create users based on taken trades if we don't have current user
      if (takenTrades.length > 0 && realUsers.length === 0) {
        // Group trades by user (using email or create unique users)
        const tradeUsers = new Set();
        takenTrades.forEach((trade: any) => {
          if (trade.userEmail) {
            tradeUsers.add(trade.userEmail);
          }
        });
        
        Array.from(tradeUsers).forEach((email: any, index) => {
          realUsers.push({
            id: `trader_${index + 1}`,
            name: `Trader ${index + 1}`,
            email: email,
            membershipTier: 'Professional',
            accountSize: 100000,
            riskPercentage: userSettings.trading?.defaultRiskPercentage || 1,
            riskRewardRatio: userSettings.trading?.defaultRiskRewardRatio || 2,
            propFirm: 'FTMO',
            isActive: true
          });
        });
      }
      
      // If still no users, check for any registered users
      const registeredUsers = localStorage.getItem('registered_users');
      if (registeredUsers && realUsers.length === 0) {
        const users = JSON.parse(registeredUsers);
        users.forEach((user: any, index: number) => {
          realUsers.push({
            id: user.id || `user_${index + 1}`,
            name: user.name || `User ${index + 1}`,
            email: user.email,
            membershipTier: user.membershipTier || 'Professional',
            accountSize: user.accountSize || 100000,
            riskPercentage: user.riskPercentage || 1,
            riskRewardRatio: user.riskRewardRatio || 2,
            propFirm: user.propFirm || 'FTMO',
            isActive: true
          });
        });
      }
      
      // If no real users exist, show message instead of dummy data
      setActiveUsers(realUsers);
    };

    loadRealUsers();
    
    // Listen for new user registrations or trade activities
    const handleUserActivity = () => {
      loadRealUsers();
    };
    
    window.addEventListener('userRegistered', handleUserActivity);
    window.addEventListener('tradesUpdated', handleUserActivity);
    
    // Refresh every 30 seconds to check for new users
    const interval = setInterval(loadRealUsers, 30000);
    
    return () => {
      window.removeEventListener('userRegistered', handleUserActivity);
      window.removeEventListener('tradesUpdated', handleUserActivity);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const fetchScreenshots = async () => {
      try {
        // In a real app, you'd fetch this from your API
        // For now, we'll use mock data and localStorage
        const storedScreenshots = JSON.parse(localStorage.getItem('screenshots') || '[]');
        if (storedScreenshots.length === 0) {
          // Add some mock data if none exists
          const mockScreenshots: Screenshot[] = [
            { id: '1', user: 'John Doe', email: 'john.doe@example.com', propFirm: 'FTMO', filePath: '/uploads/mock1.jpg', status: 'pending' },
            { id: '2', user: 'Jane Smith', email: 'jane.smith@example.com', propFirm: 'FundingPips', filePath: '/uploads/mock2.jpg', status: 'pending' },
          ];
          localStorage.setItem('screenshots', JSON.stringify(mockScreenshots));
          setScreenshots(mockScreenshots);
        } else {
          setScreenshots(storedScreenshots);
        }
      } catch (error) {
        console.error('Error fetching screenshots:', error);
      }
    };

    fetchScreenshots();
  }, []);

  const handleScreenshotApproval = (screenshotId: string, newStatus: 'approved' | 'rejected') => {
    setScreenshots(prev =>
      prev.map(ss =>
        ss.id === screenshotId ? { ...ss, status: newStatus } : ss
      )
    );
    // Here you would also update the backend/database
    const updatedScreenshots = screenshots.map(ss =>
      ss.id === screenshotId ? { ...ss, status: newStatus } : ss
    );
    localStorage.setItem('screenshots', JSON.stringify(updatedScreenshots));

    if (newStatus === 'approved') {
      const screenshot = screenshots.find(ss => ss.id === screenshotId);
      if (screenshot) {
        // Grant user access logic here
        console.log(`User ${screenshot.email} has been approved for Kickstarter plan.`);
        // Example: Update user's membershipTier in localStorage
        const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
        const updatedUsers = users.map((user: any) => 
          user.email === screenshot.email ? { ...user, membershipTier: 'Kickstarter' } : user
        );
        localStorage.setItem('registered_users', JSON.stringify(updatedUsers));
        window.dispatchEvent(new CustomEvent('userRegistered')); // Refresh user list
      }
    }
  };

  const currencyPairs = [
    'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 
    'USDCAD', 'NZDUSD', 'EURJPY', 'GBPJPY', 'XAUUSD', 
    'XAGUSD', 'BTCUSD', 'ETHUSD'
  ];

  const ictConceptOptions = [
    'Fair Value Gap', 'Order Block', 'Liquidity Sweep', 'Change of Character',
    'Premium Array', 'Discount Array', 'Market Structure', 'Institutional Orderflow',
    'Golden Zone', 'Mitigation', 'Bearish Order Block', 'Bullish FVG'
  ];

  // Calculate position sizes for each user based on their risk management
  const calculateUserPositions = (signal: any) => {
    return activeUsers.map(user => {
      const riskAmount = user.accountSize * (user.riskPercentage / 100);
      const entryPrice = parseFloat(signal.entry);
      const stopLossPrice = parseFloat(signal.stopLoss);
      const pipValue = signal.pair.includes('JPY') ? 0.01 : 0.0001;
      const pipsAtRisk = Math.abs(entryPrice - stopLossPrice) / pipValue;
      const dollarPerPip = 1; // Simplified
      const positionSize = pipsAtRisk > 0 ? (riskAmount / (pipsAtRisk * dollarPerPip)).toFixed(2) : '0.00';
      
      return {
        ...user,
        positionSize,
        riskAmount,
        pipsAtRisk: Math.round(pipsAtRisk)
      };
    });
  };

  const sendSignal = async () => {
    if (!newSignal.entry || !newSignal.stopLoss || !newSignal.takeProfit) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      // Create signal object
      const signal: Signal = {
        id: Date.now().toString(),
        pair: newSignal.pair,
        direction: newSignal.direction,
        entry: newSignal.entry,
        stopLoss: newSignal.stopLoss,
        takeProfit: newSignal.takeProfit.split(',').map(tp => tp.trim()),
        confidence: newSignal.confidence,
        analysis: newSignal.analysis,
        ictConcepts: newSignal.ictConcepts,
        timestamp: new Date(),
        sentToUsers: activeUsers.filter(u => u.isActive).length,
        status: 'sent'
      };

      // Store signal in localStorage for demo
      const existingSignals = JSON.parse(localStorage.getItem('admin_signals') || '[]');
      const newSignalData = {
        ...signal,
        timestamp: signal.timestamp.toISOString()
      };
      existingSignals.unshift(newSignalData);
      localStorage.setItem('admin_signals', JSON.stringify(existingSignals));
      
      // Store in a format that SignalsCenter can read
      const signalForUser = {
        id: parseInt(signal.id),
        text: `${newSignal.pair}\n${newSignal.direction} NOW\nEntry ${newSignal.entry}\nStop Loss ${newSignal.stopLoss}\nTake Profit ${newSignal.takeProfit}\nConfidence ${newSignal.confidence}%\n\n${newSignal.analysis}`,
        timestamp: signal.timestamp.toISOString(),
        from: 'Signal Master',
        chat_id: 1,
        message_id: parseInt(signal.id),
        update_id: parseInt(signal.id)
      };
      
      const existingMessages = JSON.parse(localStorage.getItem('telegram_messages') || '[]');
      existingMessages.unshift(signalForUser);
      localStorage.setItem('telegram_messages', JSON.stringify(existingMessages));

      // Add to signals history
      setSignals(prev => [signal, ...prev]);
      setLastSignalSent(new Date());

      // Reset form
      setNewSignal({
        pair: 'EURUSD',
        direction: 'BUY',
        entry: '',
        stopLoss: '',
        takeProfit: '',
        confidence: 90,
        analysis: '',
        ictConcepts: [],
        timeframe: '15m'
      });

      // Show success message
      alert(`✅ Signal sent successfully to ${activeUsers.filter(u => u.isActive).length} users!`);
      
      // Dispatch custom event to notify user dashboard
      window.dispatchEvent(new CustomEvent('newSignalSent', { 
        detail: newSignalData 
      }));

      // Send notifications to all active users
      const activeUserEmails = activeUsers
        .filter(u => u.isActive)
        .map(u => u.email);
      
      for (const email of activeUserEmails) {
        await notificationService.notifyNewSignal(signal, email);
      }
      
      console.log(`📧 Notifications sent to ${activeUserEmails.length} users`);
      
    } catch (error) {
      console.error('Error sending signal:', error);
      alert('❌ Failed to send signal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSignal = async (signalId: string) => {
    if (!confirm('Are you sure you want to delete this signal? This action cannot be undone.')) {
      return;
    }

    setDeletingSignalId(signalId);

    try {
      // Remove from admin signals
      const existingSignals = JSON.parse(localStorage.getItem('admin_signals') || '[]');
      const updatedSignals = existingSignals.filter((signal: any) => signal.id !== signalId);
      localStorage.setItem('admin_signals', JSON.stringify(updatedSignals));
      
      // Remove from telegram messages (user-facing signals)
      const existingMessages = JSON.parse(localStorage.getItem('telegram_messages') || '[]');
      const updatedMessages = existingMessages.filter((message: any) => message.id.toString() !== signalId);
      localStorage.setItem('telegram_messages', JSON.stringify(updatedMessages));
      
      // Remove from taken trades if any user took this signal
      const existingTrades = JSON.parse(localStorage.getItem('taken_trades') || '[]');
      const updatedTrades = existingTrades.filter((trade: any) => 
        trade.signal_id?.toString() !== signalId && trade.id?.toString() !== signalId
      );
      localStorage.setItem('taken_trades', JSON.stringify(updatedTrades));

      // Update local state
      setSignals(prev => prev.filter(signal => signal.id !== signalId));

      // Notify user dashboard to refresh
      window.dispatchEvent(new CustomEvent('signalDeleted', { 
        detail: { signalId } 
      }));
      window.dispatchEvent(new CustomEvent('tradesUpdated'));

      console.log(`✅ Signal ${signalId} deleted successfully`);
      
    } catch (error) {
      console.error('Error deleting signal:', error);
      alert('❌ Failed to delete signal. Please try again.');
    } finally {
      setDeletingSignalId(null);
    }
  };

  const toggleConcept = (concept: string) => {
    setNewSignal(prev => ({
      ...prev,
      ictConcepts: prev.ictConcepts.includes(concept)
        ? prev.ictConcepts.filter(c => c !== concept)
        : [...prev.ictConcepts, concept]
    }));
  };

  const stats = [
    {
      label: 'Active Users',
      value: activeUsers.filter(u => u.isActive).length.toString(),
      icon: <Users className="w-5 h-5" />,
      color: 'text-cyan-300',
      bgColor: 'bg-cyan-500/20'
    },
    {
      label: 'Signals Sent Today',
      value: signals.filter(s => 
        s.timestamp.toDateString() === new Date().toDateString()
      ).length.toString(),
      icon: <Zap className="w-5 h-5" />,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      label: 'Total Managed Capital',
      value: `$${activeUsers.reduce((sum, user) => sum + user.accountSize, 0).toLocaleString()}`,
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    },
    {
      label: 'Last Signal',
      value: lastSignalSent ? lastSignalSent.toLocaleTimeString() : 'None',
      icon: <Clock className="w-5 h-5" />,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20'
    }
  ];

  const aiCoreStats = [
    {
      label: 'AI Signal Generator',
      value: 'Online',
      icon: <Bot className="w-5 h-5 text-green-400" />,
      statusColor: 'text-green-400'
    },
    {
      label: 'Market Analysis Engine',
      value: 'Active',
      icon: <Cpu className="w-5 h-5 text-cyan-400" />,
      statusColor: 'text-cyan-400'
    },
    {
      label: 'User Database',
      value: 'Connected',
      icon: <Database className="w-5 h-5 text-purple-400" />,
      statusColor: 'text-purple-400'
    },
    {
      label: 'Signal Distribution Node',
      value: 'Operational',
      icon: <Server className="w-5 h-5 text-yellow-400" />,
      statusColor: 'text-yellow-400'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono relative overflow-hidden">
      <FuturisticBackground />
      <FuturisticCursor />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-black/50 backdrop-blur-sm border-b border-cyan-500/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-cyan-400 animate-pulse" />
                <h1 className="text-2xl font-bold text-white tracking-wider">A.I. Signal Command</h1>
              </div>
              <div className="flex items-center space-x-2 bg-red-600/30 border border-red-500/50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
                <span className="text-sm text-red-300">Admin Override</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center space-x-2 bg-gray-800/50 border border-gray-700 hover:bg-gray-700/70 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,255,255,0.5)]"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 bg-gray-800/50 border border-gray-700 hover:bg-gray-700/70 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,0,0,0.5)]"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

        <div className="p-6">
          <div className="flex border-b border-cyan-500/30 mb-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-2 px-4 text-lg font-medium transition-all duration-300 ${activeTab === 'dashboard' ? 'text-cyan-300 border-b-2 border-cyan-300' : 'text-gray-400 hover:text-white'}`}
            >
              Mainframe
            </button>
            <button
              onClick={() => setActiveTab('automated-signals')}
              className={`py-2 px-4 text-lg font-medium transition-all duration-300 ${activeTab === 'automated-signals' ? 'text-cyan-300 border-b-2 border-cyan-300' : 'text-gray-400 hover:text-white'}`}
            >
              Signal Matrix
            </button>
            <button
              onClick={() => setActiveTab('crypto-generator')}
              className={`py-2 px-4 text-lg font-medium transition-all duration-300 ${activeTab === 'crypto-generator' ? 'text-cyan-300 border-b-2 border-cyan-300' : 'text-gray-400 hover:text-white'}`}
            >
              🪙 Crypto Generator
            </button>
            <button
              onClick={() => setActiveTab('forex-generator')}
              className={`py-2 px-4 text-lg font-medium transition-all duration-300 ${activeTab === 'forex-generator' ? 'text-cyan-300 border-b-2 border-cyan-300' : 'text-gray-400 hover:text-white'}`}
            >
              💱 Forex Generator
            </button>
            <button
              onClick={() => setActiveTab('affiliate-screenshots')}
              className={`py-2 px-4 text-lg font-medium transition-all duration-300 ${activeTab === 'affiliate-screenshots' ? 'text-cyan-300 border-b-2 border-cyan-300' : 'text-gray-400 hover:text-white'}`}
            >
              User Verification
            </button>
          </div>

        {activeTab === 'dashboard' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-cyan-500/30 p-6 transition-all duration-300 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <div className={stat.color}>
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400 tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Signal Creation Form */}
              <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-cyan-500/30 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Send className="w-6 h-6 text-cyan-400" />
                  <h3 className="text-xl font-semibold text-white tracking-wider">Manual Signal Override</h3>
                </div>

                <div className="space-y-6">
                  {/* Basic Signal Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Target Asset</label>
                      <select
                        value={newSignal.pair}
                        onChange={(e) => setNewSignal(prev => ({ ...prev, pair: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                      >
                        {currencyPairs.map(pair => (
                          <option key={pair} value={pair}>{pair}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Vector</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setNewSignal(prev => ({ ...prev, direction: 'BUY' }))}
                          className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                            newSignal.direction === 'BUY'
                              ? 'bg-green-600/80 text-white shadow-[0_0_10px_rgba(0,255,0,0.5)]'
                              : 'bg-gray-800/70 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          <TrendingUp className="w-4 h-4 inline mr-2" />
                          LONG
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewSignal(prev => ({ ...prev, direction: 'SELL' }))}
                          className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                            newSignal.direction === 'SELL'
                              ? 'bg-red-600/80 text-white shadow-[0_0_10px_rgba(255,0,0,0.5)]'
                              : 'bg-gray-800/70 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          <TrendingDown className="w-4 h-4 inline mr-2" />
                          SHORT
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Price Levels */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Entry Point</label>
                      <input
                        type="number"
                        step="0.00001"
                        value={newSignal.entry}
                        onChange={(e) => setNewSignal(prev => ({ ...prev, entry: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                        placeholder="1.08500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Stop Loss</label>
                      <input
                        type="number"
                        step="0.00001"
                        value={newSignal.stopLoss}
                        onChange={(e) => setNewSignal(prev => ({ ...prev, stopLoss: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                        placeholder="1.08300"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Take Profit Targets</label>
                      <input
                        type="text"
                        value={newSignal.takeProfit}
                        onChange={(e) => setNewSignal(prev => ({ ...prev, takeProfit: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                        placeholder="1.087, 1.089, 1.091"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Risk Delta</label>
                      <div className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 flex items-center justify-center">
                        <span className="font-semibold">
                          {newSignal.entry && newSignal.stopLoss ? 
                            (() => {
                              const entryPrice = parseFloat(newSignal.entry);
                              const stopLossPrice = parseFloat(newSignal.stopLoss);
                              const pipValue = newSignal.pair.includes('JPY') ? 0.01 : 0.0001;
                              const pips = Math.abs(entryPrice - stopLossPrice) / pipValue;
                              return Math.round(pips);
                            })() + ' pips'
                            : '-- pips'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Confidence and Analysis */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confidence Matrix: {newSignal.confidence}%
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={newSignal.confidence}
                      onChange={(e) => setNewSignal(prev => ({ ...prev, confidence: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-thumb"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tactical Analysis</label>
                    <textarea
                      value={newSignal.analysis}
                      onChange={(e) => setNewSignal(prev => ({ ...prev, analysis: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                      rows={3}
                      placeholder="AI-assisted market analysis and strategic rationale..."
                    />
                  </div>

                  {/* ICT Concepts */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Heuristic Concepts</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {ictConceptOptions.map(concept => (
                        <button
                          key={concept}
                          type="button"
                          onClick={() => toggleConcept(concept)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 border ${
                            newSignal.ictConcepts.includes(concept)
                              ? 'bg-cyan-600/80 text-white border-cyan-500 shadow-[0_0_10px_rgba(0,255,255,0.5)]'
                              : 'bg-gray-800/70 text-gray-300 border-gray-700 hover:bg-gray-700 hover:border-gray-500'
                          }`}
                        >
                          {concept}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={sendSignal}
                    disabled={isLoading || !newSignal.entry || !newSignal.stopLoss || !newSignal.takeProfit}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800/50 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_25px_rgba(0,255,255,0.6)]"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Transmitting Signal...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Broadcast to {activeUsers.filter(u => u.isActive).length} Agents</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Side Panels */}
              <div className="space-y-6">
                {/* AI Core Status */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-cyan-500/30 p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 tracking-wider">AI Core Status</h4>
                  <div className="space-y-3">
                    {aiCoreStats.map((stat, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {stat.icon}
                          <span className="text-gray-300">{stat.label}</span>
                        </div>
                        <span className={`${stat.statusColor} font-semibold`}>{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Position Size Preview */}
                {newSignal.entry && newSignal.stopLoss && (
                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-cyan-500/30 p-6">
                    <h4 className="text-lg font-semibold text-white mb-4 tracking-wider">Position Size Preview</h4>
                    <div className="space-y-3">
                      {calculateUserPositions(newSignal).slice(0, 3).map(user => (
                        <div key={user.id} className="bg-gray-800/50 rounded-lg p-3 border border-transparent hover:border-cyan-500/50 transition-all">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-white font-medium">{user.name}</span>
                            <span className="text-cyan-400 font-semibold">{user.positionSize} lots</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            Risk: ${user.riskAmount.toFixed(0)} ({user.riskPercentage}%) • {user.pipsAtRisk} pips
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Users */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-cyan-500/30 p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 tracking-wider">Active Agents ({activeUsers.filter(u => u.isActive).length})</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto futuristic-scrollbar">
                    {activeUsers.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="w-10 h-10 mx-auto mb-3 text-gray-600" />
                        <div className="text-gray-400 text-sm mb-2">No agents online</div>
                        <div className="text-xs text-gray-500">
                          Awaiting user connections...
                        </div>
                      </div>
                    ) : (
                      activeUsers.filter(u => u.isActive).map(user => (
                        <div key={user.id} className="bg-gray-800/50 rounded-lg p-3 border border-transparent hover:border-cyan-500/50 transition-all">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-white font-medium">{user.name}</span>
                            <span className="text-green-400 text-xs flex items-center">
                              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                              Online
                            </span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {user.membershipTier} • ${user.accountSize.toLocaleString()} • {user.riskPercentage}% risk
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Recent Signals */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-cyan-500/30 p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 tracking-wider">Signal History ({signals.length})</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto futuristic-scrollbar">
                    {signals.length === 0 ? (
                      <div className="text-center py-4 text-gray-400">
                        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No signal history</p>
                      </div>
                    ) : (
                      signals.slice(0, 5).map(signal => (
                        <div key={signal.id} className="bg-gray-800/50 rounded-lg p-3 group border border-transparent hover:border-cyan-500/50 transition-all">
                          <div className="flex justify-between items-center mb-2 relative">
                            <span className="text-white font-medium">{signal.pair}</span>
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs px-2 py-1 rounded ${
                                signal.direction === 'BUY' ? 'bg-green-600/30 text-green-300' : 'bg-red-600/30 text-red-300'
                              }`}>
                                {signal.direction}
                              </span>
                              <button
                                onClick={() => deleteSignal(signal.id)}
                                disabled={deletingSignalId === signal.id}
                                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all p-1 rounded hover:bg-red-600/20 disabled:opacity-50"
                                title="Delete signal"
                              >
                                {deletingSignalId === signal.id ? (
                                  <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400">
                            Sent to {signal.sentToUsers} agents • {signal.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        {activeTab === 'automated-signals' && (
          <>
            <ChartAnalysis />
            <AutomatedSignals />
          </>
        )}
        {activeTab === 'crypto-generator' && (
          <CryptoSignalGenerator />
        )}
        {activeTab === 'forex-generator' && (
          <ForexSignalGenerator />
        )}
        {activeTab === 'affiliate-screenshots' && (
          <div className="text-white">
            <h2 className="text-2xl font-bold mb-4 tracking-wider">User Verification Queue ({screenshots.filter(s => s.status === 'pending').length} pending)</h2>
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-cyan-500/30">
              <div className="grid grid-cols-5 gap-4 p-4 font-semibold border-b border-cyan-500/30">
                <div>Agent ID</div>
                <div>Prop Firm</div>
                <div>Data Packet</div>
                <div>Status</div>
                <div>Actions</div>
              </div>
              {screenshots.map(screenshot => (
                <div key={screenshot.id} className="grid grid-cols-5 gap-4 p-4 items-center border-b border-cyan-500/30 last:border-b-0">
                  <div>
                    <div className="font-medium">{screenshot.user}</div>
                    <div className="text-sm text-gray-400">{screenshot.email}</div>
                  </div>
                  <div>{screenshot.propFirm}</div>
                  <div>
                    <a href={screenshot.filePath} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                      View Dossier
                    </a>
                  </div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      screenshot.status === 'pending' ? 'bg-yellow-600/30 text-yellow-300' :
                      screenshot.status === 'approved' ? 'bg-green-600/30 text-green-300' :
                      'bg-red-600/30 text-red-300'
                    }`}>
                      {screenshot.status}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleScreenshotApproval(screenshot.id, 'approved')}
                      disabled={screenshot.status !== 'pending'}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm transition-all"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleScreenshotApproval(screenshot.id, 'rejected')}
                      disabled={screenshot.status !== 'pending'}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm transition-all"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
              {screenshots.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  Verification queue is empty.
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
