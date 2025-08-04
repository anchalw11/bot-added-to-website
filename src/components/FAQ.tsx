import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Briefcase, Shield, Zap, DollarSign, Clock } from 'lucide-react';
import Header from './Header';

const FAQ: React.FC = () => {
  const [open, setOpen] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpen(open === index ? null : index);
  };

  const faqCategories = [
    {
      category: "General Questions",
      icon: <HelpCircle className="w-6 h-6" />,
      questions: [
        {
          question: "What is TraderEdge Pro?",
          answer: "TraderEdge Pro is an all-in-one platform designed to help traders successfully pass proprietary firm challenges and manage their funded accounts. We provide custom trading plans, advanced risk management tools, real-time signals, and expert support."
        },
        {
          question: "Who is this service for?",
          answer: "Our service is for both aspiring and experienced traders who want to get funded by prop firms. Whether you're new to prop firm challenges or a seasoned trader looking for an edge, our tools can help you achieve your goals."
        },
      ]
    },
    {
      category: "Prop Firms & Challenges",
      icon: <Briefcase className="w-6 h-6" />,
      questions: [
        {
          question: "Which prop firms do you support?",
          answer: "We support over 150 of the top prop firms in the industry, including FTMO, MyForexFunds, The5%ers, and many more. Our platform automatically extracts the rules and objectives for your selected firm and challenge type."
        },
        {
          question: "How does the trading plan work?",
          answer: "Our proprietary algorithm generates a personalized, multi-phase trading plan based on your selected prop firm, account size, and risk tolerance. It provides clear guidelines on position sizing, daily loss limits, and profit targets to keep you on track."
        },
        {
            question: "How long does it take to clear a challenge?",
            answer: "The time it takes to clear a challenge varies depending on the prop firm and your trading performance. Our tools and strategies are designed to help you clear challenges as quickly as possible, often within the first month."
        }
      ]
    },
    {
        category: "Billing & Subscriptions",
        icon: <DollarSign className="w-6 h-6" />,
        questions: [
            {
                question: "What are the subscription options?",
                answer: "We offer several subscription tiers, including a monthly and a yearly plan. We also have a free Kickstarter plan for those who use our affiliate links with supported prop firms. You can find more details on our Pricing page."
            },
            {
                question: "Can I cancel my subscription?",
                answer: "Yes, you can cancel your subscription at any time from your account dashboard. There are no long-term contracts or hidden fees. Your access will continue until the end of your current billing period."
            }
        ]
    },
    {
      category: "Security & Support",
      icon: <Shield className="w-6 h-6" />,
      questions: [
        {
          question: "Is my trading account information secure?",
          answer: "Absolutely. We use state-of-the-art encryption and security protocols to protect your data. We do not have direct access to your trading accounts or funds. Our platform only requires read-only data to track performance."
        },
        {
          question: "What kind of support do you offer?",
          answer: "We offer 24/7 expert support from a team of experienced traders and technical staff. You can reach us via live chat, email, or through our dedicated Discord community for members."
        }
      ]
    }
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
            Knowledge Base
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed animate-fade-in-up">
            Your questions, answered. Explore our FAQ to find the information you need to start your journey with TraderEdge Pro.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          {faqCategories.map((category, catIndex) => (
            <div key={catIndex} className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                {category.icon}
                {category.category}
              </h2>
              <div className="space-y-4">
                {category.questions.map((faq, index) => (
                  <div key={index} className="bg-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 overflow-hidden animate-fade-in-up" style={{animationDelay: `${0.4 + (catIndex * 0.2) + (index * 0.1)}s`}}>
                    <button
                      onClick={() => toggle(catIndex * 10 + index)}
                      className="w-full text-left flex justify-between items-center p-6 focus:outline-none"
                    >
                      <span className="text-xl font-medium text-white">{faq.question}</span>
                      <ChevronDown className={`w-6 h-6 text-blue-400 transform transition-transform ${open === (catIndex * 10 + index) ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`transition-max-height duration-500 ease-in-out ${open === (catIndex * 10 + index) ? 'max-h-screen' : 'max-h-0'}`}>
                      <div className="p-6 pt-0">
                        <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
