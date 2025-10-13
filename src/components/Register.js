import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [registered, setRegistered] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (registered) {
            window.location.href = '/login';
        }
    }, [registered]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!username || !email || !password) {
            setError("Please fill in all fields");
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/register/', {
                username,
                email,
                password
            });
            console.log(response);
            setRegistered(true);
        } catch (error) {
            console.error(error);
            setError("Registration failed. Please try again.");
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-form-box">
                <h2>Register</h2>
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
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                    <button type="submit" className="auth-button">Register</button>
                </form>
                <div className="auth-links">
                    <p>Already have an account? <Link to="/login">Login</Link></p>
                    <p><Link to="/">Back to Home</Link></p>
                </div>
            </div>
        </div>
    );
}

export default Register;