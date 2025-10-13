import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [login, setLogin] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (login) {
            window.location.href = '/';
        }
    }, [login]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!username || !password) {
            setError("Please fill in all fields");
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/login/', {
                username,
                password
            });
            console.log(response);
            setLogin(true);
        } catch (error) {
            console.error(error);
            setError("Login failed. Please check your credentials.");
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-form-box">
                <h2>Login</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="auth-button">Login</button>
                </form>
                <div className="auth-links">
                    <p>Don't have an account? <Link to="/register">Register</Link></p>
                    <p><Link to="/">Back to Home</Link></p>
                </div>
            </div>
        </div>
    );
}

export default Login;
