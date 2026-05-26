# Legal Pages Integration Guide

## Overview

This guide covers setup and integration of professional Privacy Policy and Terms of Service pages for Technosthan AgriTech.

## Files Created

1. **`frontend/src/pages/PrivacyPolicy.jsx`** - Comprehensive Privacy Policy component
2. **`frontend/src/pages/TermsOfService.jsx`** - Comprehensive Terms of Service component

## Routes Setup

### Option 1: React Router Configuration

Add these routes to your `frontend/src/App.jsx`:

```jsx
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

// In your Routes component:
<Route path="/privacy-policy" element={<PrivacyPolicy />} />
<Route path="/terms-of-service" element={<TermsOfService />} />

// Alternative shorter paths:
<Route path="/privacy" element={<PrivacyPolicy />} />
<Route path="/terms" element={<TermsOfService />} />
```

### Option 2: Full Route Example

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        {/* ... other routes */}
      </Routes>
    </BrowserRouter>
  );
}
```

## Navbar/Footer Integration

### Footer Links Example

Add these links to your footer component (`frontend/src/components/Footer.jsx` or similar):

```jsx
<div className="flex gap-8">
  <Link to="/privacy-policy" className="hover:text-green-500">
    Privacy Policy
  </Link>
  <Link to="/terms-of-service" className="hover:text-green-500">
    Terms of Service
  </Link>
  <a href="/contact" className="hover:text-green-500">
    Contact
  </a>
</div>
```

### Footer Component Integration

```jsx
export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 border-t border-gray-700">
      <div className="max-w-6xl mx-auto px-4">
        {/* ... other footer content ... */}

        <div className="grid grid-cols-3 gap-8 mt-8">
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <nav className="space-y-2">
              <Link to="/privacy-policy">Privacy Policy</Link>
              <Link to="/terms-of-service">Terms of Service</Link>
            </nav>
          </div>
          {/* ... other footer sections ... */}
        </div>
      </div>
    </footer>
  );
}
```

## Login/Registration Page Integration

Add Terms acceptance to your login/registration pages:

```jsx
import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <div>
      {/* ... login form ... */}

      <div className="mt-4 text-sm text-gray-600">
        <p>
          By logging in, you agree to our{" "}
          <Link
            to="/terms-of-service"
            className="text-green-600 hover:underline"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy-policy" className="text-green-600 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
```

## Meta Tags & SEO

Add these meta tags to your `frontend/index.html` or use React Helmet:

```html
<!-- Privacy Policy -->
<meta property="og:title" content="Privacy Policy - Technosthan AgriTech" />
<meta
  property="og:description"
  content="Read our comprehensive privacy policy explaining how we protect your data and use information on the Technosthan AgriTech platform."
/>

<!-- Terms of Service -->
<meta property="og:title" content="Terms of Service - Technosthan AgriTech" />
<meta
  property="og:description"
  content="Review the complete Terms of Service for Technosthan AgriTech, including acceptable use, AI disclaimers, and legal obligations."
/>
```

### Using React Helmet (Recommended)

```jsx
import { Helmet } from "react-helmet";

export default function PrivacyPolicy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - Technosthan AgriTech</title>
        <meta
          name="description"
          content="Comprehensive privacy policy for Technosthan AgriTech. Learn how we collect, use, and protect your personal information."
        />
        <meta
          property="og:title"
          content="Privacy Policy - Technosthan AgriTech"
        />
        <meta
          property="og:description"
          content="Read our privacy policy to understand our data practices."
        />
        <link
          rel="canonical"
          href="https://www.technosthan.com/privacy-policy"
        />
      </Helmet>
      {/* ... component content ... */}
    </>
  );
}
```

## Theme Integration

Both components automatically support your existing theme system:

```jsx
import { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";

const { theme } = useContext(ThemeContext);

// Components automatically adapt to dark/light theme
// No additional styling needed
```

## Accessibility Features

- **Keyboard Navigation:** Tab through sections
- **Screen Reader Support:** Semantic HTML structure
- **Color Contrast:** WCAG AA compliant
- **Expandable Sections:** Click to expand/collapse
- **Large Text:** Readable font sizes

## Mobile Responsive

Both components are fully responsive:

- Mobile: Single column layout
- Tablet: Optimized spacing
- Desktop: Comfortable reading width (max 896px)
- Touch-friendly buttons and sections

## Customization Guide

### Modify Company Information

Replace `[Add your company address]` with your actual address:

```jsx
// In PrivacyPolicy.jsx, section 14.1:
// Before:
**Physical Address:**
Technosthan AgriTech
[Add your company address]

// After:
**Physical Address:**
Technosthan AgriTech
123 Innovation Street
Tech City, TC 12345
```

### Update Email Addresses

Replace email addresses throughout documents:

```jsx
// Search & Replace in both files:
privacy@technosthan.com → your-email@yourcompany.com
support@technosthan.com → support@yourcompany.com
legal@technosthan.com → legal@yourcompany.com
```

### Add Contact Information

```jsx
// In section 14 (Contact & Support):
**Email:** support@technosthan.com
**Phone:** +1 (555) 123-4567  // Add if available
**Business Hours:** 9 AM - 5 PM IST

**Physical Address:**
Technosthan AgriTech
[Your Address]
[City, State ZIP]

**Mailing Address:**
[If different from physical]
```

### Update Jurisdiction

Replace `[Your Jurisdiction]` throughout:

```jsx
// Before:
Arbitration will be held in [Your Jurisdiction]

// After (Example):
Arbitration will be held in New York, USA
Governed by laws of New York
```

## Content Management

### Adding Third-Party Services

When you add new services, update both documents:

**Privacy Policy** - Section 8.2 (Service Providers):

```jsx
*New AI Service:*
- ServiceName API (new AI features)
```

**Terms of Service** - Section 3.2 (AI Providers):

```jsx
- ServiceName API: Advanced features
```

### Updating Agricultural Features

If you add new agricultural features, update:

1. **Privacy Policy** - Section 2.3 (AI Chat Data)
2. **Terms of Service** - Section 3.1 (AI Assistance)
3. **Terms of Service** - Section 4 (Educational Content)

### Adding New Payment Features

When adding payments, update:

1. **Privacy Policy** - Section 2.7 (Payment Information)
2. **Terms of Service** - Section 8 (Payments & Billing)

## Testing Checklist

- [ ] Both pages load without errors
- [ ] Theme switching works (dark/light modes)
- [ ] All sections expand/collapse
- [ ] Links work (internal and external)
- [ ] Mobile responsive layout works
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Page titles display correctly
- [ ] Meta tags visible (inspect page source)
- [ ] Printing works correctly
- [ ] Search functionality highlights terms

## Performance Optimization

### Lazy Loading (if needed)

```jsx
import { lazy, Suspense } from "react";

const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));

// In routes:
<Suspense fallback={<div>Loading...</div>}>
  <PrivacyPolicy />
</Suspense>;
```

### Code Splitting

These pages are automatically code-split by Vite.

## Localization/i18n Support

To add multiple languages, wrap content in translation system:

```jsx
import { useTranslation } from "react-i18next";

export default function PrivacyPolicy() {
  const { t } = useTranslation("legal");

  const sections = [
    {
      id: "intro",
      title: t("privacy.intro.title"),
      // ... rest of sections
    },
  ];
}
```

## Analytics Integration

Track visits to legal pages:

```jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function PrivacyPolicy() {
  const location = useLocation();

  useEffect(() => {
    // Track page view
    window.gtag?.("config", "GA_MEASUREMENT_ID", {
      page_path: location.pathname,
      page_title: "Privacy Policy",
    });
  }, [location.pathname]);

  return {
    /* ... */
  };
}
```

## Legal Compliance Notes

### GDPR Compliance (EU Users)

- Privacy Policy includes GDPR-specific rights (Section 11.14)
- Consent management covered
- Right to be forgotten explained

### CCPA Compliance (California Users)

- Privacy Policy includes CCPA rights (Section 11.14)
- Opt-out mechanisms described
- Transparency requirements met

### COPPA Compliance (US - Children's Online Privacy)

- Children's privacy section included (Section 13)
- Parental consent requirements
- Data collection limitations for minors

### Indian Data Protection

- Privacy Policy covers India's requirements
- Customizable for DPDP Act 2023
- Regional compliance considered

## Support for Compliance

### Document Updates

When Indian data protection laws change:

1. Review privacy policy
2. Update affected sections
3. Notify users of material changes
4. Maintain version history

### Regulatory Requests

Handle data requests in `backend/src/features/admin/`:

- Create endpoint for data export requests
- Implement 30-day response timeline
- Log all requests and responses
- Maintain audit trail

### Right to Access

Implement in account settings:

- Export user data function (already in Privacy Policy Section 10.6)
- Multiple formats (JSON, CSV, PDF)
- Immediate download capability

## Version Control

Keep track of legal updates:

```
frontend/src/pages/
├── PrivacyPolicy.jsx
│   └── Version 1.0 (May 26, 2026) - Initial release
├── TermsOfService.jsx
│   └── Version 1.0 (May 26, 2026) - Initial release
```

Create a changelog:

```markdown
# Legal Document Changelog

## Version 1.0 (May 26, 2026)

- Initial launch
- Comprehensive privacy policy
- Complete terms of service
- AI disclaimer and agricultural guidance warnings
```

## Additional Resources

### Links to Add to Your Site

```
/privacy-policy - Full privacy policy
/terms-of-service - Full terms of service
/cookies - Cookie policy (can create separately)
/contact - Contact/support page
/data-request - GDPR/CCPA data request form
```

### Backend Support Routes (Optional)

```javascript
// backend/src/features/admin/legal.controller.js
export const getPrivacyPolicy = async (req, res) => {
  res.json({
    version: "1.0",
    lastUpdated: "2026-05-26",
    locale: req.query.locale || "en",
  });
};

export const getTermsOfService = async (req, res) => {
  res.json({
    version: "1.0",
    lastUpdated: "2026-05-26",
    locale: req.query.locale || "en",
  });
};
```

## Frequently Updated Sections

These sections should be reviewed regularly:

1. **AI Providers** (Section 3.2) - Update when adding new AI services
2. **Service Providers** (Section 8.2) - Update when third-party services change
3. **Data Retention** (Section 10) - Update per legal requirements
4. **Contact Information** (Sections 12/14) - Keep current
5. **Effective Dates** - Update when policy changes

## Deployment Checklist

Before going live:

- [ ] Update all company information and contact details
- [ ] Update all email addresses
- [ ] Set correct jurisdiction
- [ ] Verify all third-party services listed
- [ ] Test all links and navigation
- [ ] Mobile responsiveness confirmed
- [ ] Theme compatibility tested
- [ ] Meta tags added
- [ ] URLs added to sitemap
- [ ] Footer links updated
- [ ] Privacy policy linked from login
- [ ] Terms acceptance in registration
- [ ] Backup created before deployment

## Support

For questions about content:

- Email: privacy@technosthan.com
- Legal questions: legal@technosthan.com
- Technical issues: support@technosthan.com

---

**Generated:** May 26, 2026  
**Last Updated:** May 26, 2026  
**Status:** Production Ready
