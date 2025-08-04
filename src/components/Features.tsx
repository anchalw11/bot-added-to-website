import React from 'react';
import { Target, Shield, BarChart3, Zap, Award, Users } from 'lucide-react';
import Header from './Header';

const Features: React.FC = () => {
  const features = [
    {
      icon: <Target className="w-12 h-12 text-blue-400" />,
      title: "Prop Firm Mastery",
      description: "Expert guidance for FTMO, MyForexFunds, The5%ers, and 150+ prop firms with proven success strategies",
    },
    {
      icon: <Shield className="w-12 h-12 text-green-400" />,
      title: "Risk Management Excellence",
      description: "Advanced position sizing and drawdown protection tailored to each prop firm's specific rules",
    },
    {
      icon: <BarChart3 className="w-12 h-12 text-purple-400" />,
      title: "Custom Trading Plans",
      description: "Personalized multi-phase trading strategies designed for your account size and risk tolerance",
    },
    {
      icon: <Zap className="w-12 h-12 text-yellow-400" />,
      title: "Real-Time Signals",
      description: "Professional-grade trading signals with precise entry, stop loss, and take profit levels",
    },
    {
      icon: <Award className="w-12 h-12 text-red-400" />,
      title: "Phase Tracking",
      description: "Complete progress monitoring through challenge phases to live funded account status",
    },
    {
      icon: <Users className="w-12 h-12 text-cyan-400" />,
      title: "Expert Support",
      description: "Dedicated support team with extensive prop firm experience and proven track record",
    }
  ];

  return (
    <div className="min-h-screen text-white overflow-hidden">
      <Header />
      <div className="absolute inset-0 z-0 pt-16">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20"></div>
      </div>
      <div className="container mx-auto px-4 py-24 relative z-10 pt-32">
        <div className="text-center mb-20">
          <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-6 animate-fade-in-down">
            Unleash Your Trading Potential
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed animate-fade-in-up">
            Our platform is engineered with cutting-edge features to give you a decisive edge in the competitive world of prop firm trading.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-gray-900/50 backdrop-blur-lg p-8 rounded-2xl border border-gray-700/50 transition-all duration-300 group hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10"
              style={{ animation: `fade-in-zoom 0.5s ease-out ${index * 0.1}s forwards`, opacity: 0 }}
            >
              <div className="mb-6 text-center">
                <div className="inline-block p-4 bg-gray-800/50 rounded-full group-hover:bg-blue-500/20 transition-all duration-300">
                  {React.cloneElement(feature.icon, { className: `${feature.icon.props.className} group-hover:scale-110 transition-transform duration-300` })}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white text-center mb-4 group-hover:text-blue-400 transition-colors">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed text-center">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
