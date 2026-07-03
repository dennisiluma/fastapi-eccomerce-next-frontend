'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { categoryService } from '@/services/categoryService';
import './categoriesPage.css';



export default function CategoriesPage() {
    return (
        <Suspense fallback={<CategoryFallback />}>
            <CategoriesPageContent />
        </Suspense>
    );

}


function CategoryFallback() {
    return (
        <div className="container">
            <div className="categories-container">
                <div className="categories-header">
                    <h1>Shop by Category</h1>
                    <p>Browse our products by category</p>
                </div>
            </div>
        </div>
    );
}


function CategoriesPageContent() {

    const [categories, setCategories] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        fetchCategories();
    }, []);



    const fetchCategories = async () => {
        try {
            setError(null);
            const data = await categoryService.getCategories();
            setCategories(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch categories');
        }
    };


    if (error) {
        return (
            <div className="container">
                <div className="categories-container">
                    <div className="error-container">
                        <div className="error-message">
                            <h3>Error loading categories</h3>
                            <p>{error}</p>
                        </div>
                        <button onClick={fetchCategories} className="retry-btn">
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="categories-container">
                <div className="categories-header">
                    <h1>Shop by Category</h1>
                    <p>Browse our products by category</p>
                </div>

                {categories.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📂</div>
                        <h3>No categories found</h3>
                        <p>Check back later for new categories</p>
                    </div>
                ) : (
                    <div className="categories-grid">
                        {categories.map((category) => (
                            <Link
                                href={`/products?categoryId=${category.id}`}
                                key={category.id}
                                className="category-card"
                            >
                                <div className="category-icon">
                                    {getCategoryIcon(category.name)}
                                </div>
                                <h3 className="category-name">{category.name}</h3>
                                <p className="category-description">
                                    {category.description || `Explore ${category.name} products`}
                                </p>
                                <span className="shop-now">Shop Now →</span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}


function getCategoryIcon(categoryName: string): string {
    const icons: Record<string, string> = {
        'electronics': '📱',
        'clothing': '👕',
        'books': '📚',
        'home & garden': '🏠',
        'sports': '⚽',
        'toys': '🧸',
        'beauty': '💄',
        'food': '🍕',
        'fashion':'😅'
    };
    return icons[categoryName.toLowerCase().trim()] || '📦';
}
