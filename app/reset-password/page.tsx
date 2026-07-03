
'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';
import './reset-password.css';



export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<ResetPasswordFallback />}>
            <ResetPasswordContent />
        </Suspense>
    );
}



function ResetPasswordContent() {

    const router = useRouter();

    const searchParams = useSearchParams();

    const [formData, setFormData] = useState({
        code: '',
        password: '',
        confirmPassword: '',
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Extract code from URL query parameter when component mounts
    useEffect(() => {
        const codeFromUrl = searchParams.get('code');
        if (codeFromUrl) {
            setFormData(prev => ({
                ...prev,
                code: codeFromUrl
            }));
        }
    }, [searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (formData.code.length !== 6) {
            setError('Reset code must be 6 characters');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await authService.resetPassword(formData.code, formData.password);
            setSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to reset password. Please check your code and try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="reset-container">
                <div className="reset-card">
                    <div className="success-icon">✅</div>
                    <h1>Password Reset Successful!</h1>
                    <p>Your password has been changed successfully.</p>
                    <div className="info-box">
                        <p>Redirecting you to login page...</p>
                    </div>
                    <Link href="/login" className="login-btn">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="reset-container">
            <div className="reset-card">
                <div className="reset-header">
                    <h1>Reset Password</h1>
                    <p>Enter the 6-digit code sent to your email and your new password.</p>
                </div>

                {error && (
                    <div className="error-alert">
                        <span>⚠️</span>
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="reset-form">
                    <div className="form-group">
                        <label htmlFor="code">Reset Code</label>
                        <input
                            type="text"
                            id="code"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            required
                            placeholder="Enter 6-digit reset code"
                            maxLength={6}
                            disabled={loading}
                        />
                        <small>Check your email for the 6-digit reset code</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">New Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Enter new password (min 6 characters)"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="Confirm your new password"
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>

                <div className="reset-footer">
                    <p>
                        <Link href="/forgot-password">Request new reset code</Link>
                    </p>
                    <p>
                        Remember your password? <Link href="/login">Back to Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}





// Loading fallback component while suspense is resolving
function ResetPasswordFallback() {
    return (
        <div className="reset-container">
            <div className="reset-card">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        </div>
    );
}


