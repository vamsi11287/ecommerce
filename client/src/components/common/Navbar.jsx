import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Navbar.css';

const Navbar = ({ user, onLogout }) => {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">🍽️ Restaurant Order System</Link>
            </div>
            <ul className="navbar-links">
                {user ? (
                    <>
                        <li>
                            <span className="user-info">
                                👤 {user.username} ({user.role})
                            </span>
                        </li>
                        <li>
                            <button onClick={onLogout} className="btn-logout">
                                Logout
                            </button>
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <Link to="/customer">Customer Portal</Link>
                        </li>
                        <li>
                            <Link to="/login">Staff Login</Link>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;