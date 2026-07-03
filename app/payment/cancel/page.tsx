

'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { paymentService } from '@/services/paymentService';
import './cancel.css';



// Main page component with Suspense boundary
export default function PaymentCancelPage() {
    return (
        <Suspense fallback={<PaymentCancelFallback />}>
            <PaymentCancelContent />
        </Suspense>
    );
}




// Loading fallback component while suspense is resolving
function PaymentCancelFallback() {
    return (
        <div className="payment-container">
            <div className="container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading...</p>
                </div>
            </div>
        </div>
    );
}

function PaymentCancelContent() {

    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [orderId, setOrderId] = useState<number | null>(null);



    useEffect(() => {
        if (sessionId) {
            fetchCancelledOrder();
        }
    }, [sessionId]);


    const fetchCancelledOrder = async () => {
        try {
            const result = await paymentService.cancelPayment(sessionId);
            if (result?.order_id) {
                setOrderId(result.order_id);
            }
        } catch (err) {
            console.error('Failed to fetch cancelled order:', err);
        }
    };



    return (
        <div className="payment-container">
            <div className="container">
                <div className="cancel-card">
                    <div className="cancel-icon">✗</div>
                    <h1>Payment Cancelled</h1>
                    <p>Your payment was cancelled. No charges were made to your account.</p>

                    {orderId && (
                        <div className="order-info">
                            <p>Order #{orderId} has been cancelled. You can place a new order.</p>
                        </div>
                    )}

                    <div className="message-box">
                        <p>What would you like to do?</p>
                        <ul>
                            <li>Try checking out again with the same cart</li>
                            <li>Review your cart and try a different payment method</li>
                            <li>Contact support if you need assistance</li>
                        </ul>
                    </div>

                    <div className="button-group">
                        <Link href="/cart" className="back-to-cart-btn">
                            ← Back to Cart
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
