import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/register.css';

export default function RegisterPage() {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // "success" or "error"
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('https://api.bluepoint.click/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // <--- important for session/cookies
        body: JSON.stringify({ company_name: companyName, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('✅ Registration successful! Redirecting to login...');
        setMessageType('success');
        setTimeout(() => {
          navigate('/login', { state: { email } });
        }, 1500);
      } else {
        setMessage(data.error || 'Registration failed. Please try again.');
        setMessageType('error');
      }
    } catch (err) {
      console.error(err);
      setMessage('⚠️ Something went wrong. Please try again later.');
      setMessageType('error');
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h1>Register</h1>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Register</button>
        </form>

        {message && (
          <p className={`message ${messageType}`}>
            {message}
          </p>
        )}

        <p className="register-link">
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
}
