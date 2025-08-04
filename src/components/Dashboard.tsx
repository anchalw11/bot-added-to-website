import React, { useState } from 'react';
import { useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Award, 
  DollarSign, 
  Activity, 
  Bell, 
  Settings, 
  LogOut,
  Zap,
  BookOpen,
  PieChart,
  Building,
  Shield,
  Cpu
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import SignalsFeed from './SignalsFeed';
import PerformanceAnalytics from './PerformanceAnalytics';
import TradingJournalDashboard from './TradingJournalDashboard';
import MultiAccountTracker from './MultiAccountTracker';
import RiskManagement from './RiskManagement';
import AlertSystem from './AlertSystem';
import NotificationCenter from './NotificationCenter';
import AccountSettings from './AccountSettings';
import PropFirmRules from './PropFirmRules';
import ConsentForm from './ConsentForm';
import FuturisticBackground from './FuturisticBackground';
import FuturisticCursor from './FuturisticCursor';

const Dashboard = () => {
  const { user, logout } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState(3);
  const [selectedAccount, setSelectedAccount] = useState('main');
  const [showConsentForm, setShowConsentForm] = useState(false);

  // Check if user has given consent
  useEffect(() => {
    const consentGiven = localStorage.getItem('user_consent_accepted');
    if (!consentGiven && user?.setupComplete) {
      setShowConsentForm(true);
    }
  }, [user]);

  const handleConsentAccept = () => {
    setShowConsentForm(false);
  };

  const handleConsentDecline = () => {
    logout();
  };

  if (!user || !user.setupComplete) {
    const message = user?.membershipTier === 'kickstarter'
      ? "Your Kickstarter plan is awaiting approval. You will be notified once your account is active."
      : "Please complete the setup process to access your dashboard.";

    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center font-inter">
        <FuturisticBackground />
        <FuturisticCursor />
        <div className="relative z-10 text-center">
          <div className="text-blue-400 text-xl animate-pulse mb-4">Awaiting Access</div>
          <p className="text-gray-400">{message}</p>
        </div>
      </div>
    );
  }

  const hasProAccess = user.membershipTier === 'professional' || user.membershipTier === 'enterprise';
  const hasJournalAccess = user.membershipTier === 'pro' || user.membershipTier === 'professional' || user.membershipTier === 'enterprise';

  const accounts = [
    { id: 'main', name: 'Main Account', balance: '$108,450', type: 'FTMO' },
    { id: 'demo', name: 'Demo Account', balance: '$50,000', type: 'MyForexFunds' },
    { id: 'backup', name: 'Backup Account', balance: '$25,000', type: 'The5%ers' }
  ];

  const currentAccount = accounts.find(acc => acc.id === selectedAccount) || accounts[0];

  const sidebarTabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'signals', label: 'Signal Feed', icon: <Zap className="w-5 h-5" /> },
    { id: 'rules', label: 'Compliance Matrix', icon: <Shield className="w-5 h-5" /> },
    { id: 'analytics', label: 'Performance', icon: <PieChart className="w-5 h-5" /> },
    ...(hasJournalAccess ? [{ id: 'journal', label: 'Trade Journal', icon: <BookOpen className="w-5 h-5" /> }] : []),
    ...(hasProAccess ? [{ id: 'accounts', label: 'Multi-Account', icon: <Building className="w-5 h-5" /> }] : []),
    { id: 'risk', label: 'Risk Protocol', icon: <Target className="w-5 h-5" /> },
    { id: 'alerts', label: 'Alerts', icon: <Bell className="w-5 h-5" /> },
  ];

  const stats = [
    { label: 'Account Balance', value: currentAccount.balance, change: 'Live Data', icon: <DollarSign className="w-8 h-8" />, color: 'green' },
    { label: 'Win Rate', value: 'Track Trades', change: 'Mark Taken', icon: <Target className="w-8 h-8" />, color: 'blue' },
    { label: 'Total Trades', value: 'No Data', change: 'Start Trading', icon: <Activity className="w-8 h-8" />, color: 'purple' },
    { label: 'Profit Factor', value: 'Calculate', change: 'From Trades', icon: <Award className="w-8 h-8" />, color: 'yellow' }
  ];

  // Load actual trades from localStorage
  const [recentTrades, setRecentTrades] = useState([]);

  useEffect(() => {
    const loadTrades = () => {
      const storedTrades = JSON.parse(localStorage.getItem('taken_trades') || '[]');
      const formattedTrades = storedTrades.slice(0, 4).map((trade: any) => ({
        pair: trade.pair || 'Unknown',
        type: trade.type || 'Unknown',
        result: 'Pending',
        profit: 'Calculating...',
        time: new Date(trade.timestamp).toLocaleString(),
        positive: null
      }));
      setRecentTrades(formattedTrades);
    };

    loadTrades();
    window.addEventListener('tradesUpdated', loadTrades);
    return () => window.removeEventListener('tradesUpdated', loadTrades);
  }, []);

  const renderOverview = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl border border-gray-700 p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome, {user.name}</h2>
            <p className="text-gray-400">Your {user.membershipTier.charAt(0).toUpperCase() + user.membershipTier.slice(1)} Dashboard</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Total P&L</div>
            <div className="text-3xl font-bold text-green-400">+$1,247</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className={`bg-gray-900/50 backdrop-blur-sm p-6 rounded-2xl border border-blue-500/30 transition-all duration-300 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/20 group`}>
            <div className="flex items-center space-x-4">
              <div className={`p-3 bg-gray-800/60 rounded-full text-blue-400 transition-all duration-300 group-hover:bg-blue-500/20 group-hover:shadow-lg group-hover:shadow-blue-500/30`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-6">Recent Trades</h3>
          {recentTrades.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-400 text-lg font-medium mb-2">No trades recorded yet</div>
              <div className="text-sm text-gray-500 mb-4">
                Start taking signals and mark them as "taken" to see your performance here
              </div>
              <div className="bg-blue-600/20 border border-blue-600 rounded-lg p-4">
                <p className="text-blue-300 text-sm">
                  <strong>Important:</strong> Click "Mark as Taken" on any signal you execute. 
                  This helps us track your performance without accessing your trading account credentials.
                </p>
              </div>
            </div>
          ) : (
          <div className="space-y-4">
            {recentTrades.map((trade, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${trade.positive ? 'bg-green-400' : trade.positive === false ? 'bg-red-400' : 'bg-yellow-400'}`}></div>
                  <div>
                    <div className="text-white font-medium">{trade.pair}</div>
                    <div className="text-sm text-gray-400">{trade.type} • {trade.time}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">{trade.result}</div>
                  <div className={`text-sm ${trade.positive ? 'text-green-400' : trade.positive === false ? 'text-red-400' : 'text-yellow-400'}`}>{trade.profit}</div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
        <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Market Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Forex Market</span>
              <div className="flex items-center space-x-2"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div><span className="text-green-400 text-sm">Open</span></div>
            </div>
            <div className="flex items-center justify-between"><span className="text-gray-400">Current Session</span><span className="text-white text-sm">London</span></div>
            <div className="flex items-center justify-between"><span className="text-gray-400">Next Session</span><span className="text-white text-sm">New York (2h 15m)</span></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          .font-inter {
            font-family: 'Inter', sans-serif;
          }
        `}
      </style>
      <div className="min-h-screen bg-gray-950 text-gray-300 font-inter flex">
        <FuturisticBackground />
        <FuturisticCursor />
        <div className="w-64 bg-gray-900/80 border-r border-gray-800 flex flex-col backdrop-blur-sm">
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center space-x-3 mb-4"><Cpu className="w-8 h-8 text-blue-400 animate-pulse" /><h1 className="text-xl font-bold text-white">TraderEdge Pro</h1></div>
            <div className="flex items-center space-x-2 bg-gray-800 px-3 py-1 rounded-full border border-gray-700"><div className="w-2 h-2 bg-blue-400 rounded-full"></div><span className="text-sm text-blue-400">{user.membershipTier} Plan</span></div>
          </div>
          <nav className="flex-1 p-4"><div className="space-y-2">{sidebarTabs.map((tab) => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>{tab.icon}<span className="font-medium">{tab.label}</span></button>))}</div></nav>
          <div className="p-4 border-t border-gray-800 flex items-center justify-around">
            <button onClick={() => setActiveTab('notifications')} className="relative text-gray-400 hover:text-white"><Bell className="w-6 h-6" />{notifications > 0 && (<div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white">{notifications}</div>)}</button>
            <button onClick={() => setActiveTab('settings')} className="text-gray-400 hover:text-white"><Settings className="w-6 h-6" /></button>
            <button onClick={logout} className="text-gray-400 hover:text-white"><LogOut className="w-6 h-6" /></button>
          </div>
        </div>
        <div className="flex-1 flex flex-col bg-gray-950/50">
          <header className="bg-gray-900/50 border-b border-gray-800 px-6 py-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div><h2 className="text-2xl font-bold text-white capitalize">{activeTab.replace('-', ' ')}</h2></div>
              <div className="text-right"><div className="text-white font-semibold">{currentAccount.name}</div><div className="text-sm text-gray-400">{currentAccount.balance}</div></div>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'signals' && <SignalsFeed />}
            {activeTab === 'rules' && <PropFirmRules />}
            {activeTab === 'analytics' && <PerformanceAnalytics />}
            {activeTab === 'journal' && hasJournalAccess && <TradingJournalDashboard />}
            {activeTab === 'accounts' && hasProAccess && <MultiAccountTracker />}
            {activeTab === 'risk' && <RiskManagement />}
            {activeTab === 'alerts' && <AlertSystem />}
            {activeTab === 'notifications' && <NotificationCenter />}
            {activeTab === 'settings' && <AccountSettings />}
          </main>
        </div>

        {/* Consent Form Modal */}
        <ConsentForm
          isOpen={showConsentForm}
          onAccept={handleConsentAccept}
          onDecline={handleConsentDecline}
        />
      </div>
    </>
  );
};

export default Dashboard;