'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { categoryService } from '@/services/categoryService';
import { authService } from '@/services/authService';
import './admin-categories.css';



export default function AdminCategoriesPage() {

    const router = useRouter();
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<'add' | 'edit' | 'delete'>('add');
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    const [submitting, setSubmitting] = useState(false);


    useEffect(() => {
        // Check if user is admin
        if (!authService.isAuthenticated()) {
            router.push('/login');
            return;
        }
        if (!authService.isAdmin()) {
            router.push('/products');
            return;
        }
        fetchCategories();
    }, [router]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await categoryService.getCategories();
            setCategories(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };


    const handleOpenAddModal = () => {
        setModalType('add');
        setFormData({ name: '', description: '' });
        setShowModal(true);
    };


    const handleOpenEditModal = (category: any) => {
        setModalType('edit');
        setSelectedCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
        });
        setShowModal(true);
    };


    const handleOpenDeleteModal = (category: any) => {
        setModalType('delete');
        setSelectedCategory(category);
        setShowModal(true);
    };

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            if (modalType === 'add') {
                await categoryService.createCategory(formData);
                showToast('Category created successfully!');
            } else if (modalType === 'edit' && selectedCategory) {
                await categoryService.updateCategory({
                    id: selectedCategory.id,
                    name: formData.name,
                    description: formData.description,
                });
                showToast('Category updated successfully!');
            }

            setShowModal(false);
            await fetchCategories();
        } catch (err: any) {
            setError(err.message || 'Failed to save category');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedCategory) return;

        setSubmitting(true);
        setError(null);

        try {
            await categoryService.deleteCategory(selectedCategory.id);
            showToast('Category deleted successfully!');
            setShowModal(false);
            await fetchCategories();
        } catch (err: any) {
            setError(err.message || 'Failed to delete category');
        } finally {
            setSubmitting(false);
        }
    };

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };



    if (loading) {
        return (
            <div className="admin-categories-container">
                <div className="container">
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading categories...</p>
                    </div>
                </div>
            </div>
        );
    }





    return (
        <div className="admin-categories-container">
            <div className="container">
                <div className="admin-header">
                    <div>
                        <h1>Manage Categories</h1>
                        <p>Add, edit, or remove product categories</p>
                    </div>
                    <button onClick={handleOpenAddModal} className="add-category-btn">
                        + Add New Category
                    </button>
                </div>

                {error && (
                    <div className="error-alert">
                        <span>⚠️</span>
                        <p>{error}</p>
                    </div>
                )}

                <div className="categories-grid">
                    {categories.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📂</div>
                            <h3>No Categories Yet</h3>
                            <p>Click "Add New Category" to create your first category.</p>
                        </div>
                    ) : (
                        categories.map((category) => (
                            <div key={category.id} className="category-card">
                                <div className="category-icon">
                                    {getCategoryIcon(category.name)}
                                </div>
                                <div className="category-info">
                                    <h3>{category.name}</h3>
                                    <p>{category.description || 'No description provided'}</p>
                                    <div className="category-stats">
                                        <span>ID: {category.id}</span>
                                    </div>
                                </div>
                                <div className="category-actions">
                                    <button
                                        onClick={() => handleOpenEditModal(category)}
                                        className="edit-btn"
                                        title="Edit Category"
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        onClick={() => handleOpenDeleteModal(category)}
                                        className="delete-btn"
                                        title="Delete Category"
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="stats-footer">
                    <p>Total Categories: {categories.length}</p>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                {modalType === 'add' && 'Add New Category'}
                                {modalType === 'edit' && 'Edit Category'}
                                {modalType === 'delete' && 'Delete Category'}
                            </h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
                        </div>

                        {modalType === 'delete' ? (
                            <>
                                <div className="modal-body">
                                    <p>Are you sure you want to delete <strong>{selectedCategory?.name}</strong>?</p>
                                    <p className="warning-text">
                                        ⚠️ This action cannot be undone. Products in this category will lose their category assignment.
                                    </p>
                                </div>
                                <div className="modal-footer">
                                    <button className="cancel-btn" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </button>
                                    <button className="confirm-delete-btn" onClick={handleDelete} disabled={submitting}>
                                        {submitting ? 'Deleting...' : 'Delete Category'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    {error && (
                                        <div className="modal-error">
                                            <span>⚠️</span>
                                            <p>{error}</p>
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label htmlFor="name">Category Name *</label>
                                        <input
                                            type="text"
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            placeholder="Enter category name"
                                            disabled={submitting}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="description">Description *</label>
                                        <textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={3}
                                            required
                                            placeholder="Enter category description"
                                            disabled={submitting}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="submit-btn" disabled={submitting}>
                                        {submitting ? 'Saving...' : (modalType === 'add' ? 'Add Category' : 'Save Changes')}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function getCategoryIcon(categoryName: string): string {
    const icons: Record<string, string> = {
        'electronics': '📱',
        'fashion': '👕',
        'books': '📚',
        'home & garden': '🏠',
        'home and garden': '🏠',
        'sports': '⚽',
        'toys': '🧸',
        'beauty': '💄',
        'food': '🍕',
    };

    const normalizedName = categoryName.toLowerCase().trim();

    if (icons[normalizedName]) {
        return icons[normalizedName];
    }

    for (const [key, icon] of Object.entries(icons)) {
        if (normalizedName.includes(key)) {
            return icon;
        }
    }

    return '📦';
}