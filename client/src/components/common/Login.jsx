import React, { useState } from 'react';
import { authAPI } from '../../services/api';
import '../../styles/Login.css';

const Login = ({ onLogin }) => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authAPI.login(credentials);
            
            if (response.data.success) {
                const { token, user } = response.data.data;
                onLogin(user, token);
            } else {
                setError(response.data.message || 'Login failed');
            }
        } catch (err) {
            setError(
                err.response?.data?.message || 
                'Login failed. Please check your credentials.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>🍽️ Restaurant Order System</h1>
                <h2>Staff Login</h2>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={credentials.username}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder="Enter your username"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder="Enter your password"
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="login-info">
                    <p>👥 For Staff, Kitchen, and Owner access</p>
                    <p>
                        <a href="/customer">Go to Customer Portal →</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
