import React, { useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../style/navbar.css';
import { AuthContext } from './AuthContext';
import API_URL from '../config/api';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { loggedIn, setLoggedIn} = useContext(AuthContext);
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        setLoggedIn(false);
        // setCurrentUser(null);
        navigate('/login');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <NavLink className="title" to="/profile">
            Blue Point
          </NavLink>
        </div>

        <div className={`navbar-toggle ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}>
          <span /><span /><span />
        </div>

        <nav>
          <ul className={`navbar-links ${menuOpen ? 'show' : ''}`}>
            {/* Test link only for admin
            {loggedIn && currentUser?.email === 'slifer4195@gmail.com' && (
              <li>
                <NavLink to="/test" onClick={() => setMenuOpen(false)}>Test</NavLink>
              </li>
            )} */}

            {/* Not logged in */}
            {!loggedIn && (
              <>
                <li><NavLink to="/login" onClick={() => setMenuOpen(false)}>Login</NavLink></li>
                <li><NavLink to="/register" onClick={() => setMenuOpen(false)}>Register</NavLink></li>
              </>
            )}

            {/* Logged in */}
            {loggedIn && (
              <>
                <li><NavLink to="/profile" onClick={() => setMenuOpen(false)}>Profile</NavLink></li>
                <li><NavLink to="/functionality" onClick={() => setMenuOpen(false)}>Reward Dashboard</NavLink></li>
                <li><NavLink to="/menu" onClick={() => setMenuOpen(false)}>Menu</NavLink></li>
                <li className="logout-button" onClick={handleLogout}>Logout</li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
