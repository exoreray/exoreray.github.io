import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Register = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [registered, setRegistered] = useState(false);

    useEffect(() => {
        if (registered) {
            window.location.href = '/login';
        }
    }, [registered])

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/register/', {
                username,
                email,
                password
            });
            console.log(response);
            // set the registered state to true
            setRegistered(true);
        } catch (error) {
            console.error(error);
        }
    }


return (
    <div>
        <form onSubmit={handleSubmit}>
            <label>
                Username:
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
            </label>
            <br />
            <label>
                email:
                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <br />
            <label>
                Password:
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <br />
            <button type="submit">Register</button>
        </form>
    </div>
)
}

export default Register;