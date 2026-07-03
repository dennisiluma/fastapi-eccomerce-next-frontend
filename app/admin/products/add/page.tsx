'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { authService } from '@/services/authService';
import '../admin-products.css';



export default function AddProductPage(){
    
    const router = useRouter();

    const [categories, setCategories] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [imagePreview, setImagePreview] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stockQuantity: '',
        categoryId: '',
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);


    useEffect(() => {
        if (!authService.isAuthenticated() || !authService.isAdmin()) {
            router.push('/login');
            return;
        }
        fetchCategories();
    }, [router]);


    const fetchCategories = async () => {
        try {
            const data = await categoryService.getCategories();
            setCategories(data);
            if (data.length > 0) {
                setFormData(prev => ({ ...prev, categoryId: data[0].id.toString() }));
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load categories');
        }
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };



    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        
        if (!selectedFile) {
            setError('Please select an image for the product');
            return;
        }

        if (!formData.categoryId) {
            setError('Please select a category');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const submitFormData = new FormData();
            submitFormData.append('name', formData.name);
            submitFormData.append('description', formData.description);
            submitFormData.append('price', formData.price);
            submitFormData.append('stock_quantity', formData.stockQuantity);
            submitFormData.append('category_id', formData.categoryId);
            submitFormData.append('file', selectedFile);

            await productService.createProduct(submitFormData);
            router.push('/admin/products');
        } catch (err: any) {
            setError(err.message || 'Failed to create product');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="admin-products-container">
            <div className="container">
                <div className="form-header">
                    <Link href="/admin/products" className="back-link">← Back to Products</Link>
                    <h1>Add New Product</h1>
                </div>

                {error && (
                    <div className="error-alert">
                        <span>⚠️</span>
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="product-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="name">Product Name *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Enter product name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="categoryId">Category *</label>
                            <select
                                id="categoryId"
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                required
                            >
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="price">Price *</label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="stockQuantity">Stock Quantity *</label>
                            <input
                                type="number"
                                id="stockQuantity"
                                name="stockQuantity"
                                value={formData.stockQuantity}
                                onChange={handleChange}
                                required
                                min="0"
                                placeholder="0"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="description">Description *</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows={5}
                                placeholder="Enter product description"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="image">Product Image *</label>
                            <input
                                type="file"
                                id="image"
                                name="image"
                                onChange={handleFileChange}
                                accept="image/*"
                                required
                            />
                            {imagePreview && (
                                <div className="image-preview">
                                    <img src={imagePreview} alt="Preview" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-actions">
                        <Link href="/admin/products" className="cancel-btn">Cancel</Link>
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}