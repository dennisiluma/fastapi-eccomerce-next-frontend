'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { productService } from '@/services/productService';
import { cartService } from '@/services/cartService';
import { reviewService } from '@/services/reviewService';
import { authService } from '@/services/authService';
import './productDetails.css';





export default function ProductDetailsPage() {

    const params = useParams();
    const router = useRouter();
    const productId = params.id as string;
    const [product, setProduct] = useState<any>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [activeImage, setActiveImage] = useState('');

    const [cartQuantity, setCartQuantity] = useState(0);

    const [ratingStats, setRatingStats] = useState({
        average_rating: 0,
        total_reviews: 0
    });



    useEffect(() => {
        if (productId) {
            fetchProduct();
            fetchRatingStats();
            if (authService.isAuthenticated()) {
                fetchCartItemQuantity();
            }
        }
    }, [productId]);



    const fetchProduct = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await productService.getProductById(parseInt(productId));
            setProduct(data);
            setActiveImage(data.imageUrl || "/images/product.jpeg");
        } catch (err: any) {
            setError(err.message || 'Failed to load product');
        } finally {
            setLoading(false);
        }
    };


    const fetchRatingStats = async () => {
        try {
            const stats = await reviewService.getProductRating(parseInt(productId));
            setRatingStats(stats);
        } catch (err: any) {
            console.error('Failed to fetch rating stats:', err);
        }
    };



    const fetchCartItemQuantity = async () => {
        try {
            const cart = await cartService.getCart();
            const item = cart.items?.find((i: any) => i.productId === parseInt(productId));
            if (item) {
                setCartQuantity(item.quantity);
                setQuantity(item.quantity);
            }
        } catch (error) {
            console.error('Failed to fetch cart item:', error);
        }
    };

    const handleQuantityChange = (change: number) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1 && newQuantity <= product?.stockQuantity) {
            setQuantity(newQuantity);
        }
    };


    const handleAddToCart = async () => {
        if (!authService.isAuthenticated()) {
            router.push('/login');
            return;
        }

        setAddingToCart(true);
        try {
            await cartService.addToCart(parseInt(productId), quantity);
            await fetchCartItemQuantity();
            window.dispatchEvent(new Event('cartUpdated'));
            showToast(`${product.name} added to cart!`);
        } catch (err: any) {
            showToast(err.message || 'Failed to add to cart', 'error');
        } finally {
            setAddingToCart(false);
        }
    };

    const handleUpdateCart = async (newQuantity: number) => {
        setAddingToCart(true);
        try {
            if (newQuantity > cartQuantity) {
                await cartService.addToCart(parseInt(productId), newQuantity - cartQuantity);
            } else if (newQuantity < cartQuantity) {
                const timesToDecrement = cartQuantity - newQuantity;
                for (let i = 0; i < timesToDecrement; i++) {
                    await cartService.decrementItem(parseInt(productId));
                }
            }
            await fetchCartItemQuantity();
            window.dispatchEvent(new Event('cartUpdated'));
            showToast('Cart updated successfully!');
        } catch (err: any) {
            showToast(err.message || 'Failed to update cart', 'error');
        } finally {
            setAddingToCart(false);
        }
    };

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };


    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - Math.ceil(rating);

        return (
            <>
                {'⭐'.repeat(fullStars)}
                {hasHalfStar && '½'}
                {'☆'.repeat(emptyStars)}
            </>
        );
    };


    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };


    if (loading) {
        return (
            <div className="product-details-container">
                <div className="container">
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading product details...</p>
                    </div>
                </div>
            </div>
        );
    }


    if (error || !product) {
        return (
            <div className="product-details-container">
                <div className="container">
                    <div className="error-container">
                        <div className="error-message">
                            <p>{error || 'Product not found'}</p>
                        </div>
                        <Link href="/products" className="back-btn">
                            ← Back to Products
                        </Link>
                    </div>
                </div>
            </div>
        );
    }





    return (
        <div className="product-details-container">
            <div className="container">
                {/* Breadcrumb */}
                <div className="breadcrumb">
                    <Link href="/">Home</Link>
                    <span>/</span>
                    <Link href="/products">Products</Link>
                    <span>/</span>
                    <span className="current">{product.name}</span>
                </div>

                {/* Product Main Info */}
                <div className="product-main">
                    <div className="product-gallery">
                        <div className="main-image">
                            <img
                                src={activeImage}
                                alt={product.name}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/placeholder-image.jpg';
                                }}
                            />
                        </div>
                    </div>

                    <div className="product-info-section">
                        <h1 className="product-title">{product.name}</h1>

                        <div className="product-rating">
                            <div className="stars">
                                {renderStars(ratingStats.average_rating)}
                            </div>
                            <div className="rating-details">
                                <span className="average-rating">{ratingStats.average_rating.toFixed(1)}</span>
                                <span className="review-count">
                                    ({ratingStats.total_reviews} {ratingStats.total_reviews === 1 ? 'review' : 'reviews'})
                                </span>
                            </div>
                        </div>

                        <div className="product-price">
                            ${parseFloat(product.price).toFixed(2)}
                        </div>

                        <div className="product-stock-info">
                            {product.stockQuantity > 0 ? (
                                <span className="in-stock">✓ In Stock ({product.stockQuantity} available)</span>
                            ) : (
                                <span className="out-of-stock">✗ Out of Stock</span>
                            )}
                        </div>

                        <div className="product-description">
                            <h3>Description</h3>
                            <p>{product.description}</p>
                        </div>

                        {product.stockQuantity > 0 && (
                            <div className="product-actions">
                                {cartQuantity > 0 ? (
                                    <>
                                        <div className="quantity-controls-large">
                                            <button
                                                onClick={() => handleUpdateCart(cartQuantity - 1)}
                                                disabled={addingToCart || cartQuantity <= 1}
                                                className="qty-btn"
                                            >
                                                -
                                            </button>
                                            <span className="qty-value">{cartQuantity}</span>
                                            <button
                                                onClick={() => handleUpdateCart(cartQuantity + 1)}
                                                disabled={addingToCart || cartQuantity >= product.stockQuantity}
                                                className="qty-btn"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => router.push('/cart')}
                                            className="view-cart-btn"
                                        >
                                            View in Cart →
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="quantity-controls-large">
                                            <button
                                                onClick={() => handleQuantityChange(-1)}
                                                disabled={quantity <= 1}
                                                className="qty-btn"
                                            >
                                                -
                                            </button>
                                            <span className="qty-value">{quantity}</span>
                                            <button
                                                onClick={() => handleQuantityChange(1)}
                                                disabled={quantity >= product.stockQuantity}
                                                className="qty-btn"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            onClick={handleAddToCart}
                                            disabled={addingToCart}
                                            className="add-to-cart-btn-large"
                                        >
                                            {addingToCart ? 'Adding...' : 'Add to Cart 🛒'}
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Reviews Section - Display Only */}
                <div className="reviews-section">
                    <div className="reviews-header">
                        <div>
                            <h2>Customer Reviews</h2>
                            {ratingStats.total_reviews > 0 && (
                                <div className="rating-summary">
                                    <div className="stars-large">
                                        {renderStars(ratingStats.average_rating)}
                                    </div>
                                    <span className="rating-value">{ratingStats.average_rating.toFixed(1)} out of 5</span>
                                    <span className="total-reviews">Based on {ratingStats.total_reviews} reviews</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {product.reviews && product.reviews.length > 0 ? (
                        <div className="reviews-list">
                            {product.reviews.map((review: any) => (
                                <div key={review.id} className="review-card">
                                    <div className="review-header">
                                        <div className="reviewer-info">
                                            <span className="reviewer-name">{review.username || `User ${review.userId}`}</span>
                                            <span className="review-date">{formatDate(review.createdAt)}</span>
                                        </div>
                                        <div className="review-rating">
                                            {renderStars(review.rating)}
                                        </div>
                                    </div>
                                    <p className="review-comment">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-reviews">
                            <p>No reviews yet for this product.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}