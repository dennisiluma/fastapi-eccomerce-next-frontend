'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { authService } from '@/services/authService';
import './admin-products.css';


export default function AdminProductsPage() {


    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');


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
        fetchData();
    }, [router]);


    const fetchData = async () => {
        try {
            setLoading(true);
            const [productsData, categoriesData] = await Promise.all([
                productService.getProducts(),
                categoryService.getCategories()
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };


    const handleDeleteClick = (product: any) => {
        setSelectedProduct(product);
        setShowDeleteModal(true);
    };



    const confirmDelete = async () => {
        if (!selectedProduct) return;

        try {
            await productService.deleteProduct(selectedProduct.id);
            setProducts(products.filter(p => p.id !== selectedProduct.id));
            setShowDeleteModal(false);
            setSelectedProduct(null);
            showToast('Product deleted successfully!');
        } catch (err: any) {
            showToast(err.message || 'Failed to delete product', 'error');
        }
    };


    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };


    const getCategoryName = (categoryId: number) => {
        const category = categories.find(c => c.id === categoryId);
        return category ? category.name : 'Unknown';
    };


    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );


    if (loading) {
        return (
            <div className="admin-products-container">
                <div className="container">
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading products...</p>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="admin-products-container">
            <div className="container">
                <div className="admin-header">
                    <div>
                        <h1>Manage Products</h1>
                        <p>Add, edit, or remove products from your store</p>
                    </div>
                    <Link href="/admin/products/add" className="add-product-btn">
                        + Add New Product
                    </Link>
                </div>

                {error && (
                    <div className="error-alert">
                        <span>⚠️</span>
                        <p>{error}</p>
                    </div>
                )}

                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="products-table-wrapper">
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="empty-row">
                                        No products found
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id}>
                                        <td className="product-image-cell">
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="product-thumb"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = '/images/product.jpeg';
                                                }}
                                            />
                                        </td>
                                        <td>{product.id}</td>
                                        <td className="product-name-cell">{product.name}</td>
                                        <td>{getCategoryName(product.categoryId)}</td>
                                        <td>${parseFloat(product.price).toFixed(2)}</td>
                                        <td>
                                            <span className={`stock-badge ${product.stockQuantity <= 5 ? 'low-stock' : 'in-stock'}`}>
                                                {product.stockQuantity}
                                            </span>
                                        </td>
                                        <td className="actions-cell">
                                            <Link
                                                href={`/admin/products/edit/${product.id}`}
                                                className="edit-btn"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteClick(product)}
                                                className="delete-btn"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="stats-footer">
                    <p>Total Products: {products.length}</p>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedProduct && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Confirm Delete</h2>
                            <button className="close-btn" onClick={() => setShowDeleteModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to delete <strong>{selectedProduct.name}</strong>?</p>
                            <p className="warning-text">This action cannot be undone.</p>
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-btn" onClick={() => setShowDeleteModal(false)}>
                                Cancel
                            </button>
                            <button className="confirm-delete-btn" onClick={confirmDelete}>
                                Delete Product
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}