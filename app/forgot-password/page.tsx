'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authService } from '@/services/authService';
import './forgot-password.css';


export default function ForgotPasswordPage() {

    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);


    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);


        try {
            await authService.forgotPassword(email);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Failed to send reset code. Please try again.');
        } finally {
            setLoading(false)
        }
    };

    if (success) {
        return (
            <div className="forgot-container">
                <div className="forgot-card">
                    <div className="success-icon">📧</div>
                    <h1>Check Your Email</h1>
                    <p>
                        We've sent a password reset code to <strong>{email}</strong>
                    </p>
                    <div className="info-box">
                        <p>Please check your email and enter the 6-digit code on the reset password page.</p>
                    </div>
                    <div className="button-group">
                        <Link href="/login" className="back-btn">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="forgot-container">
            <div className="forgot-card">
                <div className="forgot-header">
                    <h1>Forgot Password?</h1>
                    <p>Enter your email address and we'll send you a reset code.</p>
                </div>

                {error && (
                    <div className="error-alert">
                        <span>⚠️</span>
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="forgot-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your registered email"
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Code'}
                    </button>
                </form>

                <div className="forgot-footer">
                    <p>
                        Remember your password? <Link href="/login">Back to Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );


}
