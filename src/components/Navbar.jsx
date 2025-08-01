import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import bookIcon from '../assets/book.png'; // adjust path if needed

const Navbar = () => (
  <nav className="navbar">
    <Link to="/" className="navbar-logo" aria-label="Knowledge">
      <img src={bookIcon} alt="Book Icon" style={{ height: 32, width: 32 }} />
    </Link>
    <div className="navbar-user">
      <span role="img" aria-label="user" className="user-icon">👤</span>
    </div>
  </nav>
);

export default Navbar;