'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { orderService } from '@/services/orderService';
import { authService } from '@/services/authService';
import './adminOrders.css';



export default function AdminOrdersPage() {

    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
    const [filter, setFilter] = useState<string>('all');


    useEffect(() => {
        if (!authService.isAuthenticated() || !authService.isAdmin()) {
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
            case 'pending': return 'status-pending';
            case 'processing': return 'status-processing';
            case 'shipped': return 'status-shipped';
            case 'delivered': return 'status-delivered';
            case 'cancelled': return 'status-cancelled';
            default: return 'status-pending';
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




    if (loading) {
        return (
            <div className="admin-orders-container">
                <div className="container">
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading orders...</p>
                    </div>
                </div>
            </div>
        );
    }



    return (
        <div className="admin-orders-container">
            <div className="container">
                <div className="page-header">
                    <h1>Order Management</h1>
                    <p>View and manage all customer orders</p>
                </div>

                {error && (
                    <div className="error-alert">
                        <span>⚠️</span>
                        <p>{error}</p>
                    </div>
                )}

                <div className="filter-section">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All ({orders.length})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending ({orders.filter(o => o.status === 'pending').length})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'processing' ? 'active' : ''}`}
                        onClick={() => setFilter('processing')}
                    >
                        Processing ({orders.filter(o => o.status === 'processing').length})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'shipped' ? 'active' : ''}`}
                        onClick={() => setFilter('shipped')}
                    >
                        Shipped ({orders.filter(o => o.status === 'shipped').length})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`}
                        onClick={() => setFilter('delivered')}
                    >
                        Delivered ({orders.filter(o => o.status === 'delivered').length})
                    </button>
                </div>

                <div className="orders-table-wrapper">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Total</th>
                                <th>Shipping Address</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="empty-row">No orders found</td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td>#{order.id}</td>
                                        <td>{formatDate(order.createdAt)}</td>
                                        <td>${parseFloat(order.totalPrice).toFixed(2)}</td>
                                        <td className="address-cell">{order.shippingAddress}</td>
                                        <td>
                                            <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="actions-cell">
                                            {getNextStatuses(order.status).map((nextStatus) => (
                                                <button
                                                    key={nextStatus}
                                                    onClick={() => handleUpdateStatus(order.id, nextStatus)}
                                                    disabled={updatingOrderId === order.id}
                                                    className={`action-btn ${nextStatus}`}
                                                >
                                                    {updatingOrderId === order.id ? '...' : nextStatus}
                                                </button>
                                            ))}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}