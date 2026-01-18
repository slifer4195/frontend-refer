import React, { useEffect, useState, useMemo } from 'react';
import PointsModal from './PointsModal'; // adjust path as needed
import '../style/functionality.css';
import API_URL from '../config/api';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [customers, setCustomers] = useState([]);
  // const [customerCount, setCustomerCount] = useState(null);
  const [items, setItems] = useState([]); // menu items state
  const [error, setError] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUser();
    fetchCustomers();
    // fetchCustomerCount();
    fetchMenu(); // fetch menu on mount
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/me`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Not logged in');
      const data = await res.json();
      setUser(data);
    } catch (err) {
      setError('Unable to fetch user');
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_URL}/customers`, {
        credentials: 'include',
      });
      const data = await res.json();

      const customersWithPoints = await Promise.all(
        data.map(async (customer) => {
          try {
            const pointRes = await fetch(`${API_URL}/customer_point/${customer.id}`, {
              credentials: 'include',
            });
            if (!pointRes.ok) throw new Error('Failed to fetch points');
            const pointData = await pointRes.json();
            return { ...customer, points: pointData.points };
          } catch {
            return { ...customer, points: 'N/A' };
          }
        })
      );

      setCustomers(customersWithPoints);
    } catch (err) {
      console.error('Failed to fetch customers', err);
      setError('Failed to fetch customers');
    }
  };

  // Filter and sort customers based on search query
  const filteredAndSortedCustomers = useMemo(() => {
    if (!searchQuery.trim()) {
      return customers;
    }

    const query = searchQuery.toLowerCase();
    const matching = customers.filter(customer => 
      customer.email.toLowerCase().includes(query)
    );
    const nonMatching = customers.filter(customer => 
      !customer.email.toLowerCase().includes(query)
    );
    
    // Put matching customers at the top
    return [...matching, ...nonMatching].map((customer, index, array) => ({
      ...customer,
      isMatch: matching.includes(customer),
      isTopMatch: matching.includes(customer) && index === 0
    }));
  }, [customers, searchQuery]);


  const fetchMenu = async () => {
    try {
      const res = await fetch(`${API_URL}/list_menu`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (!data.error) {
        setItems(data);
      } else {
        setError('Failed to fetch menu items');
      }
    } catch (err) {
      console.error('Failed to fetch menu items', err);
      setError('Failed to fetch menu items');
    }
  };

  const handleUsePoint = (customer) => {
    setSelectedCustomer(customer);
  };

  const closePopup = () => setSelectedCustomer(null);

  const handleRedeemItem = async (item) => {
    try {
        const res = await fetch(`${API_URL}/deduct_point/${selectedCustomer.id}/${item.id}`, {
        method: 'GET',
        credentials: 'include',
      });
  
      const data = await res.json(); 
  
      if (!res.ok) {
        alert(data.error || 'Failed to redeem points');
        return;
      }
      // Update points locally with server response
      setCustomers((prev) =>
        prev.map((c) => 
          c.id === selectedCustomer.id
            ? { ...c, points: data.points }
            : c
        )
      );
  
      alert(data.message || `Redeemed ${item.name} for ${item.required_points} points!`);
      closePopup();
    } catch (err) {
      console.error('Redeem item failed', err);
      alert('Error redeeming points');
    }
  };
  
  const handleSendEmail = async (customerEmail, customerId,customerPoints, point) => {
    if (loading) return; // block double-clicks
    setLoading(true);
    
    try {
      const sessionRes = await fetch(`${API_URL}/session`, {
        credentials: 'include',
      });
      if (!sessionRes.ok) throw new Error('Failed to fetch session');
      const sessionData = await sessionRes.json();
      const userId = sessionData.user_id;

      console.log('Sending email to customer ID:', customerId, 'User ID:', userId);

      const messageBody = point >= 0
        ? `You earned ${point} points for ${user.company_name}! Your current point total is ${customerPoints + point}.`
        : `You redeemed ${Math.abs(point)} points at ${user.company_name}. Your current point total is ${customerPoints - point}.`;
    
      const res = await fetch(`${API_URL}/send-test-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          to: customerEmail,
          subject: `From: ${user.company_name}`,
          body: messageBody,
          user_id: userId,
          customer_id: customerId,
          point: point
        }),
      });

      const data = await res.json();
      if (res.ok) {
          // Update the points in state without refreshing
        if (typeof data.points !== "undefined") {
          setCustomers(prev =>
          prev.map(c =>
          c.id === customerId ? { ...c, points: data.points } : c
          )
        );
        alert(`${point} points have been sent to ${customerEmail}`);
        }
      } else {
        alert(data.error || 'Failed to send email.');
      }
    } catch (err) {
      console.error('Send email failed', err);
      alert('Error sending email.');
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="functionality-page">
      <div className="functionality-container">
            <h1>Reward Dashboard</h1>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* Search bar for filtering customers */}
            <div className="customer-search-bar">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers by email..."
                className="customer-search-input"
              />
            </div>

            <ul className="customer-list">
            {filteredAndSortedCustomers.map((customer) => (
              <li key={customer.id} className={`customer-item ${customer.isTopMatch ? 'top-match' : ''}`}>
                <div className="customer-info">
                  <span className="customer-email">{customer.email}</span>
                  <span className="customer-points">{customer.points !== undefined && customer.points !== 'N/A' ? customer.points : 0} pts</span>
                </div>
                <div className="customer-actions">
                  <button 
                    onClick={() => handleSendEmail(customer.email, customer.id,customer.points, 1)}
                    disabled={loading}
                    title="Award 1 point for a returning customer purchase"
                  >
                    Loyalty
                  </button>
                  <button 
                    onClick={() => handleSendEmail(customer.email, customer.id,customer.points, 2)}
                    disabled={loading}
                    title="Award 2 points when this customer refers a new customer"
                  >
                    Referral
                  </button>
                  <button 
                    onClick={() => handleUsePoint(customer)}
                    title="Allow customer to redeem points for menu items"
                  >
                    Redeem
                  </button>
                </div>
              </li>
            ))}
          </ul>

            <div className="menu-items-section">
              <h2 className="menu-items-title">Menu Items ({items.length})</h2>
              {items.length > 0 ? (
                <ul className="menu-items-list">
                  {items.map((item) => (
                    <li key={item.id} className="menu-item-card">
                      <div className="menu-item-info">
                        <h4 className="item-name">{item.name}</h4>
                        <div className="item-details">
                          <div className="detail-badge price-badge">
                            <span className="detail-label">Price</span>
                            <span className="detail-value">${item.price.toFixed(2)}</span>
                          </div>
                          <div className="detail-badge points-badge">
                            <span className="detail-label">Points</span>
                            <span className="detail-value">{item.required_points}</span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="no-items">
                  <p>No menu items available. Add items from the Menu page.</p>
                </div>
              )}
            </div>

          <PointsModal
              customer={selectedCustomer}
              items={items}
              onClose={closePopup}
              onSubmit={handleRedeemItem}
            />
          </div>
    </div>
   
  );
}
