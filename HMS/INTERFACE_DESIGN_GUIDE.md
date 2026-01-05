# Health Management System - Interface Design Guide

## Visual Design System

### Color Palette
```css
/* Primary Colors */
--primary: #4f46e5;           /* Professional Blue */
--primary-light: #6366f1;     /* Lighter Blue */
--primary-dark: #3730a3;      /* Darker Blue */

/* Semantic Colors */
--success: #10b981;           /* Medical Green */
--warning: #f59e0b;           /* Caution Yellow */
--danger: #ef4444;            /* Alert Red */
--info: #06b6d4;              /* Information Cyan */

/* Neutral Colors */
--gray-50: #f9fafb;           /* Very Light Gray */
--gray-100: #f3f4f6;          /* Light Gray */
--gray-200: #e5e7eb;          /* Border Gray */
--gray-300: #d1d5db;          /* Medium Light Gray */
--gray-400: #9ca3af;          /* Medium Gray */
--gray-500: #6b7280;          /* Text Gray */
--gray-600: #4b5563;          /* Dark Text Gray */
--gray-700: #374151;          /* Darker Text Gray */
--gray-800: #1f2937;          /* Very Dark Gray */
--gray-900: #111827;          /* Almost Black */

/* Background Colors */
--bg-primary: #ffffff;        /* White Background */
--bg-secondary: #f8fafc;      /* Very Light Blue-Gray */
--bg-tertiary: #f1f5f9;       /* Light Blue-Gray */
--bg-accent: #e0e7ff;         /* Light Blue Accent */
```

### Typography Scale
```css
/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */

/* Font Weights */
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;

/* Line Heights */
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

### Spacing Scale
```css
/* Spacing Units */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

### Border Radius Scale
```css
--radius-sm: 0.125rem;   /* 2px */
--radius-md: 0.375rem;   /* 6px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-2xl: 1rem;      /* 16px */
--radius-3xl: 1.5rem;    /* 24px */
--radius-full: 9999px;   /* Fully rounded */
```

### Shadow Scale
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

## Component Design Patterns

### 1. Dashboard Cards
```css
/* Card Base Styles */
.dashboard-card {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--gray-200);
  transition: all 0.2s ease;
}

.dashboard-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Card Header */
.card-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.card-icon {
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xl);
}

.card-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--gray-900);
  margin: 0;
}

/* Card Content */
.card-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.card-metric {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--gray-900);
  margin: 0;
}

.card-subtitle {
  font-size: var(--text-sm);
  color: var(--gray-500);
  margin: 0;
}
```

### 2. Navigation Buttons
```css
/* Navigation Button Base */
.nav-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-3);
  background: transparent;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 5rem;
  position: relative;
}

.nav-button:hover {
  background: var(--gray-100);
  transform: translateY(-1px);
}

.nav-button.active {
  background: var(--primary);
  color: white;
  box-shadow: var(--shadow-md);
}

.nav-button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 1.25rem;
  height: 0.1875rem;
  background: white;
  border-radius: var(--radius-sm);
}

/* Navigation Icon */
.nav-icon {
  font-size: var(--text-xl);
  transition: transform 0.2s ease;
}

.nav-button:hover .nav-icon {
  transform: scale(1.1);
}

/* Navigation Label */
.nav-label {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  text-align: center;
  line-height: var(--leading-tight);
}
```

### 3. Form Elements
```css
/* Form Group */
.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.form-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--gray-700);
  margin-bottom: var(--space-1);
}

.form-input {
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  transition: all 0.2s ease;
  background: var(--bg-primary);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-input::placeholder {
  color: var(--gray-400);
}

/* Form Button */
.form-button {
  padding: var(--space-3) var(--space-6);
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
}

.form-button:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.form-button:active {
  transform: translateY(0);
}
```

### 4. Status Indicators
```css
/* Status Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-badge.success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success);
}

.status-badge.warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning);
}

.status-badge.danger {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
}

.status-badge.info {
  background: rgba(6, 182, 212, 0.1);
  color: var(--info);
}

/* Status Indicator Dot */
.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.status-dot.success { background: var(--success); }
.status-dot.warning { background: var(--warning); }
.status-dot.danger { background: var(--danger); }
.status-dot.info { background: var(--info); }
```

## Layout Patterns

### 1. Dashboard Grid
```css
/* Dashboard Container */
.dashboard-grid {
  display: grid;
  gap: var(--space-6);
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
}

/* Stats Grid */
.stats-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
}

/* Action Grid */
.action-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
}
```

### 2. Header Layout
```css
/* Header Container */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-8);
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  color: white;
  box-shadow: var(--shadow-lg);
}

/* Header Left Section */
.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.header-logo {
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.header-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  margin: 0;
}

/* Header Right Section */
.header-right {
  display: flex;
  align-items: center;
  gap: var(--space-6);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-4);
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(10px);
}
```

### 3. Sidebar Navigation
```css
/* Sidebar Container */
.app-sidebar {
  width: 16rem;
  background: var(--bg-primary);
  border-right: 1px solid var(--gray-200);
  display: flex;
  flex-direction: column;
}

/* Navigation List */
.nav-list {
  list-style: none;
  margin: 0;
  padding: var(--space-4) 0;
}

.nav-item {
  margin-bottom: var(--space-1);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  color: var(--gray-600);
  text-decoration: none;
  transition: all 0.2s ease;
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
  margin-right: var(--space-2);
}

.nav-link:hover {
  background: var(--gray-100);
  color: var(--gray-900);
}

.nav-link.active {
  background: var(--primary);
  color: white;
  box-shadow: var(--shadow-md);
}

.nav-link-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}
```

## Responsive Design Patterns

### Mobile Layouts (320px - 480px)
```css
@media (max-width: 480px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }

  .app-header {
    flex-direction: column;
    gap: var(--space-3);
    text-align: center;
    padding: var(--space-3);
  }

  .header-right {
    flex-direction: column;
    gap: var(--space-3);
    width: 100%;
  }

  .nav-button {
    min-width: 3.5rem;
    padding: var(--space-3) var(--space-2);
  }

  .nav-label {
    display: none;
  }
}
```

### Tablet Layouts (481px - 768px)
```css
@media (min-width: 481px) and (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .nav-button .nav-label {
    font-size: 0.6875rem; /* 11px */
  }
}
```

### Desktop Layouts (769px+)
```css
@media (min-width: 769px) {
  .dashboard-grid {
    grid-template-columns: repeat(auto-fit, minmax(22rem, 1fr));
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  }

  .app-sidebar {
    position: fixed;
    height: 100vh;
    overflow-y: auto;
  }
}
```

## Animation and Interaction Patterns

### Hover Effects
```css
/* Subtle hover animations */
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Color transitions */
.color-transition {
  transition: color 0.2s ease, background-color 0.2s ease;
}

/* Scale effects */
.scale-hover {
  transition: transform 0.2s ease;
}

.scale-hover:hover {
  transform: scale(1.02);
}
```

### Loading States
```css
/* Loading skeleton */
.loading-skeleton {
  background: linear-gradient(90deg, var(--gray-200) 25%, var(--gray-100) 50%, var(--gray-200) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Loading spinner */
.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--gray-200);
  border-top: 3px solid var(--primary);
  border-radius: var(--radius-full);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

## Accessibility Guidelines

### Focus Management
```css
/* Focus indicators */
.focus-visible:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
  border-radius: var(--radius-md);
}

/* Skip links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--primary);
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: var(--radius-md);
  z-index: 100;
}

.skip-link:focus {
  top: 6px;
}
```

### Color Contrast
```css
/* High contrast mode support */
@media (prefers-contrast: high) {
  :root {
    --primary: #0000ff;
    --gray-900: #000000;
    --bg-primary: #ffffff;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

This design guide provides a comprehensive foundation for maintaining visual consistency and usability across the Health Management System interface. All components follow these patterns to ensure a cohesive and professional user experience.
