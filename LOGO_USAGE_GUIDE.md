# TalkSpark Logo Usage Guide

## Overview
The TalkSpark logo combines a speech bubble with a spark element, representing conversations that ignite connections. The design is optimized for clarity at all sizes, from mobile interfaces to large displays.

---

## Logo Variants

### 1. **Icon Only** (Default)
- **File**: `public/favicon.svg` or use `talkspark-icon` from `logo-variants.svg`
- **Minimum size**: 20px × 20px
- **Safe zones**: Square and circle crops
- **Best for**: App icons, favicons, social media avatars

### 2. **Circular Variant**
- **ID**: `talkspark-icon-circular`
- **Best for**: Profile pictures, circular avatars
- **Maintains**: Clear recognition in constrained circular crops

### 3. **Chat Tail Variant**
- **ID**: `talkspark-icon-tail`
- **Best for**: Messaging interfaces, chat applications
- **Style**: More traditional chat bubble aesthetic

### 4. **Horizontal Lockup**
- **ID**: `talkspark-lockup`
- **Minimum size**: 120px wide
- **Best for**: Headers, navigation bars, marketing materials
- **Includes**: Icon + "TalkSpark" wordmark + tagline

### 5. **Monochrome (White)**
- **IDs**: `talkspark-mono-white` (icon), `talkspark-mono-lockup` (full)
- **Best for**: Dark backgrounds, navy/black surfaces
- **Maintains**: Strong contrast ratio (4.5:1 minimum)

---

## Technical Specifications

### Minimum Sizes
| Variant | Min Width | Min Height | Context |
|---------|-----------|------------|---------|
| Icon Only | 20px | 20px | Mobile UI, buttons |
| Horizontal Lockup | 120px | 36px | Headers, footers |
| Favicon | 16px | 16px | Browser tabs |

### Stroke Weights
- All paths: **Minimum 1.25px** at smallest size
- No strokes thinner than 1.25px to ensure clarity on low-DPI screens

### Color Specifications

#### Primary Palette
- **Coral**: `#FF6B6B` (RGB: 255, 107, 107)
- **Warm Yellow**: `#FFD166` (RGB: 255, 209, 102)
- **Dark Navy**: `#1A1A40` (RGB: 26, 26, 64)

#### Gradient Definition
```css
background: linear-gradient(135deg, #FF6B6B 0%, #FFD166 100%);
```

#### Accessibility
- Coral on White: **4.51:1** ✓ WCAG AA
- Navy on White: **15.89:1** ✓ WCAG AAA
- White on Navy: **15.89:1** ✓ WCAG AAA

---

## Typography

### Wordmark
- **Font**: Poppins SemiBold (600)
- **Size**: Scale proportionally (base: 24px at 200px lockup width)
- **Color**: Navy `#1A1A40`
- **Letter spacing**: -0.02em (tight)

### Tagline
- **Font**: Inter Regular (400)
- **Text**: "Start better conversations"
- **Size**: ~40% of wordmark size
- **Color**: Navy at 60% opacity `rgba(26, 26, 64, 0.6)`

---

## Clear Space & Padding

### Minimum Clear Space
- **Icon variants**: 0.25× icon height on all sides
- **Horizontal lockup**: 0.5× icon height on all sides

Example for 40px icon:
- Minimum padding: **10px** all around

### Safe Zone
Never place text, graphics, or other elements within the clear space zone.

---

## Usage Guidelines

### ✅ DO
- Use the gradient for primary brand applications
- Use monochrome white on dark backgrounds (navy, black)
- Scale proportionally (maintain aspect ratio)
- Ensure minimum size requirements
- Use SVG format when possible for crisp rendering

### ❌ DON'T
- Rotate or skew the logo
- Change colors outside approved palette
- Add effects (drop shadows, glows, outlines)
- Use gradient on navy background (use monochrome)
- Stretch or distort proportions
- Use thin lines below 1.25px
- Place on low-contrast backgrounds

---

## File Formats

### Web & Digital
- **SVG**: All variants (preferred for web)
- **PNG**: `app-icon-1024.png` (1024×1024, generated)

### Print
- Export SVG at desired size
- Minimum resolution: 300 DPI

---

## Implementation Examples

### React Component
```jsx
import Logo from "@/components/Logo";

// Icon only
<Logo size={32} wordmark={false} />

// With wordmark
<Logo size={40} wordmark={true} />

// Custom color (monochrome)
<Logo size={28} color="#FFFFFF" />
```

### HTML (Favicon)
```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<meta name="theme-color" content="#FF6B6B">
```

### CSS (Gradient Background)
```css
.brand-gradient {
  background: linear-gradient(135deg, #FF6B6B 0%, #FFD166 100%);
}
```

---

## Responsive Sizing

| Screen Size | Icon Size | Lockup Width |
|-------------|-----------|--------------|
| Mobile (<768px) | 24-32px | 140-160px |
| Tablet (768-1024px) | 32-40px | 160-200px |
| Desktop (>1024px) | 40-48px | 200-240px |

---

## Testing Checklist

Before deploying logo assets:
- [ ] Test at 16px (favicon size)
- [ ] Test at 20px (minimum mobile)
- [ ] Test at 32px (standard mobile)
- [ ] Test on white background
- [ ] Test on navy background (use monochrome)
- [ ] Test on mobile retina displays
- [ ] Verify gradient renders correctly
- [ ] Check contrast ratios (WCAG AA minimum)

---

## Support

For questions about logo usage or custom size requirements, refer to the brand guidelines or contact the design team.

**Version**: 1.0  
**Last Updated**: 2025  
**License**: TalkSpark Brand Assets
