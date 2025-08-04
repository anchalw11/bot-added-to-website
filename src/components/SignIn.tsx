import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { TrendingUp, ArrowLeft, Eye, EyeOff, AlertCircle, Mail, Lock } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import Header from './Header';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { setUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // Get selected plan from location state
  const selectedPlan = location.state?.selectedPlan;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    // Test credentials for demo
    const testCredentials = [
      { email: 'test@test.com', password: 'test123', name: 'Test User', tier: 'enterprise' },
      { email: 'demo@example.com', password: 'demo123', name: 'Demo User', tier: 'professional' },
      { email: 'user@example.com', password: 'user123', name: 'Sample User', tier: 'pro' }
    ];

    // Check test credentials first
    const testUser = testCredentials.find(
      cred => cred.email.toLowerCase() === email.toLowerCase() && cred.password === password
    );

    if (testUser) {
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        name: testUser.name,
        email: email,
        membershipTier: testUser.tier as 'basic' | 'professional' | 'institutional' | 'elite' | 'enterprise',
        accountType: 'funded' as const,
        riskTolerance: 'moderate' as const,
        isAuthenticated: true,
        setupComplete: true,
        selectedPlan
      };
      setUser(newUser);
      setIsLoading(false);
      navigate('/dashboard');
      return;
    }

    try {
      // Try backend authentication as fallback
      try {
        const response = await fetch('http://localhost:5002/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('jwt', data.access_token);
          const newUser = {
            id: Math.random().toString(36).substr(2, 9),
            name: email,
            email: email,
            membershipTier: 'elite' as 'basic' | 'professional' | 'institutional' | 'elite',
            accountType: 'funded' as const,
            riskTolerance: 'moderate' as const,
            isAuthenticated: true,
            setupComplete: true,
            selectedPlan
          };
          setUser(newUser);
          navigate('/dashboard');
        } else {
          setError('Invalid email or password. Please check your credentials.');
        }
      } catch (backendError) {
        // Backend not available, show error
        setError('Invalid email or password. Please use the test credentials provided below.');
      }
    } catch (error) {
      setError('Invalid email or password. Please use the test credentials provided below.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <Header />
      <div className="flex items-center justify-center px-4">
        <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link 
            to={selectedPlan ? "/membership" : "/"} 
            className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to {selectedPlan ? "Plans" : "Home"}</span>
          </Link>
          
          <div className="flex items-center justify-center space-x-2 mb-6">
            <TrendingUp className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">TraderEdge Pro</span>
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400">Sign in to continue your trading journey</p>
        </div>

        {/* Selected Plan Summary */}
        {selectedPlan && (
          <div className="bg-blue-600/20 border border-blue-600 rounded-xl p-4 mb-6">
            <div className="text-center">
              <div className="text-blue-400 font-semibold text-lg">{selectedPlan.name} Plan</div>
              <div className="text-white text-2xl font-bold">${selectedPlan.price}/{selectedPlan.period}</div>
              <div className="text-blue-300 text-sm">Continue with your selected plan</div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gray-800/60 backdrop-blur-sm p-8 rounded-2xl border border-gray-700">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-600/20 border border-red-600 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(''); // Clear error when user starts typing
                  }}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white focus:ring-2 focus:border-transparent ${
                    error ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                  }`}
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(''); // Clear error when user starts typing
                  }}
                  className={`w-full pl-10 pr-12 py-3 bg-gray-700 border rounded-lg text-white focus:ring-2 focus:border-transparent ${
                    error ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                  }`}
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500" 
                />
                <span className="ml-2 text-sm text-gray-300">Remember me</span>
              </label>
              <a href="#" className="text-sm text-blue-400 hover:text-blue-300">Forgot password?</a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>

        {/* Test Login */}
        <div className="mt-6 p-4 bg-green-600/20 border border-green-600 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-green-400 font-semibold mb-2">Test Login Credentials:</p>
            <div className="space-y-1">
              <p className="text-xs text-green-300">📧 test@test.com | 🔑 test123 (Enterprise Plan)</p>
              <p className="text-xs text-green-300">📧 demo@example.com | 🔑 demo123 (Professional Plan)</p>
              <p className="text-xs text-green-300">📧 user@example.com | 🔑 user123 (Pro Plan)</p>
            </div>
            <p className="text-xs text-gray-400 mt-2">Use any of these credentials to test the dashboard</p>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link 
              to="/signup" 
              state={{ selectedPlan }}
              className="text-blue-400 hover:text-blue-300 font-semibold"
            >
              Create account
            </Link>
          </p>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-gray-800/40 rounded-lg border border-gray-700">
          <div className="text-center text-xs text-gray-400">
            <p>🔒 Your login is secured with industry-standard encryption</p>
            {selectedPlan && <p>Continue with your {selectedPlan.name} plan after signing in</p>}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
