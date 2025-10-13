import React, { useContext } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';

const ThemeToggle = () => {
    const { darkMode, toggleDarkMode } = useContext(ThemeContext);

    return (
        <button
            className="theme-toggle-btn"
            onClick={toggleDarkMode}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {darkMode ? <FaSun /> : <FaMoon />}
        </button>
    );
};

export default ThemeToggle; 