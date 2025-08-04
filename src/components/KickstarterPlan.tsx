import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Shield, UploadCloud, Mail } from 'lucide-react';
import Header from './Header';

const KickstarterPlan = () => {
  const [email, setEmail] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setScreenshot(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && screenshot) {
      console.log('Submitting Kickstarter Application:', { email, screenshot: screenshot.name });
      // Here you would typically handle the upload and form submission to a backend
      setIsSubmitted(true);
    } else {
      alert('Please provide both an email and a screenshot.');
    }
  };

  const features = [
    "Risk management plan for 1 month",
    "Trading signals for 1 week",
    "Standard risk management calculator",
    "Phase tracking dashboard",
    "3 prop firm rule analyzer",
    "Access via affiliate purchase only"
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <div className="bg-gray-800/60 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 hover:border-blue-500/50 transition-all duration-300 group hover:transform hover:scale-105">
        <div className="text-center">
          <Shield className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-4">Kickstarter</h3>
          <p className="text-gray-400 mb-6">Buy funded account with our affiliate link and get access to premium features <span className="font-bold text-green-400">FREE</span></p>
          <ul className="text-left space-y-4 mb-8">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                <span className="text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
          {isSubmitted ? (
            <div className="text-center p-8 bg-gray-900/50 rounded-lg border border-green-500/50">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Submission Received</h3>
              <p className="text-gray-400">Thank you! We will review your submission and grant access via email upon approval.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="sr-only">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-900/70 border border-gray-600 rounded-lg pl-10 pr-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="screenshot-upload" className="w-full bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer">
                  <UploadCloud className="w-5 h-5" />
                  <span>{screenshot ? screenshot.name : 'Upload Purchase Screenshot'}</span>
                </label>
                <input
                  id="screenshot-upload"
                  name="screenshot"
                  type="file"
                  className="sr-only"
                  onChange={handleFileChange}
                  accept="image/*"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-xl hover:shadow-blue-500/25"
              >
                Submit for Approval <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default KickstarterPlan;
