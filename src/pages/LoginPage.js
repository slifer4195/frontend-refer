import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import '../style/login.css';
import { AuthContext } from '../components/AuthContext';
import API_URL from '../config/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { setLoggedIn, setCurrentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle Google OAuth callback
  useEffect(() => {
    const googleSuccess = searchParams.get('google_success');
    const error = searchParams.get('error');
    
    if (googleSuccess === 'true') {
      // Check if user is logged in
      fetch(`${API_URL}/google/check`, {
        method: 'POST',
        credentials: 'include',
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setLoggedIn(true);
            setCurrentUser({ company_name: data.company_name, email: data.email });
            navigate('/profile', { replace: true });
          }
        })
        .catch(err => {
          console.error('Error checking Google login:', err);
        });
    } else if (error === 'google_auth_failed') {
      setMessage('Google authentication failed. Please try again.');
    }
  }, [searchParams, setLoggedIn, setCurrentUser, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        console.log("✅ Logged in as:", data.email);
        setLoggedIn(true);
        setCurrentUser({ company_name: data.company_name, email: data.email });
        // force navigate after state update
        setTimeout(() => navigate('/profile', { replace: true }), 200);
      } else {
        setMessage(data.error || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setMessage('Error connecting to server');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Login</h1>
        <br />
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">LOGIN</button>
        </form>
        
        <div className="divider">
          <span>OR</span>
        </div>
        
        <button 
          type="button" 
          className="google-signin-btn"
          onClick={() => window.location.href = `${API_URL}/google/login?origin=` + encodeURIComponent(window.location.origin)}
        >
          <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
        
        <p>{message}</p>
        <p className="forgot-password-link">
          <Link className="forgot-password" to="/reset-password">Forgot password?</Link>
        </p>
        <p className="register-link">
          Don't have an account?{' '}
          <Link className="register" to="/register">Sign up to register</Link>
        </p>
      </div>
    </div>
  );
}
