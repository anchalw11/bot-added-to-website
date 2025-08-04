import React from 'react';
import { Shield, Eye, Database, Lock, UserCheck, Globe } from 'lucide-react';
import Header from './Header';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white">
      <Header />
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Privacy Policy</h1>
            <p className="text-lg text-gray-400">Last updated: January 18, 2025</p>
          </div>

          <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 space-y-8">
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">1. Information We Collect</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-blue-300 mb-2">Personal Information:</h3>
                  <ul className="text-gray-300 space-y-1 list-disc list-inside ml-4">
                    <li>Name, email address, and contact information</li>
                    <li>Account preferences and trading settings</li>
                    <li>Payment information (processed securely by third parties)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-300 mb-2">Usage Data:</h3>
                  <ul className="text-gray-300 space-y-1 list-disc list-inside ml-4">
                    <li>Platform usage patterns and feature interactions</li>
                    <li>Signal performance and trading activity (anonymized)</li>
                    <li>Device information and browser data</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Eye className="w-6 h-6 text-green-400" />
                <h2 className="text-2xl font-bold text-white">2. How We Use Your Information</h2>
              </div>
              <ul className="text-gray-300 space-y-2 list-disc list-inside">
                <li>Provide and improve our trading signals and educational content</li>
                <li>Personalize your experience and trading plan recommendations</li>
                <li>Send important service updates and trading notifications</li>
                <li>Analyze platform performance and user engagement (anonymized)</li>
                <li>Comply with legal obligations and prevent fraud</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Database className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">3. Data Security & Protection</h2>
              </div>
              <div className="bg-green-600/20 border border-green-600 rounded-lg p-4 mb-4">
                <p className="text-green-300 font-semibold mb-2">Security Measures:</p>
                <ul className="text-gray-300 space-y-1 list-disc list-inside">
                  <li>Industry-standard SSL encryption for all data transmission</li>
                  <li>Secure cloud storage with regular backups</li>
                  <li>Limited access controls and employee training</li>
                  <li>Regular security audits and vulnerability assessments</li>
                </ul>
              </div>
              <p className="text-gray-300 leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, 
                alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <div className="flex items-center space-x-3 mb-4">
                <UserCheck className="w-6 h-6 text-yellow-400" />
                <h2 className="text-2xl font-bold text-white">4. Your Rights & Choices</h2>
              </div>
              <ul className="text-gray-300 space-y-2 list-disc list-inside">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Lock className="w-6 h-6 text-red-400" />
                <h2 className="text-2xl font-bold text-white">5. Trading Account Security</h2>
              </div>
              <div className="bg-blue-600/20 border border-blue-600 rounded-lg p-4">
                <p className="text-blue-300 font-semibold mb-2">Important Notice:</p>
                <p className="text-gray-300 leading-relaxed">
                  We DO NOT store, access, or require your trading account passwords or login credentials. 
                  Our platform operates independently and does not connect to your broker accounts. 
                  All trading decisions and executions are entirely under your control.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Globe className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white">6. Third-Party Services</h2>
              </div>
              <p className="text-gray-300 leading-relaxed mb-4">
                We may use third-party services for payment processing, analytics, and communication. 
                These services have their own privacy policies and data handling practices.
              </p>
              <ul className="text-gray-300 space-y-1 list-disc list-inside">
                <li>Payment processors (Stripe, PayPal, etc.)</li>
                <li>Analytics services (anonymized data only)</li>
                <li>Communication platforms (email, notifications)</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-6 h-6 text-green-400" />
                <h2 className="text-2xl font-bold text-white">7. Contact Information</h2>
              </div>
              <p className="text-gray-300 leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="bg-gray-700/50 rounded-lg p-4 mt-4">
                <p className="text-white">Email: privacy@traderedgepro.com</p>
                <p className="text-white">Support: support@traderedgepro.com</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;