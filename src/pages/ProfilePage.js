import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/profile.css';
import { AuthContext } from '../components/AuthContext';
import ConfirmationModal from '../components/ConfirmationModal';

export default function ProfilePage() {
  const { currentUser, loggedIn, setCurrentUser } = useContext(AuthContext);
  const [customers, setCustomers] = useState([]);
  const [customerCount, setCustomerCount] = useState(null);
  const [error, setError] = useState(null);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [companyError, setCompanyError] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, email: null });
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const navigate = useNavigate();

  // Fetch user data if logged in but currentUser is missing
  useEffect(() => {
    const fetchUserData = async () => {
      if (loggedIn && !currentUser) {
        try {
          const res = await fetch('http://127.0.0.1:5000/me', {
            credentials: 'include',
          });
          if (res.ok) {
            const userData = await res.json();
            setCurrentUser(userData);
          } else {
            console.error('Failed to fetch user data in ProfilePage');
          }
        } catch (err) {
          console.error('Error fetching user data in ProfilePage:', err);
        }
      }
    };
    fetchUserData();
  }, [loggedIn, currentUser, setCurrentUser]);

  // Always call hooks unconditionally
  useEffect(() => {
    console.log("Login status", loggedIn)
    if (!loggedIn) {
      navigate('/login'); // redirect if not logged in
      return;
    }

    const fetchCustomers = async () => {
      try {
        const res = await fetch('http://127.0.0.1:5000/customers', {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to fetch customers');
        const data = await res.json();

        // Fetch points for each customer
        const customersWithPoints = await Promise.all(
          data.map(async (customer) => {
            try {
              const pointRes = await fetch(`http://127.0.0.1:5000/customer_point/${customer.id}`, {
                credentials: 'include',
              });
              if (!pointRes.ok) throw new Error('Failed to fetch points');
              const pointData = await pointRes.json();
              return { ...customer, points: pointData.points };
            } catch {
              return { ...customer, points: 0 };
            }
          })
        );

        setCustomers(customersWithPoints);
      } catch (err) {
        console.error('Failed to fetch customers', err);
      }
    };

    const fetchCustomerCount = async () => {
      try {
        const res = await fetch('http://127.0.0.1:5000/customer-count', {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to fetch count');
        const data = await res.json();
        setCustomerCount(data.customer_count);
      } catch (err) {
        setError('Unable to fetch customer count');
      }
    };

    fetchCustomers();
    fetchCustomerCount();
  }, [loggedIn, navigate]);

  const handleDeleteClick = (email) => {
    setDeleteConfirmation({ isOpen: true, email });
  };

  const handleDeleteConfirm = async () => {
    const { email } = deleteConfirmation;
    if (!email) return;

    try {
      const res = await fetch('http://127.0.0.1:5000/delete-customer', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        // Refresh customers list and count after deletion
        const updatedCustomers = customers.filter(c => c.email !== email);
        setCustomers(updatedCustomers);
        setCustomerCount((prev) => prev - 1);
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      console.error('Delete customer failed', err);
    }
    setDeleteConfirmation({ isOpen: false, email: null });
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({ isOpen: false, email: null });
  };

  const handleEditCompany = () => {
    setIsEditingCompany(true);
    setNewCompanyName(currentUser?.company_name || '');
    setCompanyError(null);
  };

  const handleCancelEdit = () => {
    setIsEditingCompany(false);
    setNewCompanyName('');
    setCompanyError(null);
  };

  const handleSaveCompany = async () => {
    if (!newCompanyName.trim()) {
      setCompanyError('Company name cannot be empty');
      return;
    }

    try {
      const res = await fetch('http://127.0.0.1:5000/edit_company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ company_name: newCompanyName.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        // Update the currentUser in context
        setCurrentUser({ ...currentUser, company_name: newCompanyName.trim() });
        setIsEditingCompany(false);
        setNewCompanyName('');
        setCompanyError(null);
      } else {
        setCompanyError(data.error || 'Failed to update company name');
      }
    } catch (err) {
      console.error('Edit company failed', err);
      setCompanyError('Error connecting to server');
    }
  };

  const handleAddCustomer = async () => {
    if (!newCustomerEmail.trim()) {
      return;
    }

    try {
      const res = await fetch('http://127.0.0.1:5000/add-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: newCustomerEmail.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setNewCustomerEmail('');
        // Refresh customers list and count
        const fetchCustomers = async () => {
          try {
            const res = await fetch('http://127.0.0.1:5000/customers', {
              credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed to fetch customers');
            const data = await res.json();

            const customersWithPoints = await Promise.all(
              data.map(async (customer) => {
                try {
                  const pointRes = await fetch(`http://127.0.0.1:5000/customer_point/${customer.id}`, {
                    credentials: 'include',
                  });
                  if (!pointRes.ok) throw new Error('Failed to fetch points');
                  const pointData = await pointRes.json();
                  return { ...customer, points: pointData.points };
                } catch {
                  return { ...customer, points: 0 };
                }
              })
            );

            setCustomers(customersWithPoints);
          } catch (err) {
            console.error('Failed to fetch customers', err);
          }
        };

        const fetchCustomerCount = async () => {
          try {
            const res = await fetch('http://127.0.0.1:5000/customer-count', {
              credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed to fetch count');
            const data = await res.json();
            setCustomerCount(data.customer_count);
          } catch (err) {
            setError('Unable to fetch customer count');
          }
        };

        fetchCustomers();
        fetchCustomerCount();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error('Add customer failed', err);
      alert('Failed to add customer');
    }
  };

  if (!loggedIn) {
    return <p>Redirecting to login...</p>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className='top-profile'>
          <div className='company-info'>
            {error && <p className="error-message">{error}</p>}

            {currentUser ? (
              <div className="company-info">
                {isEditingCompany ? (
                  <div className="company-edit-section">
                    <div className="company-edit-input">
                      <label>
                        <strong>Company:</strong>
                        <input
                          type="text"
                          value={newCompanyName}
                          onChange={(e) => setNewCompanyName(e.target.value)}
                          placeholder="Enter company name"
                        />
                      </label>
                      {companyError && <p className="error-message">{companyError}</p>}
                    </div>
                    <div className="company-edit-buttons">
                      <button onClick={handleSaveCompany} className="save-btn">Save</button>
                      <button onClick={handleCancelEdit} className="cancel-btn">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p className="company-name">
                    <strong>Company:</strong> {currentUser.company_name}
                    <button onClick={handleEditCompany} className="edit-company-btn">Edit</button>
                  </p>
                )}
                <p className="email">
                  <strong>Email:</strong> {currentUser.email}
                </p>
                {customerCount !== null && (
                  <p className="customers">
                    <strong>Total Customers:</strong> {customerCount}
                  </p>
                )}
              </div>
            ) : (
              <p>Loading user...</p>
            )}

            <br />
            <h2 className="welcome-text">Welcome to your dashboard.</h2>
            <p>
              <strong>Getting Started: </strong> <br />
              Manage your customers’ emails directly from this Profile page. <br />
              Contact information for any assistance: slifer4195@gmail.com
            </p>
          </div>

          {/* Rewards Section */}
          <div className="programs-section">
            <h2>Our Reward Programs</h2>
            <ul>
              <li>
                <strong>Loyalty Program:</strong> Earn <strong>1 point</strong> each time a returning customer makes a purchase.
              </li>
              <li>
                <strong>Referral Program:</strong> Earn <strong>2 points</strong> whenever a customer you referred brings in a new customer.
              </li>
              <li>
                <strong>Reward Dashboard Page:</strong> Manage customers, update points, and remove accounts when needed.
              </li>
              <li>
                <strong>Menu Page:</strong> Create and display a list of services or items customers can redeem with their points.
              </li>
            </ul>
          </div>
        </div>

        <div className="customer-list-wrapper">
          <div className="customer-list">
            <h2 className='customer-title'>Customer List</h2>

            {/* Add Customer Form */}
            <div className="add-customer-form-profile">
              <input
                type="email"
                value={newCustomerEmail}
                onChange={(e) => setNewCustomerEmail(e.target.value)}
                placeholder="Add customer"
                autoComplete="off"
              />
              <button onClick={handleAddCustomer} className="add-customer-btn">Add</button>
            </div>

            <ul>
              {customers.map((customer) => (
                <li key={customer.id}>
                  <div className="customer-info">
                    <span className="customer-email">{customer.email}</span>
                    <span className="customer-points">{customer.points !== undefined ? customer.points : 0} pts</span>
                  </div>
                  <button onClick={() => handleDeleteClick(customer.email)}>Delete</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Customer"
        message={`Are you sure you want to delete customer "${deleteConfirmation.email}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
