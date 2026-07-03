'use client';

import Link from "next/link";
import './footer.css'

export default function Footer() {

    const currentYear = new Date().getFullYear();


    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>ShopEase</h3>
                        <p>Your one-stop destination for quality products at the best prices.</p>
                        <div className="social-links">
                            <a href="#" className="social-icon" aria-label="Facebook">
                                📘
                            </a>
                            <a href="#" className="social-icon" aria-label="Instagram">
                                📷
                            </a>
                            <a href="#" className="social-icon" aria-label="Twitter">
                                🐦
                            </a>
                            <a href="#" className="social-icon" aria-label="LinkedIn">
                                💼
                            </a>
                        </div>
                    </div>

                    <div className="footer-section">
                        <h3>Quick Links</h3>
                        <ul>
                            <li><Link href="/products">All Products</Link></li>
                            <li><Link href="/about">About Us</Link></li>
                            <li><Link href="/contact">Contact Us</Link></li>
                            <li><Link href="/faq">FAQ</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h3>Customer Service</h3>
                        <ul>
                            <li><Link href="/shipping">Shipping Info</Link></li>
                            <li><Link href="/returns">Returns Policy</Link></li>
                            <li><Link href="/terms">Terms & Conditions</Link></li>
                            <li><Link href="/privacy">Privacy Policy</Link></li>
                        </ul>
                    </div>

                </div>

                <div className="footer-bottom">
                    <p>&copy; {currentYear} ShopEase. All rights reserved</p>
                </div>
            </div>
        </footer>
    );
}