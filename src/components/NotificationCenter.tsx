import React, { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, TrendingUp, Shield, Settings, Check, Volume2, Mail, Smartphone } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

interface Notification {
  id: string;
  type: 'signal' | 'rule_breach' | 'account' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionRequired?: boolean;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundAlerts: boolean;
  signalAlerts: boolean;
  ruleBreachAlerts: boolean;
  accountUpdates: boolean;
  marketNews: boolean;
}

const NotificationCenter: React.FC = () => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    soundAlerts: true,
    signalAlerts: true,
    ruleBreachAlerts: true,
    accountUpdates: true,
    marketNews: false
  });

  // Load notifications and settings from localStorage
  useEffect(() => {
    const savedNotifications = localStorage.getItem('user_notifications');
    const savedSettings = localStorage.getItem('notification_settings');
    
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications).map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
      setNotifications(parsed);
    }
    
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Add some sample notifications for demo
    if (!savedNotifications) {
      const sampleNotifications: Notification[] = [
        {
          id: '1',
          type: 'signal',
          title: 'New Trading Signal',
          message: 'EURUSD BUY signal posted with 92% confidence',
          timestamp: new Date(Date.now() - 300000), // 5 minutes ago
          read: false,
          priority: 'high'
        },
        {
          id: '2',
          type: 'rule_breach',
          title: 'Risk Warning',
          message: 'Daily loss approaching 80% of limit (4% of 5%)',
          timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
          read: false,
          priority: 'critical',
          actionRequired: true
        },
        {
          id: '3',
          type: 'account',
          title: 'Account Update',
          message: 'Your account balance has been updated to $108,450',
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          read: true,
          priority: 'medium'
        }
      ];
      setNotifications(sampleNotifications);
    }
  }, []);

  // Save notifications and settings to localStorage
  useEffect(() => {
    localStorage.setItem('user_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('notification_settings', JSON.stringify(settings));
  }, [settings]);

  // Listen for new signals and rule breaches
  useEffect(() => {
    const handleNewSignal = (event: any) => {
      if (settings.signalAlerts) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: 'signal',
          title: 'New Trading Signal',
          message: `${event.detail.pair} ${event.detail.direction} signal posted`,
          timestamp: new Date(),
          read: false,
          priority: 'high'
        };
        setNotifications(prev => [newNotification, ...prev]);
        
        if (settings.soundAlerts) {
          playNotificationSound();
        }
      }
    };

    const handleRuleBreach = (event: any) => {
      if (settings.ruleBreachAlerts) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: 'rule_breach',
          title: 'Rule Breach Warning',
          message: event.detail.message,
          timestamp: new Date(),
          read: false,
          priority: 'critical',
          actionRequired: true
        };
        setNotifications(prev => [newNotification, ...prev]);
        
        if (settings.soundAlerts) {
          playAlertSound();
        }
      }
    };

    window.addEventListener('newSignalSent', handleNewSignal);
    window.addEventListener('ruleBreach', handleRuleBreach);

    return () => {
      window.removeEventListener('newSignalSent', handleNewSignal);
      window.removeEventListener('ruleBreach', handleRuleBreach);
    };
  }, [settings]);

  const playNotificationSound = () => {
    try {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  };

  const playAlertSound = () => {
    try {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // More urgent sound for rule breaches
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn('Could not play alert sound:', error);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'signal':
        return <TrendingUp className="w-5 h-5 text-blue-400" />;
      case 'rule_breach':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'account':
        return <Shield className="w-5 h-5 text-green-400" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-red-500 bg-red-500/10';
      case 'high':
        return 'border-yellow-500 bg-yellow-500/10';
      case 'medium':
        return 'border-blue-500 bg-blue-500/10';
      default:
        return 'border-gray-600 bg-gray-700/50';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (showSettings) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Notification Settings</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-white mb-4">Delivery Methods</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-white font-medium">Email Notifications</div>
                      <div className="text-sm text-gray-400">Receive notifications via email</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="text-white font-medium">Push Notifications</div>
                      <div className="text-sm text-gray-400">Browser push notifications</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.pushNotifications}
                      onChange={(e) => setSettings(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Volume2 className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="text-white font-medium">Sound Alerts</div>
                      <div className="text-sm text-gray-400">Play sound for notifications</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.soundAlerts}
                      onChange={(e) => setSettings(prev => ({ ...prev, soundAlerts: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-white mb-4">Notification Types</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Trading Signals</div>
                    <div className="text-sm text-gray-400">New signal alerts</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.signalAlerts}
                      onChange={(e) => setSettings(prev => ({ ...prev, signalAlerts: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Rule Breach Warnings</div>
                    <div className="text-sm text-gray-400">Risk management alerts</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.ruleBreachAlerts}
                      onChange={(e) => setSettings(prev => ({ ...prev, ruleBreachAlerts: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Account Updates</div>
                    <div className="text-sm text-gray-400">Balance and status changes</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.accountUpdates}
                      onChange={(e) => setSettings(prev => ({ ...prev, accountUpdates: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Market News</div>
                    <div className="text-sm text-gray-400">Economic events and news</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.marketNews}
                      onChange={(e) => setSettings(prev => ({ ...prev, marketNews: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <button
                onClick={() => setShowSettings(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Bell className="w-6 h-6 text-blue-400" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">{unreadCount}</span>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Notifications</h3>
              <p className="text-sm text-gray-400">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(true)}
              className="text-gray-400 hover:text-white transition-colors p-2"
            >
              <Settings className="w-5 h-5" />
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-red-400 hover:text-red-300 text-sm font-medium"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4 opacity-50" />
              <div className="text-gray-400 text-lg font-medium mb-2">No notifications</div>
              <div className="text-sm text-gray-500">You're all caught up!</div>
            </div>
          ) : (
            notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-all ${
                  notification.read ? 'bg-gray-700/30 border-gray-600' : getPriorityColor(notification.priority)
                } ${!notification.read ? 'shadow-lg' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className={`font-semibold ${notification.read ? 'text-gray-300' : 'text-white'}`}>
                          {notification.title}
                        </h4>
                        {notification.actionRequired && (
                          <span className="px-2 py-1 bg-red-600/20 text-red-400 text-xs rounded-full">
                            Action Required
                          </span>
                        )}
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className={`text-sm ${notification.read ? 'text-gray-400' : 'text-gray-300'}`}>
                        {notification.message}
                      </p>
                      <div className="text-xs text-gray-500 mt-2">
                        {notification.timestamp.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-blue-400 hover:text-blue-300 transition-colors p-1"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-red-400 hover:text-red-300 transition-colors p-1"
                      title="Delete notification"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;