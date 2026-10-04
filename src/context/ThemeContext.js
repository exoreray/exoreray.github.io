import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => {
        try {
            const savedTheme = localStorage.getItem('darkMode');
            if (savedTheme === 'true' || savedTheme === 'false') return savedTheme === 'true';
        } catch { /* Storage may be unavailable in private browsing. */ }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        // Apply theme class to html element for Tailwind dark mode
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Save preference
        try { localStorage.setItem('darkMode', JSON.stringify(darkMode)); } catch { /* The theme still works without persistence. */ }
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode(previous => !previous);
    };

    return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};
