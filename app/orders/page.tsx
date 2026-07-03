'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { orderService } from '@/services/orderService';
import { reviewService } from '@/services/reviewService';
import { authService } from '@/services/authService';
import './orders.css';



export default function MyOrdersPage() {

    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    const [reviewData, setReviewData] = useState({
        rating: 5,
        comment: ''
    });
    const [submittingReview, setSubmittingReview] = useState(false);



    useEffect(() => {
        if (!authService.isAuthenticated()) {
            router.push('/login');
            return;
        }
        fetchOrders();
    }, [router]);


    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await orderService.getMyOrders();
            const sortedOrders = data.sort((a: any, b: any) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setOrders(sortedOrders);
        } catch (err: any) {
            setError(err.message || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };


    const getStatusBadgeClass = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'status-pending';
            case 'processing':
                return 'status-processing';
            case 'shipped':
                return 'status-shipped';
            case 'delivered':
                return 'status-delivered';
            case 'cancelled':
                return 'status-cancelled';
            default:
                return 'status-pending';
        }
    };


    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return '⏳';
            case 'processing':
                return '🔄';
            case 'shipped':
                return '🚚';
            case 'delivered':
                return '✅';
            case 'cancelled':
                return '❌';
            default:
                return '📦';
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


    const getProgressSteps = (status: string) => {
        const steps = [
            { key: 'pending', label: 'Order Placed', icon: '📝', order: 1 },
            { key: 'processing', label: 'Processing', icon: '🔄', order: 2 },
            { key: 'shipped', label: 'Shipped', icon: '🚚', order: 3 },
            { key: 'delivered', label: 'Delivered', icon: '✅', order: 4 }
        ];

        const currentStatus = status.toLowerCase();
        let activeSteps: any = [];

        if (currentStatus === 'pending') {
            activeSteps = [{ key: 'pending', label: 'Order Placed', icon: '📝', active: true, completed: false }];
        } else if (currentStatus === 'processing') {
            activeSteps = [
                { key: 'pending', label: 'Order Placed', icon: '📝', active: false, completed: true },
                { key: 'processing', label: 'Processing', icon: '🔄', active: true, completed: false }
            ];
        } else if (currentStatus === 'shipped') {
            activeSteps = [
                { key: 'pending', label: 'Order Placed', icon: '📝', active: false, completed: true },
                { key: 'processing', label: 'Processing', icon: '🔄', active: false, completed: true },
                { key: 'shipped', label: 'Shipped', icon: '🚚', active: true, completed: false }
            ];
        } else if (currentStatus === 'delivered') {
            activeSteps = [
                { key: 'pending', label: 'Order Placed', icon: '📝', active: false, completed: true },
                { key: 'processing', label: 'Processing', icon: '🔄', active: false, completed: true },
                { key: 'shipped', label: 'Shipped', icon: '🚚', active: false, completed: true },
                { key: 'delivered', label: 'Delivered', icon: '✅', active: true, completed: false }
            ];
        }

        return activeSteps;
    };



    const handleWriteReview = (item: any, orderId: number) => {
        setSelectedProduct({
            productId: item.productId,
            productName: item.productName,
            orderId: orderId
        });
        setReviewData({ rating: 5, comment: '' });
        setShowReviewModal(true);
    };




    const handleReviewSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setSubmittingReview(true);

        try {
            await reviewService.createReview({
                productId: selectedProduct.productId,
                rating: reviewData.rating,
                comment: reviewData.comment
            });

            // Update the isReviewed flag for this product in the local state
            setOrders(prevOrders =>
                prevOrders.map(order => {
                    if (order.id === selectedProduct.orderId) {
                        return {
                            ...order,
                            items: order.items.map((item: any) =>
                                item.productId === selectedProduct.productId
                                    ? { ...item, isReviewed: true }
                                    : item
                            )
                        };
                    }
                    return order;
                })
            );

            alert('Review submitted successfully!');
            setShowReviewModal(false);
            setReviewData({ rating: 5, comment: '' });
        } catch (err: any) {
            alert(err.message || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };



    if (loading) {
        return (
            <div className="orders-container">
                <div className="container">
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading your orders...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="orders-container">
                <div className="container">
                    <div className="error-container">
                        <div className="error-message">
                            <h3>Error loading orders</h3>
                            <p>{error}</p>
                        </div>
                        <button onClick={fetchOrders} className="retry-btn">
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="orders-container">
                <div className="container">
                    <div className="empty-orders">
                        <div className="empty-icon">📦</div>
                        <h2>No Orders Yet</h2>
                        <p>You haven't placed any orders yet.</p>
                        <Link href="/products" className="shop-now-btn">
                            Start Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }



    return (
        <div className="orders-container">
            <div className="container">
                <div className="orders-header">
                    <h1>My Orders</h1>
                    <p>Track and manage your orders</p>
                </div>

                <div className="orders-list">
                    {orders.map((order) => {
                        const progressSteps = getProgressSteps(order.status);
                        const currentStatus = order.status.toLowerCase();

                        return (
                            <div key={order.id} className="order-card">
                                <div className="order-header">
                                    <div className="order-info">
                                        <span className="order-number">Order #{order.id}</span>
                                        <span className="order-date">{formatDate(order.createdAt)}</span>
                                    </div>
                                    <div className={`order-status ${getStatusBadgeClass(order.status)}`}>
                                        <span className="status-icon">{getStatusIcon(order.status)}</span>
                                        <span className="status-text">{order.status.toUpperCase()}</span>
                                    </div>
                                </div>

                                <div className="order-details">
                                    <div className="order-summary">
                                        <div className="summary-item">
                                            <span className="label">Total Amount:</span>
                                            <span className="value">${parseFloat(order.totalPrice).toFixed(2)}</span>
                                        </div>
                                        <div className="summary-item">
                                            <span className="label">Shipping Address:</span>
                                            <span className="value">{order.shippingAddress}</span>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="order-items">
                                        <h3>Order Items</h3>
                                        <div className="items-list">
                                            {order.items.map((item: any) => (
                                                <div key={item.id} className="order-item">
                                                    <div className="item-info">
                                                        <div className="item-name">{item.productName}</div>
                                                        <div className="item-details">
                                                            <span>📦 Quantity: {item.quantity}</span>
                                                            <span>💰 Price: ${parseFloat(item.unitPrice).toFixed(2)}</span>
                                                            <span>💵 Subtotal: ${parseFloat(item.subtotal).toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="item-action">
                                                        {currentStatus === 'delivered' && (
                                                            item.isReviewed ? (
                                                                <span className="reviewed-badge">✓ Reviewed</span>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleWriteReview(item, order.id)}
                                                                    className="write-review-btn"
                                                                >
                                                                    ✍️ Write a Review
                                                                </button>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Progress Tracker */}
                                    {currentStatus !== 'pending' && currentStatus !== 'cancelled' && (
                                        <div className="order-progress">
                                            <div className="progress-tracker">
                                                {progressSteps.map((step: any, index: any) => (
                                                    <div key={step.key} className={`progress-step ${step.completed ? 'completed' : ''} ${step.active ? 'active' : ''}`}>
                                                        <div className="step-indicator">
                                                            <div className="step-circle">
                                                                {step.completed ? '✓' : step.icon}
                                                            </div>
                                                            {index < progressSteps.length - 1 && (
                                                                <div className={`step-line ${step.completed ? 'completed-line' : ''}`}></div>
                                                            )}
                                                        </div>
                                                        <div className="step-label">{step.label}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Show simple pending message */}
                                    {currentStatus === 'pending' && (
                                        <div className="pending-message">
                                            <p>⏳ Your order has been placed and is awaiting processing.</p>
                                        </div>
                                    )}

                                    {/* Show cancelled message */}
                                    {currentStatus === 'cancelled' && (
                                        <div className="cancelled-message">
                                            <p>❌ This order has been cancelled.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Review Modal */}
            {showReviewModal && selectedProduct && (
                <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Write a Review</h2>
                            <button className="close-btn" onClick={() => setShowReviewModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleReviewSubmit}>
                            <div className="modal-body">
                                <div className="product-info-modal">
                                    <h3>{selectedProduct.productName}</h3>
                                    <p className="order-id-info">Product ID: {selectedProduct.productId}</p>
                                </div>


                                <div className="form-group">
                                    <label>Rating</label>
                                    <div className="rating-select">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setReviewData({ ...reviewData, rating: star })}
                                                className={`rating-star ${reviewData.rating >= star ? 'active' : ''}`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                    {reviewData.rating && (
                                        <span className="rating-label">
                                            {reviewData.rating === 5 && "Excellent!"}
                                            {reviewData.rating === 4 && "Very Good"}
                                            {reviewData.rating === 3 && "Good"}
                                            {reviewData.rating === 2 && "Fair"}
                                            {reviewData.rating === 1 && "Poor"}
                                        </span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Your Review</label>
                                    <textarea
                                        value={reviewData.comment}
                                        onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                        rows={5}
                                        placeholder="Share your experience with this product..."
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={() => setShowReviewModal(false)} className="cancel-btn">
                                    Cancel
                                </button>
                                <button type="submit" disabled={submittingReview} className="submit-btn">
                                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}