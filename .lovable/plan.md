
# Update Homepage Hero Section

This plan updates the hero section copy to better establish BetterOpnr as a brand entity with clearer messaging about what it is, who it's for, and what problem it solves.

## Changes Overview

### 1. Update H1 Headline
**Location:** Lines 51 in `src/pages/Landing.tsx`

| Current | New |
|---------|-----|
| BetterOpnr: AI Dating Openers That Actually Sound Human | BetterOpnr — AI Dating Openers That Start Real Conversations |

### 2. Update Subheading Paragraph
**Location:** Lines 67-69 in `src/pages/Landing.tsx`

**Current (1 sentence):**
> BetterOpnr helps you create confident conversation starters and better first messages using AI designed for real dating conversations — not generic pickup lines.

**New (3 sentences):**
> BetterOpnr is an AI-powered dating opener tool designed to help people start natural, confident conversations on dating apps. Instead of awkward first messages, BetterOpnr analyzes your match and suggests thoughtful openers that feel human, not scripted. Built for modern dating, privacy-first, and easy to use.

## What Stays the Same
- CTA button text: "Try BetterOpnr Free"
- All existing animations (motion.div, motion.h1)
- Decorative Spark elements
- Layout structure (header banner with H1, content section with text + video grid)
- Video section and mobile CTA placement

---

## Technical Details

**File to modify:** `src/pages/Landing.tsx`

**Exact changes:**

1. **Line 51** - Replace H1 text content:
```tsx
BetterOpnr — AI Dating Openers That Start Real Conversations
```

2. **Lines 67-69** - Replace subheading paragraph:
```tsx
<p className="text-lg sm:text-xl text-muted-foreground max-w-xl">
  BetterOpnr is an AI-powered dating opener tool designed to help people start natural, confident conversations on dating apps. Instead of awkward first messages, BetterOpnr analyzes your match and suggests thoughtful openers that feel human, not scripted. Built for modern dating, privacy-first, and easy to use.
</p>
```

**Note:** The JSON-LD structured data in `index.html` references the old H1. After this change, we should also update the WebPage name in the structured data to match the new H1 for consistency.
