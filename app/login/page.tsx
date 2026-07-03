'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import './login.css'
import { authService } from "@/services/authService";
import { API_CONFIG } from "@/services/apiUrl";
import Link from "next/link";


export default function LoginPage() {


    const router = useRouter();


    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });


    const [loading, setLoading] = useState(false);

    const [error, setError] = useState('');


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    
    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await authService.login({
                email: formData.email,
                password: formData.password,
            });

            // Save only token and role to localStorage
            authService.saveAuthData(result.token, result.user.role);

            // Manually dispatch a storage event to notify other components (like Navbar)
            window.dispatchEvent(new Event('storage'));

            // Also dispatch a custom event for immediate update
            window.dispatchEvent(new CustomEvent('authChange', {
                detail: { isAuthenticated: true, role: result.user.role }
            }));

            // Redirect based on role
            if (result.user.role === 'ADMIN') {
                router.push('/admin/dashboard');
            } else if (result.user.role === 'DELIVERY') {
                router.push('/delivery');
            } else {
                router.push('/products');
            }
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };



    const handleGoogleLogin = () => {
        window.location.href = `${API_CONFIG.API_URL}/auth/google`;
    };




    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Welcome Back</h1>
                    <p>Login to your account</p>
                </div>

                {error && (
                    <div className="error-alert">
                        <span>⚠️</span>
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Enter your email"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Enter your password"
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>


                <div className="auth-footer">

                    <button onClick={handleGoogleLogin} className="google-btn">
                        Continue with Google
                    </button>

                    <p>
                        Don't have an account? <Link href="/register">Register here</Link>
                    </p>
                    <p>
                        Forgot Password?<Link href="/forgot-password">Reset here</Link>
                    </p>
                </div>

            </div>
        </div>
    );
}