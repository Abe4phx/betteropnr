
## Reorganize Auth Components & Update Generator Route

### Overview
Move the `RequireAuthOrGuest` component into a new `auth` subfolder for better organization, and update the `/generator` route to allow guest access.

### Changes

**1. Create auth folder structure**
- Create `src/components/auth/` directory
- Move `RequireAuthOrGuest.tsx` to `src/components/auth/RequireAuthOrGuest.tsx`
- Optionally move `AuthModeSync.tsx` to the same folder for consistency

**2. Update imports in App.tsx**
- Change import path from `@/components/RequireAuthOrGuest` to `@/components/auth/RequireAuthOrGuest`
- Update the `/generator` route to use `RequireAuthOrGuest` instead of `ProtectedRoute`

**3. Route change**
```text
Before:
/generator → ProtectedRoute (Clerk auth only)

After:
/generator → RequireAuthOrGuest (Clerk auth OR guest mode)
```

### Technical Details

Files to modify:
- `src/components/RequireAuthOrGuest.tsx` → move to `src/components/auth/RequireAuthOrGuest.tsx`
- `src/App.tsx` → update import path and change `/generator` route wrapper

The `/generator` route will change from:
```tsx
<ProtectedRoute>
  <Generator />
</ProtectedRoute>
```

To:
```tsx
<RequireAuthOrGuest>
  <Generator />
</RequireAuthOrGuest>
```

This ensures guests who click "Continue as Guest" can also navigate directly to `/generator` and access the opener generation feature.
