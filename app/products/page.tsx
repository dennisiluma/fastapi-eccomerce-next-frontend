'use client';

import { Suspense } from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { productService } from '@/services/productService';
import { useSearchParams, useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { cartService } from '@/services/cartService';
import { reviewService } from '@/services/reviewService';
import './productsPage.css'




export default function ProductsPage() {

    const searchParams = useSearchParams();
    const router = useRouter();

    const categoryId = searchParams.get('categoryId');

    const [products, setProducts] = useState<any[]>([]);
    const [displayedProducts, setDisplayedProducts] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name_asc');
    const [page, setPage] = useState(1);

    const [hasMore, setHasMore] = useState(true);

    const [selectedCategory, setSelectedCategory] = useState<number | null>(
        categoryId ? parseInt(categoryId) : null
    );


    const [cartItemsMap, setCartItemsMap] = useState<Record<number, number>>({});
    const [ratingsMap, setRatingsMap] = useState<Record<number, any>>({});


    const observerRef = useRef<IntersectionObserver | null>(null);
    const lastProductRef = useRef<HTMLDivElement | null>(null);

    const ITEMS_PER_PAGE = 3;

    // Fetch products when category changes
    useEffect(() => {
        fetchProducts();
    }, [selectedCategory]);


    // Fetch cart items on mount and when cart updates
    useEffect(() => {
        if (authService.isAuthenticated()) {
            fetchCartItems();
        }

        // Listen for cart updates
        const handleCartUpdate = () => {
            if (authService.isAuthenticated()) {
                fetchCartItems();
            }
        };

        window.addEventListener('cartUpdated', handleCartUpdate);
        return () => window.removeEventListener('cartUpdated', handleCartUpdate);
    }, []);


    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            setPage(1);
            const data = await productService.getProducts(selectedCategory || undefined);
            setProducts(data);
            setDisplayedProducts(data.slice(0, ITEMS_PER_PAGE));
            setHasMore(data.length > ITEMS_PER_PAGE);

            // Fetch ratings for all products
            await fetchRatingsForProducts(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };


    // fetch ratings for all products
    const fetchRatingsForProducts = async (productsList: any[]) => {
        const ratingsData: Record<number, any> = {};

        for (const product of productsList) {
            try {
                const rating = await reviewService.getProductRating(product.id);

                // Map the product's ID directly to its fetched rating
                ratingsData[product.id] = rating;
            } catch (error) {
                console.error(`Failed to fetch rating for product ${product.id}:`, error);
                ratingsData[product.id] = { average_rating: 0, total_reviews: 0 };
            }
        }

        setRatingsMap(ratingsData);
    };


    const fetchCartItems = async () => {
        try {
            const cart = await cartService.getCart();
            const itemsMap: Record<number, number> = {};
            cart.items?.forEach((item: any) => {
                itemsMap[item.productId] = item.quantity;
            });
            setCartItemsMap(itemsMap);
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        }
    };

    const handleUpdateQuantity = async (productId: number, change: number) => {
        try {
            if (change === 1) {
                await cartService.addToCart(productId, 1);
            } else if (change === -1) {
                await cartService.decrementItem(productId);
            }

            await fetchCartItems();
            window.dispatchEvent(new Event('cartUpdated'));
            showToast(change === 1 ? 'Item quantity increased' : 'Item quantity decreased');
        } catch (err: any) {
            showToast(err.message || 'Failed to update cart', 'error');
        }
    };

    // function to render stars
    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - Math.ceil(rating);

        const stars = [];

        for (let i = 0; i < fullStars; i++) {
            stars.push(<span key={`full-${i}`} className="star filled">★</span>);
        }

        if (hasHalfStar) {
            stars.push(<span key="half" className="star half-filled">★</span>);
        }

        for (let i = 0; i < emptyStars; i++) {
            stars.push(<span key={`empty-${i}`} className="star">☆</span>);
        }

        return stars;
    };



    const handleAddToCart = async (product: any) => {
        if (!authService.isAuthenticated()) {
            router.push('/login');
            return;
        }

        try {
            await cartService.addToCart(product.id, 1);
            await fetchCartItems();
            window.dispatchEvent(new Event('cartUpdated'));
            showToast(`${product.name} added to cart!`);
        } catch (err: any) {
            showToast(err.message || 'Failed to add to cart', 'error');
        }
    };


    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };



    // Filter and sort products
    const getFilteredAndSortedProducts = useCallback(() => {
        let result = [...products];

        if (searchTerm) {
            result = result.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        switch (sortBy) {
            case 'price_asc':
                result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
                break;
            case 'price_desc':
                result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
                break;
            case 'name_asc':
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name_desc':
                result.sort((a, b) => b.name.localeCompare(a.name));
                break;
            default:
                break;
        }

        return result;
    }, [products, searchTerm, sortBy]);



    // Update displayed products when filter/sort changes
    useEffect(() => {
        const filtered = getFilteredAndSortedProducts();
        setDisplayedProducts(filtered.slice(0, page * ITEMS_PER_PAGE));
        setHasMore(filtered.length > page * ITEMS_PER_PAGE);
    }, [products, searchTerm, sortBy, page, getFilteredAndSortedProducts]);

    // Load more products
    const loadMore = () => {
        if (!loadingMore && hasMore) {
            setLoadingMore(true);
            setTimeout(() => {
                setPage(prev => prev + 1);
                setLoadingMore(false);
            }, 500);
        }
    };

    // Intersection Observer for infinite scroll
    useEffect(() => {
        if (loading || loadingMore) return;

        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );

        if (lastProductRef.current) {
            observerRef.current.observe(lastProductRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [displayedProducts, hasMore, loading, loadingMore]);


    const clearCategoryFilter = () => {
        setSelectedCategory(null);
        window.history.pushState({}, '', '/products');
    };



    if (loading) {
        return (
            <div className="container">
                <div className="products-container">
                    <div className="products-header">
                        <h1>Our Products</h1>
                        <p>Discover our collection of high-quality products</p>
                    </div>
                    <div className="products-grid">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="product-card loading-card">
                                <div className="loading-image"></div>
                                <div className="loading-content">
                                    <div className="loading-title"></div>
                                    <div className="loading-description"></div>
                                    <div className="loading-price"></div>
                                    <div className="loading-button"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <div className="products-container">
                    <div className="error-container">
                        <div className="error-message">
                            <h3>Error loading products</h3>
                            <p>{error}</p>
                        </div>
                        <button onClick={fetchProducts} className="retry-btn">
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }


    const filteredProducts = getFilteredAndSortedProducts();
    const totalProducts = filteredProducts.length;





    return (

        <Suspense fallback={<div className="loading-spinner">Loading products...</div>}>
            <div className="container">
                <div className="products-container">
                    {/* Header */}
                    <div className="products-header">
                        <h1>Our Products</h1>
                        <p>Discover our collection of high-quality products</p>
                        {selectedCategory && (
                            <div className="category-filter-badge">
                                <span>Category: {selectedCategory}</span>
                                <button onClick={clearCategoryFilter} className="clear-filter">
                                    ✕ Clear Filter
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Filters Section */}
                    <div className="filters-section">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="sort-select"
                        >
                            <option value="name_asc">Name A-Z</option>
                            <option value="name_desc">Name Z-A</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                        </select>
                    </div>

                    {/* Products Grid - 4 per row */}
                    {displayedProducts.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🔍</div>
                            <h3>No products found</h3>
                            <p>Try adjusting your search or filter criteria</p>
                        </div>
                    ) : (
                        <>
                            <div className="products-grid four-per-row">
                                {displayedProducts.map((product, index) => {
                                    const rating = ratingsMap[product.id];
                                    const averageRating = rating?.average_rating || 0;
                                    const totalReviews = rating?.total_reviews || 0;

                                    return (
                                        <div
                                            key={product.id}
                                            className="product-card"
                                            ref={index === displayedProducts.length - 1 ? lastProductRef : null}
                                        >
                                            <Link href={`/products/${product.id}`}>
                                                <div className="product-image-container">
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        className="product-image"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = '/images/product.jpeg';
                                                        }}
                                                    />
                                                    {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
                                                        <span className="stock-badge low-stock">
                                                            Only {product.stockQuantity} left
                                                        </span>
                                                    )}
                                                    {product.stockQuantity === 0 && (
                                                        <span className="stock-badge out-of-stock">
                                                            Out of Stock
                                                        </span>
                                                    )}
                                                </div>
                                            </Link>

                                            <div className="product-info">
                                                <Link href={`/products/${product.id}`}>
                                                    <h3 className="product-title">{product.name}</h3>
                                                </Link>

                                                {/* Add Rating Display */}
                                                <div className="product-rating">
                                                    <div className="rating-stars">
                                                        {renderStars(averageRating)}
                                                    </div>
                                                    <span className="rating-value">{averageRating.toFixed(1)}</span>
                                                    <span className="review-count">({totalReviews})</span>
                                                </div>

                                                <div className="price-section">
                                                    <span className="product-price">
                                                        ${parseFloat(product.price).toFixed(2)}
                                                    </span>
                                                    <span className="product-stock">
                                                        Stock: {product.stockQuantity}
                                                    </span>
                                                </div>

                                                {cartItemsMap[product.id] ? (
                                                    <div className="cart-quantity-controls">
                                                        <button
                                                            onClick={() => handleUpdateQuantity(product.id, -1)}
                                                            className="qty-btn"
                                                            disabled={product.stockQuantity === 0}
                                                        >
                                                            -
                                                        </button>
                                                        <span className="qty-value">{cartItemsMap[product.id]}</span>
                                                        <button
                                                            onClick={() => handleUpdateQuantity(product.id, 1)}
                                                            className="qty-btn"
                                                            disabled={product.stockQuantity === 0}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleAddToCart(product)}
                                                        disabled={product.stockQuantity === 0}
                                                        className="add-to-cart-btn"
                                                    >
                                                        {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart 🛒'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {loadingMore && (
                                <div className="loading-more">
                                    <div className="loading-spinner"></div>
                                    <p>Loading more products...</p>
                                </div>
                            )}

                            <div className="results-count">
                                Showing {displayedProducts.length} of {totalProducts} products
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Suspense>

    );
}
