import React, { useState } from 'react';
import { BarChart, Users, RadioTower, Settings, LogOut, Cpu, Send, Bot } from 'lucide-react';
import SettingsModal from './SettingsModal';
import FuturisticBackground from './FuturisticBackground';
import FuturisticCursor from './FuturisticCursor';
import CryptoDashboard from './CryptoDashboard';
import ForexDashboard from './ForexDashboard';

const AdminDashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState('forex');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isForexBotRunning, setIsForexBotRunning] = useState(false);
  const [isCryptoBotRunning, setIsCryptoBotRunning] = useState(false);
  
  const [signal, setSignal] = useState({
    currencyPair: 'EURUSD',
    timeframe: '15m',
    direction: 'BUY',
    entryPrice: '1.08500',
    stopLoss: '1.08300',
    takeProfit: '1.08700, 1.08900, 1.09100',
    pipsAtRisk: '-- pips',
    confidence: 90,
    analysis: 'Detailed market analysis and reasoning for this signal...',
    ictConcepts: [] as string[],
  });

  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [recentSignals, setRecentSignals] = useState<any[]>([]);
  const [kickstarterSubmissions, setKickstarterSubmissions] = useState([
    { id: 1, email: 'trader.joe@example.com', screenshotUrl: '/image.png', status: 'pending' },
    { id: 2, email: 'jane.doe.trading@example.com', screenshotUrl: '/image.png', status: 'pending' },
  ]);

  const handleSignalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSignal(prev => ({ ...prev, [name]: value }));
  };

  const toggleIctConcept = (concept: string) => {
    setSignal((prev: any) => ({
      ...prev,
      ictConcepts: prev.ictConcepts.includes(concept)
        ? prev.ictConcepts.filter((c: any) => c !== concept)
        : [...prev.ictConcepts, concept],
    }));
  };

  const StatCard = ({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) => (
    <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-2xl border border-blue-500/30 transition-all duration-300 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/20 group">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-gray-800/60 rounded-full transition-all duration-300 group-hover:bg-blue-500/20 group-hover:shadow-lg group-hover:shadow-blue-500/30">
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );

  const IctButton = ({ concept }: { concept: string }) => (
    <button
      onClick={() => toggleIctConcept(concept)}
      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
        signal.ictConcepts.includes(concept)
          ? 'bg-blue-600 text-white'
          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
      }`}
    >
      {concept}
    </button>
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
      <div className="min-h-screen bg-gray-950 text-gray-300 font-inter">
        <FuturisticBackground />
        <FuturisticCursor />
        <div className="relative z-10">
          <header className="flex justify-between items-center p-4 bg-gray-900/70 border-b border-blue-500/30 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <Cpu className="w-8 h-8 text-blue-400 animate-pulse" />
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-gray-800 transition-colors">
                <Settings />
              </button>
              <button onClick={onLogout} className="p-2 rounded-full hover:bg-gray-800 transition-colors">
                <LogOut />
              </button>
            </div>
          </header>

          <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

          <div className="p-6">
            <div className="flex space-x-2 mb-6 border-b border-gray-800">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 text-sm font-semibold transition-colors rounded-t-lg ${activeTab === 'dashboard' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('forex')}
                className={`px-4 py-2 text-sm font-semibold transition-colors rounded-t-lg ${activeTab === 'forex' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Forex
              </button>
              <button
                onClick={() => setActiveTab('crypto')}
                className={`px-4 py-2 text-sm font-semibold transition-colors rounded-t-lg ${activeTab === 'crypto' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Crypto
              </button>
              <button
                onClick={() => setActiveTab('kickstarter-approvals')}
                className={`px-4 py-2 text-sm font-semibold transition-colors rounded-t-lg ${activeTab === 'kickstarter-approvals' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Kickstarter Approvals
              </button>
            </div>

            {activeTab === 'dashboard' && (
              <div className="animate-fade-in-up">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <StatCard label="Active Users" value={activeUsers.length} icon={<Users />} />
                  <StatCard label="Signals Sent Today" value={recentSignals.length} icon={<Send />} />
                  <StatCard label="Total Account Value" value="$0" icon={<BarChart />} />
                  <StatCard label="Last Signal" value="None" icon={<RadioTower />} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-gray-800/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center"><Send className="mr-2"/> Create & Send Signal</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="text-sm text-gray-400">Currency Pair</label>
                        <input type="text" name="currencyPair" value={signal.currencyPair} onChange={handleSignalChange} className="w-full mt-1 bg-gray-900/70 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Timeframe</label>
                        <input type="text" name="timeframe" value={signal.timeframe} onChange={handleSignalChange} className="w-full mt-1 bg-gray-900/70 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Direction</label>
                        <div className="flex mt-1 space-x-2">
                          <button onClick={() => setSignal((s: any) => ({...s, direction: 'BUY'}))} className={`w-1/2 py-2 rounded-lg transition-colors ${signal.direction === 'BUY' ? 'bg-green-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>BUY</button>
                          <button onClick={() => setSignal((s: any) => ({...s, direction: 'SELL'}))} className={`w-1/2 py-2 rounded-lg transition-colors ${signal.direction === 'SELL' ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>SELL</button>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="md:col-span-1">
                        <label className="text-sm text-gray-400">Entry Price</label>
                        <input type="text" name="entryPrice" value={signal.entryPrice} onChange={handleSignalChange} className="w-full mt-1 bg-gray-900/70 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="md:col-span-1">
                        <label className="text-sm text-gray-400">Stop Loss</label>
                        <input type="text" name="stopLoss" value={signal.stopLoss} onChange={handleSignalChange} className="w-full mt-1 bg-gray-900/70 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm text-gray-400">Take Profit (comma separated)</label>
                        <input type="text" name="takeProfit" value={signal.takeProfit} onChange={handleSignalChange} className="w-full mt-1 bg-gray-900/70 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="text-sm text-gray-400">Confidence Level: {signal.confidence}%</label>
                      <input type="range" min="0" max="100" name="confidence" value={signal.confidence} onChange={handleSignalChange} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer mt-1" />
                    </div>
                    <div className="mb-4">
                      <label className="text-sm text-gray-400">Analysis</label>
                      <textarea name="analysis" value={signal.analysis} onChange={handleSignalChange} rows={4} className="w-full mt-1 bg-gray-900/70 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">ICT Concepts</label>
                      <div className="flex flex-wrap gap-2">
                        <IctButton concept="Fair Value Gap" />
                        <IctButton concept="Order Block" />
                        <IctButton concept="Liquidity Sweep" />
                        <IctButton concept="Change of Character" />
                        <IctButton concept="Premium Array" />
                        <IctButton concept="Discount Array" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-700">
                      <h3 className="text-xl font-bold text-white mb-4">Active Users ({activeUsers.length})</h3>
                      <div className="space-y-2 text-center text-gray-500">
                        <p>No active users yet.</p>
                      </div>
                    </div>
                    <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-700">
                      <h3 className="text-xl font-bold text-white mb-4">Recent Signals ({recentSignals.length})</h3>
                      <div className="space-y-2 text-center text-gray-500">
                        <p>No signals sent yet.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'forex' && (
              <div className="animate-fade-in-up">
                <ForexDashboard isBotRunning={isForexBotRunning} setIsBotRunning={setIsForexBotRunning} />
              </div>
            )}

            {activeTab === 'crypto' && (
              <div className="animate-fade-in-up">
                <CryptoDashboard isBotRunning={isCryptoBotRunning} setIsBotRunning={setIsCryptoBotRunning} />
              </div>
            )}

            {activeTab === 'kickstarter-approvals' && (
              <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 animate-fade-in-up">
                <h3 className="text-xl font-bold text-white mb-4">Kickstarter Approvals</h3>
                <div className="space-y-4">
                  {kickstarterSubmissions.filter(s => s.status === 'pending').map(submission => (
                    <div key={submission.id} className="bg-gray-900/50 p-4 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-white">{submission.email}</p>
                        <a href={submission.screenshotUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline">View Screenshot</a>
                      </div>
                      <div className="flex space-x-3">
                        <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Approve</button>
                        <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Reject</button>
                      </div>
                    </div>
                  ))}
                  {kickstarterSubmissions.filter(s => s.status === 'pending').length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <p>No pending Kickstarter submissions.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
