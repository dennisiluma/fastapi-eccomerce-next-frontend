'use client';

import { authService } from "@/services/authService";
import { cartService } from "@/services/cartService";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import './navbar.css'




export default function Navbar() {

    const router = useRouter()
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const pathname = usePathname();


    // Function to update auth state
    const updateAuthState = () => {
        setIsLoggedIn(!!authService.getToken());
        setUserRole(authService.getUserRole());
    };

    // Function to fetch cart count from API
    const fetchCartCount = async () => {
        if (!authService.isAuthenticated()) {
            setCartCount(0);
            return;
        }

        try {
            const cart = await cartService.getCart();
            setCartCount(cart.totalQuantity || 0);
        } catch (error) {
            setCartCount(0);
        }
    };



    useEffect(() => {

        updateAuthState();
        fetchCartCount();

        const handleAuthAndStorageChange = () => {
            updateAuthState();
            fetchCartCount();
        };

        // 3. Attach the listeners
        window.addEventListener('storage', handleAuthAndStorageChange);
        window.addEventListener('authChange', handleAuthAndStorageChange);
        window.addEventListener('cartUpdated', fetchCartCount);

        // 4. Clean them up properly using the exact same function references
        return () => {
            window.removeEventListener('storage', handleAuthAndStorageChange);
            window.removeEventListener('authChange', handleAuthAndStorageChange);
            window.removeEventListener('cartUpdated', fetchCartCount);
        };

    }, []);



    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };



    const handleLogout = () => {
        authService.logout();
        setIsLoggedIn(false);
        setUserRole(null);
        setCartCount(0);


        // Dispatch events to notify other components
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('authChange', {
            detail: { isAuthenticated: false, role: null }
        }));
        window.dispatchEvent(new Event('cartUpdated'));

        router.push('/');
    };



    const isActive = (path: string) => {
        return pathname === path;
    };



    
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href="/" className="logo" onClick={() => setIsMenuOpen(false)}>
          ShopEase
        </Link>

        <div className="menu-icon" onClick={toggleMenu}>
          ☰
        </div>

        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <li>
            <Link
              href="/"
              className="nav-link"
              style={isActive('/') ? { color: 'var(--secondary-color)' } : {}}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
          </li>

          <li>
            <Link
              href="/products"
              className="nav-link"
              style={isActive('/products') ? { color: 'var(--secondary-color)' } : {}}
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>
          </li>

          <li>
            <Link
              href="/categories"
              className="nav-link"
              style={isActive('/categories') ? { color: 'var(--secondary-color)' } : {}}
              onClick={() => setIsMenuOpen(false)}
            >
              Categories
            </Link>
          </li>


          {isLoggedIn && (
            <>
              <li>
                <Link
                  href="/cart"
                  className="nav-link cart-icon"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🛒
                  {cartCount > 0 && (
                    <span className="cart-count">{cartCount}</span>
                  )}
                </Link>
              </li>

              <li>
                <Link
                  href="/orders"
                  className="nav-link"
                  style={isActive('/orders') ? { color: 'var(--secondary-color)' } : {}}
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Orders
                </Link>
              </li>

              <li>
                <Link
                  href="/profile"
                  className="nav-link"
                  style={isActive('/profile') ? { color: 'var(--secondary-color)' } : {}}
                  onClick={() => setIsMenuOpen(false)}
                >
                  👤 Profile
                </Link>
              </li>
            </>
          )}

          {userRole === 'ADMIN' && (
            <>
              <li>
                <Link
                  href="/admin/dashboard"
                  className="nav-link"
                  style={isActive('/admin/dashboard') ? { color: 'var(--secondary-color)' } : {}}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin
                </Link>
              </li>
            </>
          )}

          {userRole === 'DELIVERY' && (
            <li>
              <Link
                href="/delivery"
                className="nav-link"
                style={isActive('/dashboard/delivery') ? { color: 'var(--secondary-color)' } : {}}
                onClick={() => setIsMenuOpen(false)}
              >
                Delivery Dashboard
              </Link>
            </li>
          )}

          <div className="auth-buttons">
            {!isLoggedIn ? (
              <>
                <Link
                  href="/login"
                  className="btn-login"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="btn-signup"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="user-menu">
                <button onClick={handleLogout} className="btn-logout">
                  Logout
                </button>
              </div>
            )}
          </div>
        </ul>
      </div>
    </nav>
  );
}
