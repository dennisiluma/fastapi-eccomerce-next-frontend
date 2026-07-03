
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cartService } from '@/services/cartService';
import { authService } from '@/services/authService';
import './cart.css';




export default function CartPage() {

    const router = useRouter();
    const [cart, setCart] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');


    useEffect(() => {
        if (!authService.isAuthenticated()) {
            router.push('/login');
            return;
        }
        fetchCart();
    }, [router]);


    const fetchCart = async () => {
        try {
            setLoading(true);
            const data = await cartService.getCart();
            setCart(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load cart');
        } finally {
            setLoading(false);
        }
    };


    // Function to update cart count in navbar
    const updateNavbarCartCount = () => {
        window.dispatchEvent(new Event('cartUpdated'));
    };



    const handleAddOne = async (productId: number) => {
        setUpdating(true);
        try {
            await cartService.addToCart(productId, 1);
            await fetchCart();
            updateNavbarCartCount();
        } catch (err: any) {
            setError(err.message || 'Failed to update cart');
        } finally {
            setUpdating(false);
        }
    };


    const handleRemoveOne = async (productId: number) => {
        setUpdating(true);
        try {
            await cartService.decrementItem(productId);
            await fetchCart();
            updateNavbarCartCount();
        } catch (err: any) {
            setError(err.message || 'Failed to update cart');
        } finally {
            setUpdating(false);
        }
    };

    const handleRemoveItem = async (productId: number) => {
        if (!confirm('Remove this item from cart?')) return;

        setUpdating(true);
        try {
            await cartService.removeItem(productId);
            await fetchCart();
            updateNavbarCartCount();
        } catch (err: any) {
            setError(err.message || 'Failed to remove item');
        } finally {
            setUpdating(false);
        }
    };


    const handleClearCart = async () => {
        if (!confirm('Clear entire cart?')) return;

        setUpdating(true);
        try {
            await cartService.clearCart();
            await fetchCart();
            updateNavbarCartCount();
        } catch (err: any) {
            setError(err.message || 'Failed to clear cart');
        } finally {
            setUpdating(false);
        }
    };



    const handleCheckout = async () => {
        setUpdating(true);
        try {
            const result = await cartService.checkout();
            if (result.checkoutUrl) {
                window.location.href = result.checkoutUrl;
            } else {
                router.push('/orders');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to process checkout');
        } finally {
            setUpdating(false);
        }
    };


    if (loading) {
        return (
            <div className="cart-container">
                <div className="container">
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading cart...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!cart || cart.items?.length === 0) {
        return (
            <div className="cart-container">
                <div className="container">
                    <div className="empty-cart">
                        <div className="empty-cart-icon">🛒</div>
                        <h2>Your cart is empty</h2>
                        <p>Looks like you haven't added any items to your cart yet.</p>
                        <Link href="/products" className="shop-now-btn">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="cart-container">
            <div className="container">
                <div className="cart-wrapper">
                    <div className="cart-header">
                        <h1>Shopping Cart</h1>
                        <p>{cart.totalQuantity} item(s) in your cart</p>
                    </div>

                    {error && (
                        <div className="error-alert">
                            <span>⚠️</span>
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="cart-content">
                        {/* Cart Items */}
                        <div className="cart-items">
                            <div className="cart-items-header">
                                <div className="col-product">Product</div>
                                <div className="col-price">Price</div>
                                <div className="col-quantity">Quantity</div>
                                <div className="col-total">Total</div>
                                <div className="col-action"></div>
                            </div>

                            {cart.items.map((item: any) => (
                                <div key={item.id} className="cart-item">
                                    <div className="col-product">
                                        <div className="product-info">
                                            <img
                                                src={item.productImage}
                                                alt={item.productName}
                                                className="product-image"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = '/images/product.jpeg';
                                                }}
                                            />
                                            <div className="product-details">
                                                <Link href={`/products/${item.productId}`} className="product-name">
                                                    {item.productName}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-price">
                                        <span className="price">${parseFloat(item.productPrice).toFixed(2)}</span>
                                    </div>

                                    <div className="col-quantity">
                                        <div className="quantity-controls">
                                            <button
                                                onClick={() => handleRemoveOne(item.productId)}
                                                disabled={updating}
                                                className="qty-btn"
                                            >
                                                -
                                            </button>
                                            <span className="qty-value">{item.quantity}</span>
                                            <button
                                                onClick={() => handleAddOne(item.productId)}
                                                disabled={updating}
                                                className="qty-btn"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div className="col-total">
                                        <span className="total-price">
                                            ${parseFloat(item.subtotal).toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="col-action">
                                        <button
                                            onClick={() => handleRemoveItem(item.productId)}
                                            disabled={updating}
                                            className="remove-btn"
                                            title="Remove item"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <div className="cart-actions">
                                <button onClick={handleClearCart} disabled={updating} className="clear-cart-btn">
                                    Clear Cart
                                </button>
                                <Link href="/products" className="continue-shopping">
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>

                        {/* Cart Summary */}
                        <div className="cart-summary">
                            <h2>Order Summary</h2>
                            <div className="summary-details">
                                <div className="summary-row">
                                    <span>Subtotal ({cart.totalQuantity} items)</span>
                                    <span>${parseFloat(cart.totalPrice).toFixed(2)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Shipping</span>
                                    <span>Free</span>
                                </div>
                                <div className="summary-row">
                                    <span>Tax</span>
                                    <span>${(parseFloat(cart.totalPrice) * 0.1).toFixed(2)}</span>
                                </div>
                                <div className="summary-row total">
                                    <span>Total</span>
                                    <span>${(parseFloat(cart.totalPrice) * 1.1).toFixed(2)}</span>
                                </div>
                            </div>
                            <button
                                onClick={handleCheckout}
                                disabled={updating || cart.items?.length === 0}
                                className="checkout-btn"
                            >
                                {updating ? 'Processing...' : 'Proceed to Checkout'}
                            </button>
                            <p className="payment-info">
                                🔒 Secure payment powered by Stripe
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

