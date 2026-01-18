import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/test.css';
import API_URL from '../config/api';

export default function TestPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  const handlePing = async () => {
    try {
      const res = await fetch(`${API_URL}/ping`, {
        credentials: 'include',
      });
      const text = await res.text();
      alert(`Response from server: ${text}`);
    } catch (err) {
      console.error('Ping failed', err);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      console.log('Logout Response:', data);
      setCurrentUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${API_URL}/me`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Not authenticated');
      const user = await res.json();

      // Only allow admin access
      if (user.email !== 'slifer4195@gmail.com') {
        navigate('/profile');
        return;
      }

      setCurrentUser(user);
    } catch (err) {
      console.error('Failed to fetch current user', err);
      navigate('/login');
    }
  };

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/user-customer`, {
        credentials: 'include',
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const res = await fetch(`${API_URL}/user_delete/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to delete user');
      }

      await fetchData();
    } catch (err) {
      console.error('Delete user error:', err);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchData();
  }, []);

  if (!currentUser) {
    return <p>Loading...</p>;
  }

  return (
    <div className="test-page">
      <h1>Admin Test Page</h1>

      <div className="section">
        <h2>List of users and their customers</h2>
        {data.length === 0 ? (
          <p>No users found.</p>
        ) : (
          data.map((user) => (
            <div key={user.user_id} className="user-card">
              <div className="user-header">
                <h4>
                  {user.company_name} ({user.email})
                </h4>
                <button
                  style={{ background: 'red', marginTop: '0.5rem' }}
                  onClick={() => handleDeleteUser(user.user_id)}
                >
                  Delete User
                </button>
              </div>

              <div className="customers-list">
                {user.customers.length === 0 ? (
                  <p>No customers linked.</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Points</th>
                        <th>Last Reminder</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.customers.map((c) => (
                        <tr key={c.customer_id}>
                          <td>{c.email}</td>
                          <td>{c.points}</td>
                          <td>{c.last_reminder_sent || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="section">
        <button onClick={handlePing}>Send Ping</button>
        <button onClick={handleLogout} style={{ marginLeft: '1rem' }}>
          Logout
        </button>
      </div>
    </div>
  );
}
