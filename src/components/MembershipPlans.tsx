import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Star, Zap, Crown, Shield, ArrowLeft, CheckCircle } from 'lucide-react';
import Header from './Header';

const MembershipPlans = () => {
  const navigate = useNavigate();
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [selectedPlanForCoupon, setSelectedPlanForCoupon] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  const plans = [
    {
      name: 'Kickstarter',
      price: 0,
      period: 'month',
      description: 'Buy funded account with our affiliate link and get access to premium features',
      icon: <Shield className="w-8 h-8" />,
      color: 'border-gray-600',
      bgColor: 'bg-gray-800',
      buttonColor: 'bg-gray-600 hover:bg-gray-700',
      isAffiliate: true,
      features: [
        'Risk management plan for 1 month',
        'Trading signals for 1 week',
        'Standard risk management calculator',
        'Phase tracking dashboard',
        '3 prop firm rule analyzer',
        'Access via affiliate purchase only'
      ],
    },
    {
      name: 'Starter',
      price: 99,
      period: 'month',
      description: 'Essential features for serious traders',
      icon: <Star className="w-8 h-8" />,
      color: 'border-blue-500',
      bgColor: 'bg-blue-500/10',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      features: [
        'Risk management plan for 1 month',
        'Trading signals for 1 month',
        'Standard risk management calculator',
        'Phase tracking dashboard',
        '5 prop firm rule analyzer',
        'Email support',
        'Auto lot size calculator'
      ]
    },
    {
      name: 'Pro',
      price: 199,
      period: 'month',
      description: 'Advanced features for professional traders',
      icon: <Zap className="w-8 h-8" />,
      color: 'border-yellow-500',
      bgColor: 'bg-yellow-500/10',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
      popular: true,
      features: [
        'Risk management plan for 1 month',
        'Trading signals for 1 month',
        'Standard risk management calculator',
        'Phase tracking dashboard',
        '15 prop firm rule analyzer',
        'Priority chat and email support',
        'Auto lot size calculator',
        'Access to private community',
        'Multi account tracker',
        'Advanced trading journal',
        'Backtesting tools',
        'Instant access to new features'
      ]
    },
    {
      name: 'Enterprise',
      price: 499,
      period: '3 months',
      description: 'Ultimate solution for trading teams and professionals',
      icon: <Crown className="w-8 h-8" />,
      color: 'border-purple-500',
      bgColor: 'bg-purple-500/10',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      features: [
        'Risk management plan for 3 months',
        'Trading signals for 3 months',
        'Standard risk management calculator',
        'Phase tracking dashboard',
        '15 prop firm rule analyzer',
        '24/7 priority chat and email support',
        'Auto lot size calculator',
        'Access to private community',
        'Multi account tracker',
        'Advanced trading journal',
        'Professional backtesting suite',
        'Chart analysis tools',
        'Instant access to new features'
      ]
    }
  ];

  const handlePlanSelect = (plan: any) => {
    if (plan.isAffiliate) return;
    
    // Navigate directly to sign up with the selected plan
    navigate('/signup', {
      state: { 
        selectedPlan: { 
          name: plan.name, 
          price: plan.price, 
          period: plan.period 
        } 
      }
    });
  };


  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <Link to="/" className="inline-flex items-center space-x-2 text-blue-500 hover:text-blue-400 mb-8">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Choose Your Plan</h1>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-8">
              Select the perfect plan to accelerate your prop firm success with our professional clearing service.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-2xl border-2 ${plan.color} ${plan.bgColor} backdrop-blur-sm p-6 transition-transform duration-300 transform hover:scale-105 ${
                  plan.popular ? 'scale-105 shadow-2xl' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className="text-blue-500 mb-4 flex justify-center">
                    {plan.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                  <div className="mb-6">
                    {plan.price === 0 ? (
                      <span className="text-3xl font-bold text-green-400">FREE</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold text-white">${plan.price}</span>
                        <span className="text-gray-400">/{plan.period}</span>
                      </>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {(plan as any).isAffiliate ? (
                  <Link
                    to="/affiliate-links"
                    className={`w-full ${plan.buttonColor} text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center`}
                  >
                    Get Started
                  </Link>
                ) : (
                  <button
                    onClick={() => handlePlanSelect(plan)}
                    className={`w-full ${plan.buttonColor} text-white py-3 rounded-lg font-semibold transition-colors`}
                  >
                    Get Started
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Which prop firms do you support?</h3>
                  <p className="text-gray-400">We support 150+ major prop firms including FTMO, MyForexFunds, The5%ers, FundingPips, QuantTekel, and many more.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Can I change plans anytime?</h3>
                  <p className="text-gray-400">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">What's included in the trading plan?</h3>
                  <p className="text-gray-400">Risk management plans include position sizing, phase-specific strategies, auto lot size calculations, and rule compliance monitoring.</p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">What is the Kickstarter plan?</h3>
                  <p className="text-gray-400">Purchase a funded account through our affiliate links and get free access to our premium features for the specified duration.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Do you offer refunds?</h3>
                  <p className="text-gray-400">We offer a 30-day money-back guarantee if you're not satisfied with our service.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">What is multi account tracker?</h3>
                  <p className="text-gray-400">Track multiple prop firm accounts simultaneously with consolidated analytics and risk management across all your funded accounts.</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center">
            <div className="bg-gradient-to-r from-blue-600/20 to-gray-800/50 rounded-2xl p-12 border border-gray-700">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Clear Your Challenge?</h2>
              <p className="text-lg text-gray-400 mb-8">
                Choose the plan that fits your trading goals and start your funded account journey today.
              </p>
              <Link
                to="/payment"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-colors inline-flex items-center space-x-2 shadow-lg"
              >
                <span>Start Your Journey</span>
                <Star className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipPlans;
