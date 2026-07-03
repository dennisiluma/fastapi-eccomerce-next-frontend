'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import './profile.css';



export default function ProfilePage() {


    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    const [updating, setUpdating] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');



    // Profile form state
    const [profileForm, setProfileForm] = useState({
        name: '',
        address: '',
    });

    // Password form state
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });


    // Messages
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            router.push('/login');
            return;
        }
        fetchUserProfile();
    }, [router]);



    const fetchUserProfile = async () => {
        try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
            setProfileForm({
                name: userData.name || '',
                address: userData.address || '',
            });
        } catch (error: any) {
            setErrorMessage(error.message || 'Failed to load profile');
        }
    };


    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setProfileForm({
            ...profileForm,
            [e.target.name]: e.target.value,
        });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordForm({
            ...passwordForm,
            [e.target.name]: e.target.value,
        });
    };


    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            const updateData: any = {};
            if (profileForm.name !== user.name) updateData.name = profileForm.name;
            if (profileForm.address !== user.address) updateData.address = profileForm.address;

            if (Object.keys(updateData).length === 0) {
                setErrorMessage('No changes to update');
                return;
            }

            await authService.updateProfile(updateData);
            await fetchUserProfile(); // Refresh user data
            setSuccessMessage('Profile updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error: any) {
            setErrorMessage(error.message || 'Failed to update profile');
        } finally {
            setUpdating(false);
        }
    };




    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setErrorMessage('New passwords do not match');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setErrorMessage('Password must be at least 6 characters');
            return;
        }

        setUpdating(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            await authService.changePassword({
                oldPassword: passwordForm.oldPassword,
                newPassword: passwordForm.newPassword,
            });

            setSuccessMessage('Password changed successfully!');
            setPasswordForm({
                oldPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error: any) {
            setErrorMessage(error.message || 'Failed to change password');
        } finally {
            setUpdating(false);
        }
    };



    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file type
        if (!file.type.startsWith('image/')) {
            setErrorMessage('Please upload an image file');
            return;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setErrorMessage('File size must be less than 5MB');
            return;
        }

        setUploading(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            const result = await authService.uploadAvatar(file);
            await fetchUserProfile(); // Refresh user data
            setSuccessMessage('Profile picture updated!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error: any) {
            setErrorMessage(error.message || 'Failed to upload avatar');
        } finally {
            setUploading(false);
        }
    };



    const getImageUrl = (imageUrl: string) => {
        if (!imageUrl) return '/images/profile.jpeg';
        return imageUrl;
    };




    return (
        <div className="profile-container">
            <div className="container">
                <div className="profile-wrapper">
                    {/* Sidebar */}
                    <div className="profile-sidebar">
                        <div className="avatar-section">
                            <div className="avatar-wrapper">
                                <img
                                    src={getImageUrl(user?.profilePicture)}
                                    alt={user?.name || ''}
                                    className="avatar-image"
                                />
                                <label htmlFor="avatar-upload" className="avatar-upload-btn">
                                    📷
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        disabled={uploading}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                                {uploading && <div className="avatar-loading">Uploading...</div>}
                            </div>
                            <h3>{user?.name || ''}</h3>
                            <p className="user-email">{user?.email}</p>
                            <span className={`user-role role-${user?.role?.toLowerCase()}`}>
                                {user?.role}
                            </span>
                        </div>

                        <div className="profile-tabs">
                            <button
                                className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                📝 Edit Profile
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
                                onClick={() => setActiveTab('password')}
                            >
                                🔒 Change Password
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="profile-content">
                        {successMessage && (
                            <div className="success-alert">
                                <span>✅</span>
                                <p>{successMessage}</p>
                            </div>
                        )}

                        {errorMessage && (
                            <div className="error-alert">
                                <span>⚠️</span>
                                <p>{errorMessage}</p>
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="profile-form-section">
                                <h2>Edit Profile</h2>
                                <form onSubmit={handleUpdateProfile} className="profile-form">
                                    <div className="form-group">
                                        <label htmlFor="name">Full Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={profileForm.name}
                                            onChange={handleProfileChange}
                                            placeholder="Enter your full name"
                                            disabled={updating}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="email">Email Address</label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={user?.email || ''}
                                            disabled
                                            className="disabled-input"
                                        />
                                        <small>Email cannot be changed</small>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="address">Address</label>
                                        <textarea
                                            id="address"
                                            name="address"
                                            value={profileForm.address || ''}
                                            onChange={handleProfileChange}
                                            placeholder="Enter your address"
                                            rows={3}
                                            disabled={updating}
                                        />
                                    </div>

                                    <button type="submit" className="submit-btn" disabled={updating}>
                                        {updating ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'password' && (
                            <div className="profile-form-section">
                                <h2>Change Password</h2>
                                <form onSubmit={handleChangePassword} className="profile-form">
                                    <div className="form-group">
                                        <label htmlFor="oldPassword">Current Password</label>
                                        <input
                                            type="password"
                                            id="oldPassword"
                                            name="oldPassword"
                                            value={passwordForm.oldPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="Enter current password"
                                            required
                                            disabled={updating}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="newPassword">New Password</label>
                                        <input
                                            type="password"
                                            id="newPassword"
                                            name="newPassword"
                                            value={passwordForm.newPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="Enter new password (min 6 characters)"
                                            required
                                            disabled={updating}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="confirmPassword">Confirm New Password</label>
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={passwordForm.confirmPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="Confirm new password"
                                            required
                                            disabled={updating}
                                        />
                                    </div>

                                    <button type="submit" className="submit-btn" disabled={updating}>
                                        {updating ? 'Changing...' : 'Change Password'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}