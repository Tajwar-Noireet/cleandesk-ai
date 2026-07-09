import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../supabaseClient';
import Logo from '../components/Logo';
import { ShieldIcon, ArrowRightIcon } from '../components/Icons';

const CustomerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  const handleCustomerAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const isSupabaseConfigured = 
      import.meta.env.VITE_SUPABASE_URL && 
      import.meta.env.VITE_SUPABASE_URL !== 'https://your-project.supabase.co';

    if (!isSupabaseConfigured) {
      // Mock Offline Mode: Allow passwordless demo login
      setTimeout(() => {
        setLoading(false);
        if (email.trim() === '') {
          setError('Please provide a valid email address.');
          return;
        }
        localStorage.setItem('sb-access-token', 'mock-customer-token');
        localStorage.setItem('cd-customer-email', email.toLowerCase().trim());
        localStorage.setItem('cd-user-role', 'customer');
        setSuccess('Logged in successfully (Demo Mode)!');
        setTimeout(() => navigate('/customer/dashboard'), 800);
      }, 1000);
      return;
    }

    // Production Supabase Mode
    try {
      if (isRegistering) {
        // Customer Sign Up
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role: 'customer' }
          }
        });
        if (signUpErr) throw signUpErr;
        setSuccess('Account created! Please sign in or check your email verification.');
        setIsRegistering(false);
      } else {
        // Customer Sign In
        const { data, error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signInErr) throw signInErr;

        localStorage.setItem('cd-user-role', 'customer');
        setSuccess('Welcome back! Directing to portal...');
        setTimeout(() => navigate('/customer/dashboard'), 800);
      }
    } catch (err) {
      console.error('Customer Auth Error:', err.message);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-layout customer-auth-theme" style={{ backgroundColor: '#F8F8F7' }}>
      {/* Left marketing info panel */}
      <motion.section 
        className="auth-left-panel"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ borderRight: '1px solid var(--color-border)' }}
      >
        <div className="auth-logo-row">
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <Logo size={28} dark={false} />
          </Link>
        </div>

        <div className="auth-product-preview-container" style={{ margin: 'auto 0' }}>
          <div className="auth-preview-card mini-inbox-card" style={{ transform: 'none', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 'bold' }}>Step 1</span>
            <h4 style={{ margin: '0.2rem 0', color: '#0A0A0A' }}>Submit service requests</h4>
            <p className="preview-card-body" style={{ margin: '0.2rem 0' }}>Choose a business, select a service, and send an enquiry online.</p>
          </div>
          <div className="auth-preview-card lead-checklist-card" style={{ transform: 'none', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#2563EB', fontWeight: 'bold' }}>Step 2</span>
            <h4 style={{ margin: '0.2rem 0', color: '#0A0A0A' }}>Track every business</h4>
            <p className="preview-card-body" style={{ margin: '0.2rem 0' }}>See requests, bookings, and conversations grouped by service provider.</p>
          </div>
          <div className="auth-preview-card booking-outcome-card" style={{ transform: 'none' }}>
            <span style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: 'bold' }}>Step 3</span>
            <h4 style={{ margin: '0.2rem 0', color: '#0A0A0A' }}>Keep your trail</h4>
            <p className="preview-card-body" style={{ margin: '0.2rem 0' }}>Use the same email from your enquiry to pull requests into this portal.</p>
          </div>
        </div>

        <div className="auth-welcome-message" style={{ marginTop: '2rem' }}>
          <h2>View marketplace requests in one place.</h2>
          <p>Access your enquiries, conversations, and booking updates across CleanDesk businesses.</p>
        </div>
      </motion.section>

      {/* Right form panel */}
      <main className="auth-right-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div 
          className="glass-auth-card"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
          style={{ width: '100%', maxWidth: '400px' }}
        >
          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <span className="pill status-new" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer Portal</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0 0.2rem 0', color: '#0A0A0A' }}>
              {isRegistering ? 'Create Customer Account' : 'Customer Access Login'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>
              {isRegistering 
                ? 'Register to manage your quotes and schedules'
                : 'Use the same email from your enquiry to track marketplace records'
              }
            </p>
          </div>

          <div className="auth-tabs" style={{ marginBottom: '1.5rem' }}>
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

          <form onSubmit={handleCustomerAuth} className="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="cust-email">Email Address</label>
              <input
                id="cust-email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@email.com"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="cust-password">Password</label>
              <input
                id="cust-password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!isRegistering ? true : true} /* Required for custom logins */
                placeholder="Password"
                disabled={loading}
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary btn-full-width" 
              disabled={loading}
              style={{ marginTop: '0.5rem', height: '42px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {loading ? 'Authenticating...' : isRegistering ? 'Register' : 'Access requests'}
              {!loading && <ArrowRightIcon size={14} />}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: '#6B7280' }}>
            Looking for business operations?{' '}
            <Link to="/login" style={{ color: '#2563EB', fontWeight: '600' }}>Owner Dashboard</Link>
          </div>

          <div className="trust-badge-row" style={{ marginTop: '1.5rem' }}>
            <ShieldIcon size={14} style={{ marginRight: '0.3rem', color: '#6B7280' }} />
            <span>Secure encryption powered by Supabase Auth</span>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default CustomerLogin;
