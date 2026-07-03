'use client';

import Link from 'next/link';
import './home.css';

export default function Home() {
  return (

    <>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <h1 className="hero-title">Welcome to ShopEase</h1>
          <p className="hero-subtitle">
            Discover amazing products at unbeatable prices with fast delivery
          </p>
          <Link href="/products" className="hero-btn">
            Shop Now →
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose ShopEase?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h3>Free Delivery</h3>
              <p>Free shipping on orders over $50</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Secure Payment</h3>
              <p>100% secure payment methods</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Quality Products</h3>
              <p>Premium quality guaranteed</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💯</div>
              <h3>24/7 Support</h3>
              <p>Dedicated customer support</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Start Shopping?</h2>
          <p>Join thousands of happy customers who shop with us every day</p>
          <Link href="/products" className="cta-btn">
            Browse Products
          </Link>
        </div>
      </section>

    </>
  );
}
