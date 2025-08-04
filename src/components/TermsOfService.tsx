import React from 'react';
import { FileText, Shield, AlertTriangle, Scale, Lock, Globe } from 'lucide-react';
import Header from './Header';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white">
      <Header />
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Terms of Service</h1>
            <p className="text-lg text-gray-400">Last updated: January 18, 2025</p>
          </div>

          <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 space-y-8">
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">1. Acceptance of Terms</h2>
              </div>
              <p className="text-gray-300 leading-relaxed">
                By accessing and using TraderEdge Pro ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
                <h2 className="text-2xl font-bold text-white">2. Service Description & Risk Disclosure</h2>
              </div>
              <div className="bg-red-600/20 border border-red-600 rounded-lg p-4 mb-4">
                <p className="text-red-300 font-semibold mb-2">IMPORTANT RISK WARNING:</p>
                <p className="text-gray-300 leading-relaxed">
                  TraderEdge Pro provides educational content, trading signals, and analytical tools for proprietary firm trading. 
                  Trading involves substantial risk of loss and is not suitable for all investors. Past performance does not guarantee future results.
                </p>
              </div>
              <ul className="text-gray-300 space-y-2 list-disc list-inside">
                <li>We are NOT a financial advisor, broker, or investment company</li>
                <li>All signals and analysis are for educational purposes only</li>
                <li>You are solely responsible for your trading decisions</li>
                <li>We do not guarantee profits or success in prop firm challenges</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-6 h-6 text-green-400" />
                <h2 className="text-2xl font-bold text-white">3. Limitation of Liability</h2>
              </div>
              <p className="text-gray-300 leading-relaxed">
                TraderEdge Pro, its owners, employees, and affiliates shall not be liable for any direct, indirect, incidental, 
                special, consequential, or punitive damages, including but not limited to trading losses, lost profits, or business interruption.
              </p>
            </section>

            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Lock className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">4. User Responsibilities</h2>
              </div>
              <ul className="text-gray-300 space-y-2 list-disc list-inside">
                <li>Provide accurate information during registration</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Use the service in compliance with applicable laws</li>
                <li>Not share or resell access to our signals or content</li>
                <li>Conduct your own due diligence before making trading decisions</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Scale className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">5. Intellectual Property</h2>
              </div>
              <p className="text-gray-300 leading-relaxed">
                All content, including but not limited to trading signals, analysis, software, and educational materials, 
                is the intellectual property of TraderEdge Pro and is protected by copyright and other intellectual property laws.
              </p>
            </section>

            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Globe className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white">6. Governing Law</h2>
              </div>
              <p className="text-gray-300 leading-relaxed">
                These Terms shall be interpreted and governed by the laws of the jurisdiction in which TraderEdge Pro is incorporated, 
                without regard to its conflict of law provisions.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;