import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = navigateHookHelper();

  function navigateHookHelper() {
    try {
      return useNavigate();
    } catch {
      return () => {};
    }
  }

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Input Validation
    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (isRegistering && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    // Clear cached business / tenant states to prevent tenant leaks
    localStorage.removeItem('businessId');
    sessionStorage.removeItem('businessId');
    localStorage.removeItem('cd_business_id');
    sessionStorage.removeItem('cd_business_id');
    localStorage.removeItem('cd_conv_d3b07384-d113-4ec5-a5d6-c6e7f8d9a101');

    const isSupabaseConfigured = 
      import.meta.env.VITE_SUPABASE_URL && 
      import.meta.env.VITE_SUPABASE_URL !== 'https://your-project.supabase.co';

    if (isSupabaseConfigured) {
      try {
        let authResult;
        if (isRegistering) {
          authResult = await supabase.auth.signUp({ email, password });
          if (!authResult.error) {
            setSuccess('Registration successful! Please check your email for a confirmation link.');
            setIsRegistering(false);
            setPassword('');
            setConfirmPassword('');
          }
        } else {
          authResult = await supabase.auth.signInWithPassword({ email, password });
          if (!authResult.error) {
            navigate('/dashboard');
          }
        }

        if (authResult.error) {
          throw authResult.error;
        }

        setLoading(false);
        return;
      } catch (err) {
        console.error('❌ Supabase Auth failed:', err.message);
        setError(err.message);
        setLoading(false);
        return;
      }
    }

    // Mock delay fallback
    setTimeout(() => {
      setLoading(false);
      if (email && password.length >= 6) {
        if (isRegistering) {
          setSuccess('Mock account created successfully! You can now log in.');
          setIsRegistering(false);
          setPassword('');
          setConfirmPassword('');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError('Please enter a valid email and password.');
      }
    }, 1000);
  };

  return (
    <div className="auth-split-layout">
      {/* Left side: Branding and Marketing Panel */}
      <section className="auth-left-panel">
        <div className="auth-logo-row">
          <Link to="/" className="auth-brand-text">
            <span style={{ fontSize: '1.6rem' }}>✨</span>
            <span>CleanDesk<span style={{ color: '#06b6d4' }}>.AI</span></span>
          </Link>
        </div>

        <div className="auth-welcome-message">
          <h2>Automate customer support for your business.</h2>
          <p>Deploy a virtual receptionist that answers FAQs, captures booking details, and routes priority issues to your team instantly.</p>
          
          <div className="auth-bullets-list">
            <div className="auth-bullet-item">
              <span className="auth-bullet-icon">⚡</span>
              <span>24/7 AI-driven support custom-tailored to your prices and coverage areas</span>
            </div>
            <div className="auth-bullet-item">
              <span className="auth-bullet-icon">⚡</span>
              <span>Structured lead slot extraction and customer status workflows</span>
            </div>
            <div className="auth-bullet-item">
              <span className="auth-bullet-icon">⚡</span>
              <span>Simple embeddable HTML script snippets to deploy onto any website</span>
            </div>
          </div>
        </div>

        {/* Abstract AI Node Workflow Graphic */}
        <div className="auth-vector-container">
          <svg width="280" height="200" viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
            <path d="M40 100 H240" stroke="url(#line-grad-1)" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M140 30 V170" stroke="url(#line-grad-2)" strokeWidth="1.5" />
            <path d="M40 100 L140 30 L240 100 L140 170 Z" stroke="url(#line-grad-3)" strokeWidth="1" strokeOpacity="0.4" />
            
            {/* Chat Node */}
            <g transform="translate(15, 75)">
              <rect width="50" height="50" rx="10" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
              <text x="25" y="31" fontSize="18" textAnchor="middle">💬</text>
              <circle cx="50" cy="0" r="4" fill="#06b6d4" />
            </g>

            {/* AI Receiver Node */}
            <g transform="translate(115, 75)">
              <rect width="50" height="50" rx="25" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="2" />
              <text x="25" y="32" fontSize="18" textAnchor="middle">🤖</text>
              <circle cx="25" cy="25" r="25" stroke="#8b5cf6" strokeOpacity="0.5" strokeWidth="1" />
            </g>

            {/* Lead CRM Node */}
            <g transform="translate(215, 75)">
              <rect width="50" height="50" rx="10" fill="#064e3b" stroke="#059669" strokeWidth="1.5" />
              <text x="25" y="32" fontSize="18" textAnchor="middle">🎯</text>
              <circle cx="0" cy="50" r="4" fill="#10b981" />
            </g>

            <circle cx="140" cy="30" r="6" fill="#8b5cf6" />
            <circle cx="140" cy="170" r="6" fill="#06b6d4" />

            <defs>
              <linearGradient id="line-grad-1" x1="40" y1="100" x2="240" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8b5cf6" />
                <stop offset="0.5" stopColor="#2563eb" />
                <stop offset="1" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="line-grad-2" x1="140" y1="30" x2="140" y2="170" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8b5cf6" />
                <stop offset="1" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="line-grad-3" x1="40" y1="100" x2="240" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8b5cf6" stopOpacity="0" />
                <stop offset="0.5" stopColor="#8b5cf6" stopOpacity="1" />
                <stop offset="1" stopColor="#06b6d4" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </section>

      {/* Right side: Auth Form Panel */}
      <main className="auth-right-panel">
        <div className="glass-auth-card">
          <div className="auth-tabs">
            <button 
              type="button" 
              className={`auth-tab-btn ${!isRegistering ? 'active' : ''}`}
              onClick={() => { setIsRegistering(false); setError(''); setSuccess(''); }}
            >
              Sign In
            </button>
            <button 
              type="button" 
              className={`auth-tab-btn ${isRegistering ? 'active' : ''}`}
              onClick={() => { setIsRegistering(true); setError(''); setSuccess(''); }}
            >
              Sign Up
            </button>
          </div>

          {error && <div className="login-error-alert">{error}</div>}
          {success && <div className="form-message-alert success" style={{ marginBottom: '1.5rem', fontSize: '0.85rem' }}>{success}</div>}

          <form onSubmit={handleAuthSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="auth-email">Email Address</label>
              <input
                id="auth-email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@business.com"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="auth-password">Password</label>
              <div className="auth-input-container">
                <input
                  id="auth-password"
                  type={passwordVisible ? 'text' : 'password'}
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  disabled={loading}
                  autoComplete={isRegistering ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  className="password-toggle-eye"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  title={passwordVisible ? 'Hide Password' : 'Show Password'}
                >
                  {passwordVisible ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {isRegistering && (
              <div className="form-group">
                <label className="form-label" htmlFor="auth-confirm-password">Confirm Password</label>
                <input
                  id="auth-confirm-password"
                  type="password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
            )}

            <button 
              type="submit" 
              className="btn-primary btn-full-width" 
              disabled={loading}
              style={{ marginTop: '0.5rem', height: '42px', fontWeight: '600' }}
            >
              {loading ? 'Authenticating...' : isRegistering ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="trust-badge-row">
            <span>🛡️</span>
            <span>Secure authentication powered by Supabase</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
