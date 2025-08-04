import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [tradesPerDay, setTradesPerDay] = useState('1-2');
  const [lastChanged, setLastChanged] = useState<number | null>(() => {
    const savedLastChanged = localStorage.getItem('tradesPerDayLastChanged');
    return savedLastChanged ? parseInt(savedLastChanged, 10) : null;
  });
  const [isSaving, setIsSaving] = useState(false);

  const canChangeTradesPerDay = () => {
    if (!lastChanged) {
      return true;
    }
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    return Date.now() - lastChanged > oneWeek;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:3003/api/set-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newApiKey: apiKey }),
      });

      if (response.ok) {
        localStorage.setItem('tradesPerDay', tradesPerDay);
        const now = Date.now();
        localStorage.setItem('tradesPerDayLastChanged', now.toString());
        setLastChanged(now);
        alert('✅ Settings saved successfully!');
        onClose();
      } else {
        alert('❌ Failed to save API Key.');
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      alert('❌ An error occurred while saving the API Key.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">API Settings</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Financial Modeling Prep API Key
          </label>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your API key"
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Trades Per Day
          </label>
          <select
            value={tradesPerDay}
            onChange={(e) => setTradesPerDay(e.target.value)}
            disabled={!canChangeTradesPerDay()}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 disabled:bg-gray-600"
          >
            <option value="1-2">1-2 (Recommended)</option>
            <option value="3-5">3-5</option>
            <option value="6-10">6-10</option>
            <option value="10+">10+</option>
          </select>
          {!canChangeTradesPerDay() && (
            <p className="text-xs text-gray-400 mt-1">
              You can change this setting once per week.
            </p>
          )}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
