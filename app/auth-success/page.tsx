'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/authService';
import './success.css';



// Main page component with Suspense boundary
export default function AuthSuccessPage() {
    return (
        <Suspense fallback={<AuthSuccessFallback />}>
            <AuthSuccessContent />
        </Suspense>
    );
}


function AuthSuccessContent() {
    const router = useRouter();

    const searchParams = useSearchParams();

    const token = searchParams.get('token');
    const role = searchParams.get('role');

    useEffect(() => {
        if (token && role) {
            // Save token and role
            authService.saveAuthData(token, role);
            
            // Dispatch events
            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new CustomEvent('authChange', {
                detail: { isAuthenticated: true, role }
            }));
            
            // Clear URL params and redirect after short delay
            setTimeout(() => {
                if (role === 'ADMIN') {
                    router.replace('/admin/register-user');
                } else if (role === 'DELIVERY') {
                    router.replace('/dashboard/delivery');
                } else {
                    router.replace('/products');
                }
            }, 5000);
        } else {
            router.replace('/login');
        }
    }, [token, role, router]);

    return (
        <div className="auth-success-container">
            <div className="success-card">
                <div className="success-icon">✓</div>
                <h2>Authentication Successful!</h2>
                <p>You have successfully logged in.</p>
                <div className="loading-spinner"></div>
                <p>Redirecting you to page...</p>
            </div>
        </div>
    );
}


// Loading fallback while suspense is resolving
function AuthSuccessFallback() {
    return (
        <div className="auth-success-container">
            <div className="success-card">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        </div>
    );
}