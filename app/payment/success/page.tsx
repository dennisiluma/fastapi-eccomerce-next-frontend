

'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { paymentService } from '@/services/paymentService';
import './success.css';




export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<PaymentSuccessFallback />}>
            <PaymentSuccessContent />
        </Suspense>
    );
}



// Loading fallback component while suspense is resolving
function PaymentSuccessFallback() {
    return (
        <div className="payment-container">
            <div className="container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading payment confirmation...</p>
                </div>
            </div>
        </div>
    );
}



function PaymentSuccessContent() {

    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');

    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);



    useEffect(() => {
        if (!sessionId) {
            setError('No session ID found');
            setLoading(false);
            return;
        }

        verifyPayment();
    }, [sessionId]);



    const verifyPayment = async () => {
        try {
            setLoading(true);
            const result = await paymentService.confirmPayment(sessionId);
            setOrder(result);
        } catch (err: any) {
            setError(err.message || 'Payment verification failed');
        } finally {
            setLoading(false);
        }
    };


    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };



    if (loading) {
        return (
            <div className="payment-container">
                <div className="container">
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Verifying your payment...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="payment-container">
                <div className="container">
                    <div className="error-card">
                        <div className="error-icon">❌</div>
                        <h2>Payment Verification Failed</h2>
                        <p>{error}</p>
                        <div className="button-group">
                            <Link href="/orders" className="view-orders-btn">
                                View My Orders
                            </Link>
                            <Link href="/products" className="continue-shopping-btn">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }



    return (
        <div className="payment-container">
            <div className="container">
                <div className="success-card">
                    <div className="success-icon">✓</div>
                    <h1>Payment Successful!</h1>
                    <p>Your order has been placed successfully and is now being processed.</p>

                    <div className="order-details">
                        <h2>Order Details</h2>

                        <div className="order-info-grid">
                            <div className="info-row">
                                <span className="label">Order ID:</span>
                                <span className="value">#{order?.id}</span>
                            </div>

                            <div className="info-row">
                                <span className="label">Order Status:</span>
                                <span className="value status-processing">{order?.status?.toUpperCase()}</span>
                            </div>

                            <div className="info-row">
                                <span className="label">Total Amount:</span>
                                <span className="value total">${parseFloat(order?.total_price || 0).toFixed(2)}</span>
                            </div>

                            <div className="info-row">
                                <span className="label">Shipping Address:</span>
                                <span className="value">{order?.shipping_address}</span>
                            </div>

                            <div className="info-row">
                                <span className="label">Order Date:</span>
                                <span className="value">{formatDate(order?.created_at)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="next-steps">
                        <h3>What's Next?</h3>
                        <ul>
                            <li>📧 You will receive an order confirmation email shortly</li>
                            <li>🚚 Our team will process your order within 24 hours</li>
                            <li>📦 You can track your order status in "My Orders" page</li>
                            <li>💬 For any questions, contact our support team</li>
                        </ul>
                    </div>

                    <div className="button-group">
                        <Link href="/orders" className="view-orders-btn">
                            View My Orders
                        </Link>
                        <Link href="/products" className="continue-shopping-btn">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}


