
## Standardize iOS Payment Copy

Update all iOS-specific payment/subscription messages to use the exact copy: **"To upgrade or manage your plan, please visit betteropnr.com in your browser."**

### Changes

**1. PaywallModal.tsx** (3 spots)
- Toast message (line 39): Change from "To upgrade, please visit betteropnr.com in your browser" to the standardized copy
- iOS notice banner (line 129): Change from "To subscribe or manage your plan, please visit our website:" to the standardized copy
- Dialog description for iOS (line 113): Change from "Manage your subscription through our website" to the standardized copy

**2. Billing.tsx** (2 spots)
- Toast in handleManageSubscription (line 44): Change from "Opening subscription management in browser..." to the standardized copy
- Helper text under upgrade button (line 172): Change from "Subscriptions are managed through our website" to the standardized copy

### Technical Details

All five locations already have the correct redirect behavior (opening `https://betteropnr.com/billing` in browser). Only the user-facing text strings are being updated for consistency. No logic or routing changes needed.
