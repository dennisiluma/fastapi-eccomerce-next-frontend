'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';
import { reportService } from '@/services/reportService';
import './adminDashboard.css';


export default function AdminDashboard() {

    const router = useRouter();

    const [stats, setStats] = useState({
        totalProducts: 0,
        totalCategories: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalRevenue: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        // Check if user is admin
        if (!authService.isAuthenticated() ) {
            router.push('/login');
        } else if (!authService.isAdmin()) {
            router.push('/products');
        } else {
            fetchDashboardStats();
        }
    }, [router]);



    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await reportService.getDashboardStats();
            setStats({
                totalProducts: data.totalProducts || 0,
                totalCategories: data.totalCategories || 0,
                totalOrders: data.totalOrders || 0,
                totalUsers: data.totalUsers || 0,
                totalRevenue: data.totalRevenue || 0,
            });
        } catch (error: any) {
            console.error('Error fetching stats:', error);
            setError(error.message || 'Failed to fetch dashboard statistics');
        } finally {
            setLoading(false);
        }
    };



    if (loading) {
        return (
            <div className="admin-dashboard">
                <div className="container">
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-dashboard">
                <div className="container">
                    <div className="error-container">
                        <div className="error-message">
                            <h3>Error Loading Dashboard</h3>
                            <p>{error}</p>
                        </div>
                        <button onClick={fetchDashboardStats} className="retry-btn">
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }



    return (
        <div className="admin-dashboard">
            <div className="container">
                <div className="dashboard-header">
                    <h1>Admin Dashboard</h1>
                    <p>Welcome back, Admin</p>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📦</div>
                        <div className="stat-info">
                            <h3>{stats.totalProducts}</h3>
                            <p>Total Products</p>
                        </div>
                        <Link href="/admin/products" className="stat-link">Manage →</Link>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">📁</div>
                        <div className="stat-info">
                            <h3>{stats.totalCategories}</h3>
                            <p>Categories</p>
                        </div>
                        <Link href="/admin/categories" className="stat-link">Manage →</Link>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">🛒</div>
                        <div className="stat-info">
                            <h3>{stats.totalOrders}</h3>
                            <p>Total Orders</p>
                        </div>
                        <Link href="/admin/orders" className="stat-link">View →</Link>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-info">
                            <h3>{stats.totalUsers}</h3>
                            <p>Total Users</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-info">
                            <h3>${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                            <p>Total Revenue</p>
                        </div>
                    </div>
                </div>

                <div className="quick-actions">
                    <h2>Quick Actions</h2>
                    <div className="actions-grid">
                        <Link href="/admin/products/add" className="action-card">
                            <span>➕</span>
                            <p>Add New Product</p>
                        </Link>
                        <Link href="/admin/categories" className="action-card">
                            <span>📁</span>
                            <p>Manage Categories</p>
                        </Link>
                        <Link href="/admin/register" className="action-card">
                            <span>👤</span>
                            <p>Register User</p>
                        </Link>
                        <Link href="/admin/orders" className="action-card">
                            <span>📋</span>
                            <p>Manage Orders</p>
                        </Link>
                        <Link href="/products" className="action-card">
                            <span>🛍️</span>
                            <p>View Store</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
