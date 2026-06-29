import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('owner@sparklehome.co.uk');
  const [password, setPassword] = useState('password123');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // TODO: Connect Supabase Auth in Phase 3
    // if (isRegistering) {
    //   const { data, error } = await supabase.auth.signUp({ email, password });
    // } else {
    //   const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    // }

    // Mock delay
    setTimeout(() => {
      setLoading(false);
      // Log in with mock credentials
      if (email && password.length >= 6) {
        navigate('/dashboard');
      } else {
        setError('Please enter a valid email and password (minimum 6 characters).');
      }
    }, 800);
  };

  return (
    <div className="login-page">
      <div className="login-nav">
        <Link to="/" className="login-logo">
          <span className="logo-icon">✨</span>
          <span className="logo-text">CleanDesk<span className="logo-accent">.AI</span></span>
        </Link>
      </div>

      <main className="login-container-box">
        <div className="login-card-inner">
          <h2 className="login-title">
            {isRegistering ? 'Create your owner account' : 'Welcome back, Owner'}
          </h2>
          <p className="login-subtitle">
            {isRegistering 
              ? 'Get started setting up your AI receptionist' 
              : 'Sign in to access your CleanDesk dashboard'}
          </p>

          {error && <div className="login-error-alert">{error}</div>}

          <form onSubmit={handleAuthSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@cleaningbusiness.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="btn-primary btn-full-width" disabled={loading}>
              {loading ? 'Authenticating...' : isRegistering ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="login-toggle-prompt">
            {isRegistering ? (
              <p>
                Already have an account?{' '}
                <button type="button" className="login-toggle-btn" onClick={() => setIsRegistering(false)}>
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{' '}
                <button type="button" className="login-toggle-btn" onClick={() => setIsRegistering(true)}>
                  Sign Up (Mock Mode)
                </button>
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
