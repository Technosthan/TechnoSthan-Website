# Grid & Layout Utilities Guide

## Overview
Created 3 comprehensive CSS utility files with row and column based grid layouts for your React project.

## Files Created

### 1. **GridLayouts.css** - Basic Grid System
Core grid utilities for standard layouts with responsive support.

**Key Classes:**

#### Basic Row Layouts
```jsx
<div className="grid-row">
  {/* Single column, full width */}
</div>

<div className="grid-row gap-large">
  {/* With larger gaps */}
</div>
```

#### Column Layouts
```jsx
// 2 columns
<div className="grid-cols-2">
  <div>Column 1</div>
  <div>Column 2</div>
</div>

// 3 columns
<div className="grid-cols-3">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>

// 4 columns
<div className="grid-cols-4">
  {/* 4 equal width columns */}
</div>
```

#### Responsive Grid (Auto-fit)
```jsx
// Automatically adjusts columns based on screen size
<div className="grid-auto-fit">
  {cardItems.map(card => <Card key={card.id} {...card} />)}
</div>

// With minimum width
<div className="grid-auto-fit min-280">
  {/* Minimum 280px width per item */}
</div>

<div className="grid-auto-fit min-300">
  {/* Minimum 300px width per item */}
</div>
```

#### Equal Height Rows
```jsx
// All items maintain equal height within their row
<div className="grid-auto-fit grid-auto-rows-equal">
  {serviceCards.map(card => <ServiceCard {...card} />)}
</div>
```

#### Common Patterns
```jsx
// Service cards - responsive 3-column
<div className="service-grid">
  {services.map(service => <ServiceCard {...service} />)}
</div>

// Product showcase - responsive 4-column
<div className="product-grid">
  {products.map(product => <ProductCard {...product} />)}
</div>

// Team members - responsive 2-column
<div className="team-grid">
  {team.map(member => <TeamCard {...member} />)}
</div>

// Feature showcase
<div className="feature-grid">
  {features.map(feature => <FeatureCard {...feature} />)}
</div>
```

---

### 2. **AdvancedLayouts.css** - Complex Layouts
Specialized layouts for specific UI patterns.

**Key Classes:**

#### Form Layouts
```jsx
// Single column form
<form className="form-grid">
  <div className="form-group">
    <label>Name</label>
    <input type="text" />
  </div>
</form>

// Two-column form
<form className="form-grid-2col">
  <div className="form-group">
    <label>First Name</label>
    <input type="text" />
  </div>
  <div className="form-group">
    <label>Last Name</label>
    <input type="text" />
  </div>
  <div className="form-group full-width">
    <label>Email (full width)</label>
    <input type="email" />
  </div>
</form>
```

#### Dashboard Layout
```jsx
<div className="dashboard-grid">
  <div className="dashboard-widget">
    {/* Widget 1 - takes 1 cell */}
  </div>
  <div className="dashboard-widget">
    {/* Widget 2 - takes 1 cell */}
  </div>
  <div className="dashboard-widget span-2">
    {/* Widget 3 - takes 2 cells */}
  </div>
  <div className="dashboard-widget span-full">
    {/* Widget 4 - spans full width */}
  </div>
</div>
```

#### Sidebar Layout
```jsx
<div className="layout-sidebar">
  <aside className="sidebar">
    {/* Navigation or filters */}
  </aside>
  <main className="main-content">
    {/* Main content area */}
  </main>
</div>
```

#### Hero Section
```jsx
<section className="hero-grid">
  <div className="hero-text">
    <h1>Welcome</h1>
    <p>Description text</p>
  </div>
  <div className="hero-image">
    <img src="hero.jpg" alt="Hero" />
  </div>
</section>
```

#### Footer Layout
```jsx
<footer className="footer-grid">
  <div className="footer-section">
    <h4>Company</h4>
    <a href="#about">About Us</a>
    <a href="#careers">Careers</a>
  </div>
  <div className="footer-section">
    <h4>Products</h4>
    <a href="#product1">Product 1</a>
    <a href="#product2">Product 2</a>
  </div>
  <div className="footer-section">
    <h4>Support</h4>
    <a href="#help">Help Center</a>
    <a href="#contact">Contact Us</a>
  </div>
</footer>
```

#### Navigation Layout
```jsx
<nav className="nav-grid">
  <div className="nav-logo">
    <Logo />
  </div>
  <div className="nav-menu">
    <Menu />
  </div>
  <div className="nav-actions">
    <LoginButton />
  </div>
</nav>
```

---

### 3. **ResponsiveBreakpoints.css** - Breakpoint Utilities
Mobile-first responsive utilities and modern CSS features.

**Breakpoints:**
- **Mobile**: 0 - 639px
- **Tablet**: 640px - 1023px
- **Desktop**: 1024px - 1279px
- **Extra Large**: 1280px+

**Key Classes:**

#### Responsive Grid
```jsx
// Mobile-first: 1 column on mobile
// 2 columns on tablets
// 3 columns on desktop
<div className="grid-responsive md:cols-2 lg:cols-3">
  {items.map(item => <Item {...item} />)}
</div>
```

#### Conditional Display
```jsx
// Hidden on mobile
<div className="hidden-sm">
  Desktop only content
</div>

// Hidden on tablets and larger
<div className="hidden-md hidden-lg hidden-xl">
  Mobile only content
</div>
```

#### Accessibility
```jsx
// Respects user's motion preferences
<div className="grid-item">
  {/* Animation will be minimal for users who prefer reduced motion */}
</div>

// Dark mode support
<div className="grid-item">
  {/* Automatically adapts to light/dark mode */}
</div>
```

#### Touch Device Optimization
```jsx
// On touch devices: larger, more tappable targets
// On desktop: hover effects
<div className="grid-item">
  Click or tap me
</div>
```

#### Fluid Sizing
```jsx
// Responsive sizing using CSS clamp()
<div className="grid-fluid">
  {/* Items scale smoothly without media queries */}
</div>

<div className="grid-fluid-tight">
  {/* Tighter spacing */}
</div>

<div className="grid-fluid-wide">
  {/* Wider spacing */}
</div>
```

---

## Usage Examples

### Example 1: Service Cards Page (Like Your TechnoSthan Services)
```jsx
// src/component/Services/Services.jsx
import { useEffect, useState } from 'react';
import '../../styles/GridLayouts.css';

export default function Services() {
  const [services, setServices] = useState([
    { id: 1, title: 'Service 1', desc: '...' },
    { id: 2, title: 'Service 2', desc: '...' },
    // ... more services
  ]);

  return (
    <div className="service-grid">
      {services.map(service => (
        <div key={service.id} className="service-card">
          <h3>{service.title}</h3>
          <p>{service.desc}</p>
        </div>
      ))}
    </div>
  );
}
```

### Example 2: Responsive Product Grid
```jsx
<div className="grid-responsive md:cols-2 lg:cols-4">
  {products.map(product => (
    <div key={product.id} className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p className="price">${product.price}</p>
    </div>
  ))}
</div>
```

### Example 3: Dashboard with Mixed Widget Sizes
```jsx
<div className="dashboard-grid">
  <div className="dashboard-widget">Stats</div>
  <div className="dashboard-widget">Analytics</div>
  <div className="dashboard-widget span-2">Large Chart</div>
  <div className="dashboard-widget span-full">Table</div>
</div>
```

### Example 4: Form with Mixed Column Input
```jsx
<form className="form-grid-2col">
  <div className="form-group">
    <label>First Name</label>
    <input type="text" />
  </div>
  <div className="form-group">
    <label>Last Name</label>
    <input type="text" />
  </div>
  <div className="form-group full-width">
    <label>Email Address</label>
    <input type="email" />
  </div>
  <div className="form-group full-width">
    <label>Message</label>
    <textarea></textarea>
  </div>
</form>
```

---

## How to Import in Your Components

```jsx
// In your component file
import '../styles/GridLayouts.css';
// or
import '../styles/AdvancedLayouts.css';
// or
import '../styles/ResponsiveBreakpoints.css';

// Or add to main.jsx globally
import './styles/GridLayouts.css';
import './styles/AdvancedLayouts.css';
import './styles/ResponsiveBreakpoints.css';
```

---

## Gap Options

All grid layouts support gap modifiers:
- `gap-small` → 10px
- `gap-medium` → 20px (default)
- `gap-large` → 30px
- `gap-xl` → 40px

```jsx
<div className="grid-auto-fit gap-large">
  {/* Large gap between items */}
</div>
```

---

## Responsive Behavior

### Grid Breakpoints (Automatic)
- **Mobile (< 600px)**: Most grids convert to 1 column
- **Tablet (600px - 768px)**: 2 columns
- **Desktop (> 768px)**: 3-4 columns (depends on class)
- **Large screens (> 1200px)**: Full width with max-width

### Manual Responsive Classes
```jsx
// Mobile: 1 col
// Tablet: 2 cols
// Desktop: 3 cols
// XL: 4 cols
<div className="grid-responsive md:cols-2 lg:cols-3 xl:cols-4">
  {items}
</div>
```

---

## Tips & Best Practices

1. **Use semantic classes**: `service-grid`, `product-grid` instead of generic `grid-cols-3`
2. **Let auto-fit handle responsiveness**: Use `grid-auto-fit` instead of managing media queries
3. **Set max-width on containers**: Prevents content from stretching on huge screens
4. **Use gap utilities**: Consistent spacing across your app
5. **Mobile-first approach**: Design for mobile, then enhance for larger screens

---

## Browser Support

- Grid: All modern browsers (IE 11 not supported, but that's okay)
- Flexbox: All modern browsers
- CSS Variables (clamp): Modern browsers (2021+)
- Aspect Ratio: Modern browsers

---

## Next Steps

1. **Import these CSS files** in your `main.jsx` or individual components
2. **Replace hardcoded CSS** in existing component files with these classes
3. **Test responsiveness** on different screen sizes
4. **Customize as needed**: Adjust gap, colors, and sizing to match your design system

---

Need help integrating these into specific components? Let me know!
