# 🎨 Premium Design - Quick Reference

## Class Names Cheatsheet

### Headers & Containers
```jsx
<header className="header-premium">      // Sticky premium navbar
<section className="section-premium dark"> // Dark premium section
<section className="section-premium light"> // Light premium section
<div className="container">               // Responsive container
```

### Hero & Landing
```jsx
<section className="hero-premium">    // Full-screen premium hero
<h1 className="hero-title">          // Gradient animated title
<p className="hero-subtitle">         // Styled subtitle
<span className="hero-badge">        // Premium badge (NEW, SOON)
<div className="hero-cta">           // CTA button container
```

### Buttons
```jsx
<button className="btn-premium btn-primary">    // Main purple button
<button className="btn-premium btn-secondary">  // Purple outline button
<button className="btn-premium btn-gradient">   // Sunset gradient button
```

### Cards & Grids
```jsx
<div className="card-premium">           // Single premium card
<div className="feature-grid-premium">   // Auto-responsive feature grid
<div className="feature-card">           // Single feature card
<div className="stats-premium">          // Stats grid (auto 4-column)
<div className="stat-card">              // Individual stat card
```

### Typography
```jsx
<h1>                    // Auto 2rem → 4rem, gradient
<h2>                    // Auto 1.5rem → 2.5rem
<h3>                    // Auto 1.25rem → 1.875rem
<p className="body-responsive">  // Auto 0.875rem → 1.125rem
<span className="badge-premium"> // Premium badge styling
```

### Timeline
```jsx
<div className="timeline-premium">    // Premium timeline container
<div className="timeline-item">       // Individual timeline item
<div className="timeline-dot">        // Timeline dot marker
<div className="timeline-content">    // Timeline content area
```

### Forms
```jsx
<form className="form-premium">
  <div className="form-group">
    <label>Field Label</label>
    <input />  // Auto premium styling
  </div>
</form>
```

### Footer
```jsx
<footer className="footer-premium"> // Premium footer
<div className="footer-grid">        // Responsive grid
<div className="footer-section">     // Footer column
<div className="footer-bottom">      // Copyright area
```

### Decorative Elements
```jsx
<hr className="divider-premium" />   // Animated gradient divider
<div className="glass">              // Glassmorphism effect
```

---

## Color Usage

### Quick Color Swatches
```jsx
// Use CSS variables for consistency
style={{ color: 'var(--color-purple)' }}      // #8b5cf6
style={{ color: 'var(--color-cyan)' }}         // #06b6d4
style={{ color: 'var(--color-gold)' }}         // #f59e0b
style={{ color: 'var(--color-emerald)' }}      // #10b981
style={{ background: 'var(--gradient-primary)' }}
style={{ background: 'var(--gradient-sunset)' }}
```

### Text Color Classes
```jsx
className="text-primary"   // White
className="text-secondary" // Light gray
className="text-muted"     // Medium gray
```

---

## Animation Classes

### Scroll Animations
```jsx
<div className="scroll-animate active">    // Fade in from bottom
<div className="animate-fade-in-up">       // Fade up animation
<div className="animate-slide-in-left">    // Slide from left
<div className="animate-slide-in-right">   // Slide from right
<div className="animate-scale-in">         // Scale in animation
<div className="animate-pulse-glow">       // Pulsing glow effect
```

---

## Shadow & Depth

```jsx
// Add subtle depth to elements
style={{ boxShadow: 'var(--shadow-md)' }}    // Light shadow
style={{ boxShadow: 'var(--shadow-lg)' }}    // Medium shadow
style={{ boxShadow: 'var(--shadow-xl)' }}    // Heavy shadow
style={{ boxShadow: 'var(--shadow-2xl)' }}   // Very heavy
style={{ boxShadow: 'var(--shadow-glow)' }}  // Purple glow
```

---

## Complete Simple Premium Page

```jsx
import React from 'react';

export default function SimplePremiumPage() {
  return (
    <>
      {/* Header */}
      <header className="header-premium">
        <div className="header-content">
          <div className="logo-premium">Premium Site</div>
          <button className="btn-premium btn-primary">Sign In</button>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-premium">
        <div className="hero-content">
          <span className="hero-badge">✨ PREMIUM</span>
          <h1>Welcome to Premium Design</h1>
          <p className="hero-subtitle">
            Beautiful, modern, and professional
          </p>
          <div className="hero-cta">
            <button className="btn-premium btn-primary">
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-premium dark">
        <h2 style={{ textAlign: 'center', marginBottom: '60px' }}>
          Premium Features
        </h2>
        <div className="feature-grid-premium">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Fast</h3>
            <p>Lightning quick performance</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure</h3>
            <p>Enterprise-grade security</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Scalable</h3>
            <p>Grows with your business</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-premium">
        <div className="stats-premium">
          <div className="stat-card">
            <div className="stat-number">100+</div>
            <div className="stat-label">Happy Clients</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">50K+</div>
            <div className="stat-label">Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">99.9%</div>
            <div className="stat-label">Uptime</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Support</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-premium" style={{
        background: 'var(--gradient-primary)',
        textAlign: 'center'
      }}>
        <h2 style={{ color: 'white' }}>
          Ready to Get Started?
        </h2>
        <button className="btn-premium" style={{
          background: 'white',
          color: '#667eea',
          marginTop: '30px'
        }}>
          Start Free Trial
        </button>
      </section>

      {/* Footer */}
      <footer className="footer-premium">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>&copy; 2024 Premium Site. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
```

---

## 🎯 Quick Tips

1. **Always use `className="section-premium dark"` OR `light`** for sections
2. **Buttons need both classes**: `btn-premium btn-primary`
3. **Hero content must wrap in `hero-content`** div
4. **Use CSS variables** for colors: `var(--color-purple)`
5. **Features grid auto-responsive** - no media queries needed
6. **All padding automatically responsive** - no hardcoding needed
7. **Typography scales automatically** - use clamp() sizing
8. **Animations work on scroll** - add `scroll-animate` class

---

## 📦 All Styles Imported Globally

In `main.jsx`:
```jsx
import './styles/PremiumDesign.css'        // Premium components
import './styles/FullyResponsive.css'      // Responsive system
import './styles/GridLayouts.css'          // Grid utilities
import './styles/AdvancedLayouts.css'      // Advanced patterns
import './styles/ResponseiveBreakpoints.css' // Breakpoint helpers
```

**Everything is ready to use immediately!** 🚀

---

## Color Palette Summary

| Name | Color | Usage |
|------|-------|-------|
| Navy | #0f172a | Primary background |
| Dark Blue | #1e293b | Secondary bg |
| Purple | #8b5cf6 | Primary accent |
| Pink | #ec4899 | Secondary accent |
| Cyan | #06b6d4 | Highlight |
| Gold | #f59e0b | Premium/luxury |
| Emerald | #10b981 | Success/positive |

---

## Gradient Palette

| Name | Usage |
|------|-------|
| Primary | Purple → Violet (main theme) |
| Secondary | Pink → Red (alerts) |
| Accent | Blue → Cyan (highlights) |
| Gold | Gold → Navy (premium) |
| Sunset | Pink → Yellow (warm) |
| Ocean | Blue → Cyan (cool) |
| Forest | Dark green → Light green (nature) |
| Dark | Navy → Blue (dark mode) |

Your website is now **100% premium enterprise-grade**! 💎✨
