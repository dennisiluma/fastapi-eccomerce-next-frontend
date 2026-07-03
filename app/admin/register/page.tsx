
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import './adminRegister.css';



export default function AdminRegisterUserPage() {

    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        password: '',
        role: 'CUSTOMER',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');




    // Check if user is admin
    useEffect(() => {

        if (!authService.isAdmin()) {
            router.push('/products');
        }
    }, [router]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
        setSuccess('');
    };


    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await authService.register({
                email: formData.email,
                name: formData.name,
                password: formData.password,
                role: formData.role,
            });

            setSuccess(`${formData.role} user registered successfully!`);
            setFormData({
                email: '',
                name: '',
                password: '',
                role: 'CUSTOMER',
            });
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="admin-register-container">
            <div className="admin-register-card">
                <div className="admin-header">
                    <h1>Register Custom User</h1>
                    <p>Create admin, delivery, or customer accounts</p>
                </div>

                {error && (
                    <div className="error-alert">
                        <span>⚠️</span>
                        <p>{error}</p>
                    </div>
                )}

                {success && (
                    <div className="success-alert">
                        <span>✅</span>
                        <p>{success}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="admin-form">
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Enter full name"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Enter email address"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Enter password (min 6 characters)"
                            disabled={loading}
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">Select Role</label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        >
                            <option value="CUSTOMER">Customer</option>
                            <option value="ADMIN">Admin</option>
                            <option value="DELIVERY">Delivery Person</option>
                        </select>
                    </div>

                    <button type="submit" className="admin-register-btn" disabled={loading}>
                        {loading ? 'Registering...' : 'Register User'}
                    </button>
                </form>

                <div className="admin-info">
                    <h3>Role Information:</h3>
                    <ul>
                        <li><strong>Admin:</strong> Full access to manage products, users, and orders</li>
                        <li><strong>Delivery:</strong> Can update order status and manage deliveries</li>
                        <li><strong>Customer:</strong> Can browse products, place orders, and leave reviews</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}