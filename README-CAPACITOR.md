# Converting BetterOpnr to Native Mobile App

BetterOpnr is now ready to be converted to a native iOS and Android app using Capacitor!

## What's Been Done

### ✅ Phase 1 & 2: PWA Code Updated & Notification System Replaced
- **Notification System**: Unified notification API that works on both web (PWA) and native (Capacitor Local Notifications)
- **Platform Detection**: Added detection to route between web and native implementations
- **PWA Components**: Install banner and service worker only show on web, not in native app
- **Dependencies Installed**: All Capacitor packages are ready

### 🔧 What You Need To Do

## Step 1: Initialize Capacitor

After exporting to GitHub and pulling the project locally:

```bash
# Install dependencies
npm install

# Initialize Capacitor (already configured)
npx cap init

# Add iOS and Android platforms
npx cap add ios
npx cap add android
```

## Step 2: Build and Sync

```bash
# Build the web app
npm run build

# Sync web code to native platforms
npx cap sync
```

## Step 3: Configure Native Permissions

### iOS (Info.plist)

Add these entries to `ios/App/App/Info.plist`:

```xml
<!-- Camera Permission -->
<key>NSCameraUsageDescription</key>
<string>BetterOpnr needs camera access to let you upload profile screenshots</string>

<!-- Photo Library Permission -->
<key>NSPhotoLibraryUsageDescription</key>
<string>BetterOpnr needs photo access to let you upload profile screenshots</string>

<!-- Notification Permission -->
<key>NSUserNotificationsUsageDescription</key>
<string>BetterOpnr sends you reminders for follow-ups with your matches</string>

<!-- Clerk OAuth URL Schemes (if needed) -->
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>betteropnr</string>
    </array>
  </dict>
</array>
```

### Android (AndroidManifest.xml)

Add these to `android/app/src/main/AndroidManifest.xml`:

```xml
<!-- Camera Permission -->
<uses-permission android:name="android.permission.CAMERA" />

<!-- Notification Permission (Android 13+) -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

<!-- Internet (already included) -->
<uses-permission android:name="android.permission.INTERNET" />
```

## Step 4: Update Clerk Dashboard

Add native OAuth redirect URLs in your Clerk Dashboard:

- iOS: `betteropnr://clerk`
- Android: `app.lovable.betteropnr://clerk`

## Step 5: Run on Device/Emulator

```bash
# iOS (requires Mac + Xcode)
npx cap open ios
# Then press "Play" in Xcode

# Android (requires Android Studio)
npx cap open android
# Then press "Run" in Android Studio
```

## Optional Enhancements

### Add Camera Plugin for Better UX
Currently uses web file upload. You can upgrade to native camera:

```bash
npm install @capacitor/camera
```

Then update `ProfileInput.tsx` to use Camera plugin when `isNativeApp()` returns true.

### Add Status Bar Styling
The Status Bar plugin is installed. Configure in `capacitor.config.ts`:

```typescript
StatusBar: {
  style: 'dark',
  backgroundColor: '#0F1222'
}
```

### Add Splash Screen
Install and configure:

```bash
npm install @capacitor/splash-screen
```

## Key Features Ready

✅ **Push Notifications**: Local notifications work on native apps
✅ **Offline Support**: PWA caching carries over
✅ **Authentication**: Clerk auth works (after config)
✅ **Payments**: Stripe checkout works in native WebView
✅ **Image Upload**: Works via file picker (can upgrade to Camera plugin)

## Testing Checklist

- [ ] Login/signup flow works
- [ ] Profile screenshot upload works
- [ ] AI generation works
- [ ] Reminders can be set
- [ ] Push notifications appear (test by setting a 1-minute reminder)
- [ ] Stripe payment flow works
- [ ] Saved favorites persist
- [ ] App works offline (test by turning off network)

## Important Notes

1. **Hot Reload**: The `capacitor.config.ts` includes a dev server URL for hot reload during development
2. **Production Builds**: Remove the server URL before releasing to app stores
3. **App Store Submission**: You'll need Apple Developer account ($99/year) and Google Play account ($25 one-time)
4. **Icons & Splash**: Generate proper app icons using a tool like [Capacitor Assets](https://github.com/ionic-team/capacitor-assets)

## Troubleshooting

**Notifications not working?**
- Check permissions are granted
- Verify notification permission is cached: check localStorage 'notification-permission-status'
- Ensure Local Notifications plugin is installed: `npm list @capacitor/local-notifications`

**Authentication failing?**
- Verify Clerk redirect URLs are configured
- Check that you're using the correct OAuth scheme in Clerk dashboard

**Build errors?**
- Run `npx cap sync` after any code changes
- Ensure `npm run build` completes successfully before syncing

## Need Help?

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Capacitor Local Notifications](https://capacitorjs.com/docs/apis/local-notifications)
- [BetterOpnr Discord Community](https://discord.gg/lovable)
