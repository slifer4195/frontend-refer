import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../style/login.css';
import { AuthContext } from '../components/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { setLoggedIn, setCurrentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://api.bluepoint.click/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        console.log("✅ Logged in as:", data.email);
        setLoggedIn(true);
        setCurrentUser(data.email);
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
            placeholder="Username"
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
        <p>{message}</p>
        <p className="register-link">
          Don’t have an account?{' '}
          <Link className="register" to="/register">Sign up to register</Link>
        </p>
      </div>
    </div>
  );
}
