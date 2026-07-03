'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/authService';
import './error.css';
import Link from 'next/link';



// Main page component with Suspense boundary
export default function AuthErrorPage() {
    return (
        <Suspense fallback={<AuthErrorFallback />}>
            <AuthErrorContent />
        </Suspense>
    );
}


function AuthErrorContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const error = searchParams.get('error');

    useEffect(() => {
        // Redirect after 5 seconds
        const timer = setTimeout(() => {
            router.push('/login');
        }, 5000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="auth-error-container">
            <div className="error-card">
                <div className="error-icon">✗</div>
                <h2>Authentication Failed</h2>

                <div className="error-message">
                    <p>{error || 'Something went wrong during authentication. Please try again.'}</p>
                </div>

                <Link href="/login" className="back-link">
                    Back to Login
                </Link>

                <p className="redirect-message">
                    Redirecting to login page in 5 seconds...
                </p>
            </div>
        </div>
    );
}

// Loading fallback while suspense is resolving
function AuthErrorFallback() {
    return (
        <div className="auth-error-container">
            <div className="error-card">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        </div>
    );
}


