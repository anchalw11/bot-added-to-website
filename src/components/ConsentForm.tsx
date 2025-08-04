import React, { useState } from 'react';
import { Shield, AlertTriangle, FileText, CheckCircle, X } from 'lucide-react';

interface ConsentFormProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const ConsentForm: React.FC<ConsentFormProps> = ({ isOpen, onAccept, onDecline }) => {
  const [agreements, setAgreements] = useState({
    riskDisclosure: false,
    noLiability: false,
    educationalPurpose: false,
    noFinancialAdvice: false,
    dataUsage: false,
    termsOfService: false
  });

  const [hasReadAll, setHasReadAll] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAgreementChange = (key: string, value: boolean) => {
    setAgreements(prev => ({ ...prev, [key]: value }));
  };

  const allAgreed = Object.values(agreements).every(Boolean) && hasReadAll;

  const handleAccept = () => {
    if (allAgreed) {
      setIsSubmitting(true);
      localStorage.setItem('user_consent_accepted', JSON.stringify({
        timestamp: new Date().toISOString(),
        agreements,
        ipAddress: 'hidden_for_privacy',
        userAgent: navigator.userAgent
      }));
      setTimeout(() => {
        onAccept();
        setIsSubmitting(false);
      }, 1000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" style={{ cursor: 'auto' }}>
      <div className="bg-gray-900 rounded-2xl border border-red-500/50 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-red-600/20 border-b border-red-500/50 p-6">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-red-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">MANDATORY LEGAL CONSENT</h2>
              <p className="text-red-300">Please read and accept all terms before proceeding</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="space-y-6">
            {/* Risk Disclosure */}
            <div className="bg-red-600/10 border border-red-500/30 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-400 mb-3">CRITICAL RISK DISCLOSURE</h3>
                  <div className="text-gray-300 space-y-2 text-sm">
                    <p><strong>TRADING INVOLVES SUBSTANTIAL RISK OF LOSS.</strong> You can lose some or all of your invested capital. Past performance does not guarantee future results.</p>
                    <p><strong>PROP FIRM CHALLENGES:</strong> Most traders fail prop firm challenges. Success rates are typically 5-15%. You may lose your challenge fee.</p>
                    <p><strong>LEVERAGE RISK:</strong> High leverage can result in rapid and substantial losses exceeding your initial investment.</p>
                    <p><strong>MARKET VOLATILITY:</strong> Financial markets are unpredictable and can move against your positions at any time.</p>
                  </div>
                  <label className="flex items-center space-x-3 mt-4">
                    <input
                      type="checkbox"
                      checked={agreements.riskDisclosure}
                      onChange={(e) => handleAgreementChange('riskDisclosure', e.target.checked)}
                      className="w-5 h-5 rounded bg-gray-700 border-red-500 text-red-600 focus:ring-red-500 cursor-pointer"
                      style={{ cursor: 'pointer' }}
                    />
                    <span className="text-white font-medium">I understand and accept all trading risks</span>
                  </label>
                </div>
              </div>
            </div>

            {/* No Liability */}
            <div className="bg-yellow-600/10 border border-yellow-500/30 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <FileText className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-yellow-400 mb-3">COMPLETE LIABILITY WAIVER</h3>
                  <div className="text-gray-300 space-y-2 text-sm">
                    <p><strong>NO RESPONSIBILITY FOR LOSSES:</strong> TraderEdge Pro, its owners, employees, and affiliates are NOT responsible for any trading losses, missed profits, or financial damages.</p>
                    <p><strong>YOUR DECISIONS:</strong> All trading decisions are entirely your own. We do not control your trading account or execute trades for you.</p>
                    <p><strong>NO GUARANTEES:</strong> We make no guarantees about profits, success rates, or challenge completion. Results vary significantly between individuals.</p>
                    <p><strong>TECHNICAL ISSUES:</strong> We are not liable for system downtime, signal delays, or technical failures that may affect your trading.</p>
                  </div>
                  <label className="flex items-center space-x-3 mt-4">
                    <input
                      type="checkbox"
                      checked={agreements.noLiability}
                      onChange={(e) => handleAgreementChange('noLiability', e.target.checked)}
                      className="w-5 h-5 rounded bg-gray-700 border-yellow-500 text-yellow-600 focus:ring-yellow-500 cursor-pointer"
                      style={{ cursor: 'pointer' }}
                    />
                    <span className="text-white font-medium">I waive all liability claims against TraderEdge Pro</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Educational Purpose */}
            <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <FileText className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-blue-400 mb-3">EDUCATIONAL PURPOSE ONLY</h3>
                  <div className="text-gray-300 space-y-2 text-sm">
                    <p><strong>NOT FINANCIAL ADVICE:</strong> All content, signals, and analysis are for educational purposes only and do not constitute financial advice.</p>
                    <p><strong>NO INVESTMENT RECOMMENDATIONS:</strong> We do not recommend specific investments or trading strategies for your personal situation.</p>
                    <p><strong>CONSULT PROFESSIONALS:</strong> Always consult with qualified financial advisors before making trading decisions.</p>
                    <p><strong>INDEPENDENT RESEARCH:</strong> Conduct your own research and due diligence before any trading activity.</p>
                  </div>
                  <label className="flex items-center space-x-3 mt-4">
                    <input
                      type="checkbox"
                      checked={agreements.educationalPurpose}
                      onChange={(e) => handleAgreementChange('educationalPurpose', e.target.checked)}
                      className="w-5 h-5 rounded bg-gray-700 border-blue-500 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      style={{ cursor: 'pointer' }}
                    />
                    <span className="text-white font-medium">I understand this is educational content only</span>
                  </label>
                </div>
              </div>
            </div>

            {/* No Financial Advice */}
            <div className="bg-purple-600/10 border border-purple-500/30 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-purple-400 mb-3">NO FINANCIAL ADVISORY RELATIONSHIP</h3>
                  <div className="text-gray-300 space-y-2 text-sm">
                    <p><strong>NOT LICENSED ADVISORS:</strong> We are not licensed financial advisors, brokers, or investment professionals.</p>
                    <p><strong>NO FIDUCIARY DUTY:</strong> We have no fiduciary duty or obligation to act in your best financial interest.</p>
                    <p><strong>GENERAL INFORMATION:</strong> All information provided is general in nature and not tailored to your specific circumstances.</p>
                    <p><strong>SEEK PROFESSIONAL ADVICE:</strong> For personalized financial advice, consult licensed professionals in your jurisdiction.</p>
                  </div>
                  <label className="flex items-center space-x-3 mt-4">
                    <input
                      type="checkbox"
                      checked={agreements.noFinancialAdvice}
                      onChange={(e) => handleAgreementChange('noFinancialAdvice', e.target.checked)}
                      className="w-5 h-5 rounded bg-gray-700 border-purple-500 text-purple-600 focus:ring-purple-500 cursor-pointer"
                      style={{ cursor: 'pointer' }}
                    />
                    <span className="text-white font-medium">I understand no financial advisory relationship exists</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Data Usage */}
            <div className="bg-gray-600/10 border border-gray-500/30 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <Shield className="w-6 h-6 text-gray-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-400 mb-3">DATA USAGE & PRIVACY</h3>
                  <div className="text-gray-300 space-y-2 text-sm">
                    <p><strong>ACCOUNT SECURITY:</strong> We do not store or access your trading account passwords or login credentials.</p>
                    <p><strong>PERFORMANCE TRACKING:</strong> You must manually mark trades as "taken" for accurate performance tracking.</p>
                    <p><strong>DATA COLLECTION:</strong> We collect usage data to improve our services. No personal trading account data is accessed.</p>
                    <p><strong>THIRD-PARTY SERVICES:</strong> We may use third-party services for analytics and functionality.</p>
                  </div>
                  <label className="flex items-center space-x-3 mt-4">
                    <input
                      type="checkbox"
                      checked={agreements.dataUsage}
                      onChange={(e) => handleAgreementChange('dataUsage', e.target.checked)}
                      className="w-5 h-5 rounded bg-gray-700 border-gray-500 text-gray-600 focus:ring-gray-500 cursor-pointer"
                      style={{ cursor: 'pointer' }}
                    />
                    <span className="text-white font-medium">I agree to data usage and privacy terms</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Terms of Service */}
            <div className="bg-green-600/10 border border-green-500/30 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-green-400 mb-3">TERMS OF SERVICE AGREEMENT</h3>
                  <div className="text-gray-300 space-y-2 text-sm">
                    <p><strong>BINDING AGREEMENT:</strong> By using our service, you agree to be bound by our Terms of Service and Privacy Policy.</p>
                    <p><strong>SERVICE AVAILABILITY:</strong> Services may be interrupted or discontinued at any time without notice.</p>
                    <p><strong>USER RESPONSIBILITY:</strong> You are responsible for your own trading decisions and account management.</p>
                    <p><strong>DISPUTE RESOLUTION:</strong> Any disputes will be resolved through binding arbitration in our jurisdiction.</p>
                  </div>
                  <label className="flex items-center space-x-3 mt-4">
                    <input
                      type="checkbox"
                      checked={agreements.termsOfService}
                      onChange={(e) => handleAgreementChange('termsOfService', e.target.checked)}
                      className="w-5 h-5 rounded bg-gray-700 border-green-500 text-green-600 focus:ring-green-500 cursor-pointer"
                      style={{ cursor: 'pointer' }}
                    />
                    <span className="text-white font-medium">I agree to the Terms of Service and Privacy Policy</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Final Confirmation */}
            <div className="bg-gray-800/50 border border-gray-600 rounded-xl p-6">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={hasReadAll}
                  onChange={(e) => setHasReadAll(e.target.checked)}
                  className="w-5 h-5 rounded bg-gray-700 border-gray-500 text-blue-600 focus:ring-blue-500 mt-1 cursor-pointer"
                  style={{ cursor: 'pointer' }}
                />
                <div className="text-gray-300">
                  <p className="font-medium text-white mb-2">FINAL CONFIRMATION</p>
                  <p className="text-sm">
                    I have read, understood, and agree to ALL the above terms and conditions. 
                    I acknowledge that trading is risky and that TraderEdge Pro is not responsible 
                    for my trading results. I understand this is educational content only and not financial advice.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-6">
          <div className="flex justify-between items-center">
            <button
              onClick={onDecline}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
              <span>Decline & Exit</span>
            </button>
            
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">
                By accepting, you acknowledge reading and understanding all terms
              </p>
              <p className="text-xs text-gray-500">
                This consent is legally binding and protects both parties
              </p>
            </div>
            
            <button
              onClick={handleAccept}
              disabled={!allAgreed}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                allAgreed
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
              style={{ cursor: allAgreed ? 'pointer' : 'not-allowed' }}
            >
              <CheckCircle className="w-5 h-5" />
              <span>{isSubmitting ? 'Processing...' : 'Accept & Continue'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentForm;