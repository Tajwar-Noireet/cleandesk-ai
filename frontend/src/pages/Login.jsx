import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../supabaseClient';
import Logo from '../components/Logo';

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
      <motion.section 
        className="auth-left-panel"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="auth-logo-row">
          <Link to="/" className="auth-brand-text" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <Logo size={28} dark={false} />
          </Link>
        </div>

        {/* Real Product Surface Preview */}
        <div className="auth-product-preview-container">
          <div className="auth-preview-card mini-inbox-card animate-float-1">
            <div className="preview-card-header">
              <span className="dot" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563EB', marginRight: '0.4rem' }}></span>
              <strong>Active Customer Enquiry</strong>
            </div>
            <p className="preview-card-body">"I need an end of tenancy clean for my 2-bed apartment next Wednesday. Do you provide supplies?"</p>
          </div>

          <div className="auth-preview-card lead-checklist-card animate-float-2">
            <div className="preview-card-header">
              <strong style={{ color: '#0A0A0A' }}>📋 Automated Capture Checklist</strong>
            </div>
            <div className="checklist-items">
              <span className="check-item-span check-filled">✓ Service: End of Tenancy</span>
              <span className="check-item-span check-filled">✓ Date: Next Wednesday</span>
              <span className="check-item-span check-empty">☐ Phone Number (capturing...)</span>
            </div>
          </div>

          <div className="auth-preview-card booking-outcome-card animate-float-3">
            <div className="preview-card-header">
              <span className="dot" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16A34A', marginRight: '0.4rem' }}></span>
              <strong>Operation Outcome</strong>
            </div>
            <p className="preview-card-body">Lead qualified & saved. Ticket created in Owner CRM.</p>
          </div>
        </div>

        <div className="auth-welcome-message" style={{ marginTop: '2rem' }}>
          <h2>The operations workspace for service business owners.</h2>
          <p>Login to clean your scheduling queue, audit conversations, and manage service knowledge bases.</p>
        </div>
      </motion.section>

      {/* Right side: Auth Form Panel */}
      <main className="auth-right-panel">
        <motion.div 
          className="glass-auth-card"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
        >
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

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                key="error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="login-error-alert"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="form-message-alert success" 
                style={{ marginBottom: '1.5rem', fontSize: '0.85rem' }}
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

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
                  className="auth-toggle-password"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                >
                  {passwordVisible ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            {isRegistering && (
              <div className="form-group">
                <label className="form-label" htmlFor="auth-confirm-password">Confirm Password</label>
                <input
                  id="auth-confirm-password"
                  type={passwordVisible ? 'text' : 'password'}
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
        </motion.div>
      </main>
    </div>
  );
};

export default Login;
