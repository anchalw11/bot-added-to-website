import React from 'react';
import { Users, TrendingUp, Shield, Globe, Cpu, Zap } from 'lucide-react';
import Header from './Header';

const About: React.FC = () => {
  const teamMembers = [
    { name: "Alex 'Cipher' Volkov", role: "Founder & Lead Strategist", image: "AV" },
    { name: "Dr. Evelyn Reed", role: "Quantitative Analyst", image: "ER" },
    { name: "Jaxon 'Jax' Carter", role: "Lead Developer", image: "JC" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white overflow-hidden">
      <Header />
      <div className="absolute inset-0 z-0 pt-16">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20"></div>
      </div>
      <div className="container mx-auto px-4 py-24 relative z-10 pt-32">
        <div className="text-center mb-20">
          <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-6 animate-fade-in-down">
            Pioneering the Future of Trading
          </h1>
          <p className="text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed animate-fade-in-up">
            TraderEdge Pro was forged from a single, powerful idea: to democratize institutional-grade trading technology and empower individual traders to compete on a level playing field. We are more than a service; we are your strategic partner in navigating the complexities of the financial markets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
          <div className="bg-gray-900/50 backdrop-blur-lg p-8 rounded-2xl border border-gray-700/50 text-center animate-fade-in-zoom" style={{animationDelay: '0.2s'}}>
            <Globe className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Our Mission</h3>
            <p className="text-gray-400">To provide traders with an unfair advantage through superior technology, data-driven strategies, and unwavering support.</p>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-lg p-8 rounded-2xl border border-gray-700/50 text-center animate-fade-in-zoom" style={{animationDelay: '0.4s'}}>
            <Cpu className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Our Vision</h3>
            <p className="text-gray-400">To be the most trusted and innovative platform for prop firm traders globally, setting new standards for success and transparency.</p>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-lg p-8 rounded-2xl border border-gray-700/50 text-center animate-fade-in-zoom" style={{animationDelay: '0.6s'}}>
            <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Our Philosophy</h3>
            <p className="text-gray-400">Discipline, precision, and continuous adaptation are the pillars of profitable trading. Our tools are built to reinforce these core principles.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
