import React, { useState, useEffect } from 'react';
import './App.css';
import { LeadCaptureForm } from './components/Analytics';
import { DisclaimerBanner, FooterDisclaimer, HeaderWarning } from './components/DisclaimerBanner';
import { TermsOfService, PrivacyPolicy, Disclaimer } from './components/LegalPages';
import EnhancedHomePage from './components/EnhancedHomePage';
import NewsBar, { NewsSidebar } from './components/NewsBar';
import AIAnalysisPage from './components/AIAnalysisPage';
import PayPalButton from './PayPalButton';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [marketData, setMarketData] = useState({});
  const [listings, setListings] = useState([]);
  const [userAnalytics, setUserAnalytics] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState('');

  // URL routing
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/browse') setCurrentPage('browse');
    else if (path === '/premium') setCurrentPage('premium');
    else if (path === '/register') setCurrentPage('register');
    else if (path === '/login') setCurrentPage('login');
    else if (path === '/ai-analysis') setCurrentPage('ai-analysis');
    else setCurrentPage('home');
  }, []);

  // Update page and URL
  const navigateToPage = (page) => {
    setCurrentPage(page);
    window.history.pushState({}, '', `/${page === 'home' ? '' : page}`);
  };

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
    fetchStats();
    fetchMarketData();
    fetchListings();
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchMarketData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/market-data`);
      const data = await response.json();
      setMarketData(data);
    } catch (error) {
      console.error('Error fetching market data:', error);
    }
  };

  const fetchListings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/listings`);
      const data = await response.json();
      setListings(data.listings || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        const data = await response.json();
        setToken(data.access_token);
        setUser(data.user);
        localStorage.setItem('token', data.access_token);
        setCurrentPage('dashboard');
      } else {
        alert('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
    setLoading(false);
  };

  const handleRegister = async (userData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (response.ok) {
        const data = await response.json();
        setToken(data.access_token);
        setUser(data.user);
        localStorage.setItem('token', data.access_token);
        setCurrentPage('dashboard');
      } else {
        const errorData = await response.json();
        alert(errorData.detail || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    setCurrentPage('home');
  };

  // Components
  const Header = () => (
    <header className="bg-slate-900 text-white shadow-2xl border-b-2 border-orange-500">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🛢️</div>
              <h1 className="text-2xl font-bold cursor-pointer text-orange-300 hover:text-orange-200 transition-colors" onClick={() => setCurrentPage('home')}>
                Oil & Gas Finder
              </h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <button 
                onClick={() => navigateToPage('home')}
                className={`hover:text-orange-300 font-semibold ${currentPage === 'home' ? 'text-orange-300 border-b-2 border-orange-300' : ''}`}
              >
                Home
              </button>
              <button 
                onClick={() => navigateToPage('browse')}
                className={`hover:text-orange-300 font-semibold ${currentPage === 'browse' ? 'text-orange-300 border-b-2 border-orange-300' : ''}`}
              >
                Browse Traders
              </button>
              <button 
                onClick={() => navigateToPage('ai-analysis')}
                className={`hover:text-orange-300 font-semibold ${currentPage === 'ai-analysis' ? 'text-orange-300 border-b-2 border-orange-300' : ''}`}
              >
                Product Analysis
              </button>
              <button 
                onClick={() => navigateToPage('premium')}
                className={`hover:text-orange-300 font-semibold ${currentPage === 'premium' ? 'text-orange-300 border-b-2 border-orange-300' : ''}`}
              >
                Premium
              </button>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-300">Welcome, {user.first_name}</span>
                <button 
                  onClick={() => setCurrentPage('dashboard')}
                  className="bg-orange-600 hover:bg-orange-500 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Dashboard
                </button>
                <button 
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setCurrentPage('login')}
                  className="hover:text-orange-300 font-semibold"
                >
                  Login
                </button>
                <button 
                  onClick={() => setCurrentPage('register')}
                  className="bg-orange-600 hover:bg-orange-500 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );

  const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      handleLogin(email, password);
    };

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🛢️</div>
            <h2 className="text-2xl font-bold text-gray-900">Login to Oil & Gas Finder</h2>
            <p className="text-gray-600 mt-2">Access global energy trading network</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white py-2 rounded-lg font-semibold disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p className="text-center mt-4 text-gray-600">
            Don't have an account?{' '}
            <button 
              onClick={() => setCurrentPage('register')}
              className="text-orange-600 hover:text-orange-500 font-semibold"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    );
  };

  const RegisterPage = () => {
    const [formData, setFormData] = useState({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      company_name: '',
      phone: '',
      country: '',
      trading_role: 'both'
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      handleRegister(formData);
    };

    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🛢️</div>
            <h2 className="text-2xl font-bold text-gray-900">Join Oil & Gas Finder</h2>
            <p className="text-gray-600 mt-2">Connect with global energy markets</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white py-2 rounded-lg font-semibold disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center mt-4 text-gray-600">
            Already have an account?{' '}
            <button 
              onClick={() => setCurrentPage('login')}
              className="text-orange-600 hover:text-orange-500 font-semibold"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    );
  };

  const PremiumPage = () => {
    const subscriptionPlans = [
      {
        id: 'premium_basic',
        name: 'Energy Trader',
        price: 10,
        features: [
          'Enhanced listing visibility',
          'Basic market analytics',
          'Priority customer support',
          'Up to 20 listings per month',
          'Email market alerts'
        ]
      },
      {
        id: 'premium_advanced',
        name: 'Energy Pro',
        price: 25,
        popular: true,
        features: [
          'Everything in Energy Trader',
          'Advanced market intelligence',
          'Unlimited featured listings',
          'Real-time price alerts',
          'Connection recommendations',
          'API access for data'
        ]
      },
      {
        id: 'enterprise',
        name: 'Energy Enterprise',
        price: 45,
        features: [
          'Everything in Energy Pro',
          'Dedicated account manager',
          'Custom market reports',
          'White-label solutions',
          'Priority technical support',
          'Custom integrations'
        ]
      }
    ];

    const handleSubscriptionSelect = (planId) => {
      setSelectedTier(planId);
      setShowPaymentModal(true);
    };

    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Choose Your Energy Trading Plan</h1>
            <p className="text-xl text-gray-600">Unlock advanced features and grow your energy trading business</p>
          </div>

          {/* Demo Request Form */}
          <div className="max-w-md mx-auto mb-12">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-orange-800 mb-2">Want to See Premium Features?</h3>
              <p className="text-orange-600 mb-4">Schedule a personalized demo and see how premium features can grow your energy business.</p>
              <LeadCaptureForm 
                formType="demo_request"
                title=""
                description=""
                buttonText="Request Demo"
                fields={['email', 'name', 'company']}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {subscriptionPlans.map((plan) => (
              <div key={plan.id} className={`relative bg-white rounded-lg shadow-lg p-8 ${plan.popular ? 'ring-2 ring-orange-500 scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-orange-600 mb-2">${plan.price}</div>
                  <div className="text-gray-600">per month</div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscriptionSelect(plan.id)}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    plan.popular 
                      ? 'bg-orange-600 hover:bg-orange-500 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  {user?.role === 'basic' ? 'Upgrade Now' : 'Switch Plan'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const BrowsePage = () => (
    <div className="flex min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-12">Browse Oil & Gas Traders</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map((listing, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold">{listing.title}</h3>
                  {listing.is_featured && (
                    <span className="bg-orange-500 text-white px-2 py-1 rounded text-sm">Featured</span>
                  )}
                </div>
                <p className="text-gray-600 mb-2 font-semibold">{listing.product_type?.replace('_', ' ').toUpperCase()}</p>
                <p className="text-gray-600 mb-2">Quantity: {listing.quantity} {listing.unit}</p>
                <p className="text-gray-600 mb-2">Location: {listing.location}</p>
                <p className="text-gray-600 mb-4">Price: {listing.price_range}</p>
                <button className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg w-full font-semibold transition-colors">
                  Connect with Trader
                </button>
              </div>
            ))}
          </div>
          
          {listings.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛢️</div>
              <p className="text-gray-600 mb-4">No listings found.</p>
              <button
                onClick={() => setCurrentPage('register')}
                className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold"
              >
                Create Account to Post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar for News */}
      <div className="w-80 bg-white shadow-lg p-6 overflow-y-auto">
        <NewsSidebar />
      </div>
    </div>
  );

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage />;
      case 'register':
        return <RegisterPage />;
      case 'premium':
        return <PremiumPage />;
      case 'browse':
        return <BrowsePage />;
      case 'ai-analysis':
        return <AIAnalysisPage />;
      case 'terms':
        return <TermsOfService />;
      case 'privacy':
        return <PrivacyPolicy />;
      case 'disclaimer':
        return <Disclaimer />;
      default:
        return <EnhancedHomePage />;
    }
  };

  return (
    <div className="App">
      <DisclaimerBanner />
      <HeaderWarning />
      <NewsBar />
      <Header />
      {renderCurrentPage()}
      
      {/* Newsletter Signup Section */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Get Weekly Energy Market Insights
            </h3>
            <p className="text-orange-100 mb-8 max-w-2xl mx-auto">
              Join 10,000+ energy professionals receiving exclusive market analysis, trading opportunities, and industry insights.
            </p>
            <LeadCaptureForm 
              formType="newsletter"
              title=""
              description=""
              buttonText="Subscribe to Market Insights"
              fields={['email']}
            />
          </div>
        </div>
      </div>
      
      <FooterDisclaimer />
    </div>
  );
}

export default App;