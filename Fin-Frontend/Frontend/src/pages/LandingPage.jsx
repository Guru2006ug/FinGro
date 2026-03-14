import { Link } from 'react-router-dom';
import { Zap, ArrowRight, TrendingUp, BarChart3, Shield, Sun, Moon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import './LandingPage.css';

const products = [
  {
    title: 'FinGrow Kite',
    icon: TrendingUp,
    desc: 'Our ultra-fast flagship trading platform with advanced charting, order types, and real-time market data.',
    link: '#',
  },
  {
    title: 'Console',
    icon: BarChart3,
    desc: 'Central dashboard for account management, portfolio tracking, funds, and detailed reports.',
    link: '#',
  },
  {
    title: 'Coin',
    icon: Shield,
    desc: 'Invest in direct mutual funds online, commission-free. Save up to ₹10,000 in commissions every year.',
    link: '#',
  },
];

const numbers = [
  { value: '1.5+ Cr', label: 'Active clients' },
  { value: '₹3,500+ Cr', label: 'Daily turnover' },
  { value: '<1ms', label: 'Order execution' },
];

/* Floating symbols throughout page */
const floatingSymbols = [
  { char: '₹', className: 'float-1' },
  { char: '$', className: 'float-2' },
  { char: '€', className: 'float-3' },
  { char: '¥', className: 'float-4' },
  { char: '₿', className: 'float-5' },
  { char: '₹', className: 'float-6' },
  { char: '$', className: 'float-7' },
  { char: '£', className: 'float-8' },
  { char: '₹', className: 'float-9' },
  { char: '$', className: 'float-10' },
  { char: '€', className: 'float-11' },
  { char: '¥', className: 'float-12' },
  { char: '₿', className: 'float-13' },
  { char: '£', className: 'float-14' },
];

/* Ticker tape data */
const tickerItems = [
  { symbol: 'NIFTY 50', price: '24,857.30', change: '+0.82%', up: true },
  { symbol: 'SENSEX', price: '81,765.40', change: '+0.76%', up: true },
  { symbol: 'RELIANCE', price: '₹2,943.50', change: '+1.23%', up: true },
  { symbol: 'TCS', price: '₹4,125.80', change: '-0.45%', up: false },
  { symbol: 'INFY', price: '₹1,876.20', change: '+0.95%', up: true },
  { symbol: 'HDFC', price: '₹1,742.60', change: '-0.38%', up: false },
  { symbol: 'BTC/USD', price: '$64,231.50', change: '+2.34%', up: true },
  { symbol: 'ETH/USD', price: '$3,456.80', change: '+1.87%', up: true },
];

/* Hook: observe elements for scroll reveal */
function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('revealed');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    const el = ref.current;
    if (el) {
      el.querySelectorAll('.reveal').forEach((child) => observer.observe(child));
    }
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function LandingPage() {
  const pageRef = useScrollReveal();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="landing" ref={pageRef}>

      {/* ─── Navbar ─────────────────────── */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <Link to="/" className="landing-logo">
            <Zap size={20} className="logo-icon-svg" />
            <span className="landing-logo-text">FinGrow</span>
          </Link>

          <nav className="landing-nav-links">
            <Link to="/register">Signup</Link>
            <a href="#about">About</a>
            <a href="#pricing">Pricing</a>
          </nav>

          <div className="landing-nav-actions">
            <button
              className="landing-theme-toggle"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Night Mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link to="/login" className="nav-signin">Sign in</Link>
          </div>
        </div>
      </header>

      {/* ─── Live Ticker Tape ──────────── */}
      <div className="ticker-tape">
        <div className="ticker-track">
          {[...tickerItems, ...tickerItems].map((t, i) => (
            <span className="ticker-item" key={i}>
              <span className="ticker-symbol">{t.symbol}</span>
              <span className="ticker-price">{t.price}</span>
              <span className={`ticker-change ${t.up ? 'up' : 'down'}`}>{t.change}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ─── Hero ──────────────────────── */}
      <section className="hero">
        {/* Floating currency symbols — hero only */}
        <div className="floating-symbols" aria-hidden="true">
          {floatingSymbols.map((s, i) => (
            <span className={`floating-icon ${s.className}`} key={i}>{s.char}</span>
          ))}
        </div>
        <div className="hero-inner">
          <div className="hero-text fade-in-up">
            <h1>Invest in everything</h1>
            <p>
              Online platform to invest in stocks, derivatives, mutual funds, ETFs, bonds, and more.
            </p>
            <Link to="/register" className="btn-primary">
              Sign up for free
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Numbers strip ─────────────── */}
      <section className="numbers-strip reveal">
        <div className="numbers-inner">
          {numbers.map((n, i) => (
            <div className="number-item" key={i}>
              <span className="number-value">{n.value}</span>
              <span className="number-label">{n.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── About section ─────────────── */}
      <section className="about-section reveal" id="about">
        <div className="about-inner">
          <div className="about-left">
            <h2>Trust with confidence</h2>
            <p>We believe that modern trading should be simple, transparent, and accessible to everyone.</p>
          </div>
          <div className="about-right">
            <div className="about-point">
              <h4>Zero brokerage</h4>
              <p>Free equity delivery trades. Flat ₹20 or 0.03% per executed order on intraday and F&O.</p>
            </div>
            <div className="about-point">
              <h4>No hidden charges</h4>
              <p>No account maintenance fees, no software charges. Only standard regulatory charges apply.</p>
            </div>
            <div className="about-point">
              <h4>Bank-grade security</h4>
              <p>2FA authentication, 256-bit encryption, and segregated client funds at all times.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Products / Ecosystem ──────── */}
      {/* ─── Pricing ───────────────────── */}
      <section className="pricing-section reveal" id="pricing">
        <h2>Unbeatable pricing</h2>
        <p className="pricing-subtitle">Simple, transparent pricing with no hidden fees.</p>

        <div className="pricing-grid">
          <div className="pricing-card">
            <div className="pricing-amount">₹0</div>
            <div className="pricing-label">Free equity delivery</div>
            <p>All equity delivery investments are absolutely free — ₹0 brokerage.</p>
          </div>
          <div className="pricing-card">
            <div className="pricing-amount">₹20</div>
            <div className="pricing-label">Intraday & F&O</div>
            <p>Flat ₹20 or 0.03% (whichever is lower) per executed order.</p>
          </div>
          <div className="pricing-card">
            <div className="pricing-amount">₹0</div>
            <div className="pricing-label">Account opening</div>
            <p>Free account opening. No annual maintenance charges on your demat account.</p>
          </div>
        </div>
      </section>

      {/* ─── CTA ───────────────────────── */}
      <section className="cta-section reveal">
        <h2>Open a free account</h2>
        <p>Join 1.5+ crore traders and investors on India's fastest trading platform.</p>
        <Link to="/register" className="btn-primary">
          Sign up now
        </Link>
      </section>

      {/* ─── Footer ────────────────────── */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="landing-logo">
              <Zap size={18} className="logo-icon-svg" />
              <span className="landing-logo-text">FinGrow</span>
            </div>
            <p>© 2010 – 2026, FinGrow Ltd.<br />All rights reserved.</p>
          </div>

          <div className="footer-links">
            <div className="footer-col">
              <h4>Account</h4>
              <a href="#">Open demat account</a>
              <a href="#">Fund transfer</a>
              <a href="#">Commodity</a>
            </div>
            <div className="footer-col">
              <h4>Support</h4>
              <a href="#">Contact us</a>
              <a href="#">Support portal</a>
              <a href="#">Bulletin</a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Careers</a>
              <a href="#">Press & media</a>
            </div>
            <div className="footer-col">
              <h4>Quick links</h4>
              <a href="#">Market holidays</a>
              <a href="#">Calculators</a>
              <a href="#">Brokerage charges</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>FinGrow Ltd.: Member of NSE &amp; BSE. SEBI registered. All investments are subject to market risks.</p>
        </div>
      </footer>
    </div>
  );
}
