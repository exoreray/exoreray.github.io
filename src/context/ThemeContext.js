import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        // Check if user has a preference saved
        const savedTheme = localStorage.getItem('darkMode');
        if (savedTheme !== null) {
            setDarkMode(JSON.parse(savedTheme));
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setDarkMode(prefersDark);
        }
    }, []);

    useEffect(() => {
        // Apply theme class to html element for Tailwind dark mode
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Save preference
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
}; 