

## Create RevenueCat Helper Module

### New file: `src/lib/revenuecat.ts`

A wrapper module around `@revenuecat/purchases-capacitor` that exposes four functions:

1. **`configureRevenueCat(userId?: string)`** — Calls `Purchases.configure()` with the RevenueCat public API key and optional Clerk user ID for attribution. Only runs on native iOS.

2. **`purchaseProPlan(plan: 'monthly' | 'yearly')`** — Fetches available offerings from RevenueCat, finds the matching package (monthly/yearly), and calls `Purchases.purchasePackage()`. Returns the resulting `CustomerInfo`.

3. **`checkEntitlements()`** — Calls `Purchases.getCustomerInfo()` and checks if the user has an active "pro" entitlement. Returns `boolean`.

4. **`restorePurchases()`** — Calls `Purchases.restorePurchases()` for users who reinstall or switch devices.

### Key details

- The RevenueCat public API key (`appl_...`) will be stored as a constant in this file since it's a **publishable client-side key** (safe to include in code, same as Stripe's publishable key).
- All functions will guard with `isNativeApp() && getPlatform() === 'ios'` and no-op on web.
- Error handling will throw descriptive errors that `PaywallModal` can catch and display via `toast.error()`.

### Prerequisite

You'll need to provide your RevenueCat Public API Key (starts with `appl_`) so I can embed it in the file. Do you have it ready, or should I use a placeholder like `'appl_YOUR_KEY_HERE'` for now?

