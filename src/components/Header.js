import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

// Create your Header component here
const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <div className="header">
            <Link to="/">
                <div className="header-logo">
                    <h3 className="header-name">Ray Xi</h3>
                </div>
            </Link>

            <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
                {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </div>

            <div className={`header-container ${mobileMenuOpen ? 'active' : ''}`}>
                <div className="nav-items">
                    <div className="nav-item"><Link to="/register">Register</Link></div>
                    <div className="nav-item"><Link to="/login">Login</Link></div>
                    <div className="nav-item"><a href="#about">About</a></div>
                    <div className="nav-item"><a href="#projects">Projects</a></div>
                    <div className="nav-item"><a href="#skills">Skills</a></div>
                </div>
            </div>
        </div>
    );
};

export default Header;