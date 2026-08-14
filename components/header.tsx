'use client';
import { useState } from 'react';
import Link from 'next/link';

type HeaderProps = {
  cartCount: number;
  onCartClick: () => void;
};

export function Header({ cartCount, onCartClick }: HeaderProps) {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <header className="site-header">
      <div className="logo-wrapper">
        <Link href="/" className="logo-wrapper">
          <img src="/images/logo1.png" alt="MSL Logo" className="logo-img" />
          <div>
            <span className="logo-text">MSL PIZZERIA</span>
            <span className="logo-sub">Місце ситих людей</span>
          </div>
        </Link>
      </div>

      {/* Desktop Nav */}
      <nav className={`nav-links ${mobileMenu ? 'mobile-active' : ''}`}>
        <a href="#menu" className="nav-link" onClick={() => setMobileMenu(false)}>Меню</a>
        <a href="#delivery" className="nav-link" onClick={() => setMobileMenu(false)}>Доставка</a>
        <a href="#contacts" className="nav-link" onClick={() => setMobileMenu(false)}>Контакти</a>
      </nav>

      <div className="header-actions">
        <button className="cart-trigger" onClick={onCartClick} aria-label="Відкрити кошик">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </button>

        {/* Hamburger for mobile */}
        <button 
          className="cart-trigger burger" 
          onClick={() => setMobileMenu(!mobileMenu)}
          aria-label="Меню"
          style={{ display: 'none' }} /* overridden in CSS or styled below */
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            {mobileMenu ? (
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round"/>
            )}
          </svg>
        </button>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .burger {
            display: flex !important;
          }
          header.site-header nav.nav-links {
            position: fixed;
            top: 80px;
            left: 0;
            right: 0;
            background: #0a0b0d;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            padding: 24px;
            gap: 20px;
            transform: translateY(-150%);
            transition: var(--transition-smooth);
            z-index: 99;
          }
          header.site-header nav.nav-links.mobile-active {
            transform: translateY(0);
          }
        }
      `}</style>
    </header>
  );
}
