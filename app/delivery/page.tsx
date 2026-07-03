'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { orderService } from '@/services/orderService';
import { authService } from '@/services/authService';
import './deliveryDashboard.css';



export default function DeliveryDashboard() {

    const router = useRouter();

    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
    const [filter, setFilter] = useState<string>('all');



    useEffect(() => {
        // Check if user is delivery
        if (!authService.isDelivery()) {
            router.push('/products');
            return;
        }

        getAllOrders();
    }, [router]);


    const getAllOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await orderService.getAllOrders();
            setOrders(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };



    const handleUpdateStatus = async (orderId: number, newStatus: string) => {
        setUpdatingOrderId(orderId);
        try {
            await orderService.updateOrderStatus(orderId, newStatus);

            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
            );
            showToast(`Order #${orderId} status updated to ${newStatus}`);
        } catch (err: any) {
            showToast(err.message || 'Failed to update order status', 'error');
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
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

    const getNextStatuses = (currentStatus: string) => {
        const statusFlow: Record<string, string[]> = {
            'pending': ['processing', 'cancelled'],
            'processing': ['shipped', 'cancelled'],
            'shipped': ['delivered'],
            'delivered': [],
            'cancelled': []
        };
        return statusFlow[currentStatus.toLowerCase()] || [];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };


    const filteredOrders = filter === 'all'
        ? orders
        : orders.filter(order => order.status.toLowerCase() === filter);


    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
    };

    if (loading) {
        return (
            <div className="delivery-dashboard">
                <div className="container">
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading orders...</p>
                    </div>
                </div>
            </div>
        );
    }


    const userRole = authService.getUserRole();
    const pageTitle = userRole === 'ADMIN' ? 'Admin - Order Management' : 'Delivery Dashboard';
    const pageSubtitle = userRole === 'ADMIN'
        ? 'Manage and update all customer orders'
        : 'Manage your assigned deliveries';

    return (
        <div className="delivery-dashboard">
            <div className="container">
                <div className="dashboard-header">
                    <h1>{pageTitle}</h1>
                    <p>{pageSubtitle}</p>
                </div>

                {error && (
                    <div className="error-alert">
                        <span>⚠️</span>
                        <p>{error}</p>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Total Orders</div>
                    </div>
                    <div className="stat-card pending">
                        <div className="stat-value">{stats.pending}</div>
                        <div className="stat-label">Pending</div>
                    </div>
                    <div className="stat-card processing">
                        <div className="stat-value">{stats.processing}</div>
                        <div className="stat-label">Processing</div>
                    </div>
                    <div className="stat-card shipped">
                        <div className="stat-value">{stats.shipped}</div>
                        <div className="stat-label">Shipped</div>
                    </div>
                    <div className="stat-card delivered">
                        <div className="stat-value">{stats.delivered}</div>
                        <div className="stat-label">Delivered</div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="filter-tabs">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All Orders ({stats.total})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending ({stats.pending})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'processing' ? 'active' : ''}`}
                        onClick={() => setFilter('processing')}
                    >
                        Processing ({stats.processing})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'shipped' ? 'active' : ''}`}
                        onClick={() => setFilter('shipped')}
                    >
                        Shipped ({stats.shipped})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`}
                        onClick={() => setFilter('delivered')}
                    >
                        Delivered ({stats.delivered})
                    </button>
                </div>

                {/* Orders List */}
                <div className="orders-list">
                    {filteredOrders.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📦</div>
                            <h3>No Orders Found</h3>
                            <p>There are no orders with the selected status.</p>
                        </div>
                    ) : (
                        filteredOrders.map((order) => (
                            <div key={order.id} className="order-card">
                                <div className="order-header">
                                    <div className="order-info">
                                        <span className="order-number">Order #{order.id}</span>
                                        <span className="order-date">{formatDate(order.createdAt)}</span>
                                    </div>
                                    <div className={`order-status ${getStatusBadgeClass(order.status)}`}>
                                        {order.status.toUpperCase()}
                                    </div>
                                </div>

                                <div className="order-body">
                                    <div className="order-details">
                                        <div className="detail-row">
                                            <span className="label">Shipping Address:</span>
                                            <span className="value">{order.shippingAddress}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Total Amount:</span>
                                            <span className="value">${parseFloat(order.totalPrice).toFixed(2)}</span>
                                        </div>
                                        {order.items && order.items.length > 0 && (
                                            <div className="order-items">
                                                <span className="label">Items:</span>
                                                <div className="items-list">
                                                    {order.items.map((item: any) => (
                                                        <div key={item.id} className="item">
                                                            {item.productName} x {item.quantity}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="order-actions">
                                        {getNextStatuses(order.status).map((nextStatus) => (
                                            <button
                                                key={nextStatus}
                                                onClick={() => handleUpdateStatus(order.id, nextStatus)}
                                                disabled={updatingOrderId === order.id}
                                                className={`action-btn ${nextStatus}`}
                                            >
                                                {updatingOrderId === order.id ? 'Updating...' : `Mark as ${nextStatus}`}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}