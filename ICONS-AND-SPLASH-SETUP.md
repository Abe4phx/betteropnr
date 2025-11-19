# App Icons and Splash Screens Setup Guide

This guide covers setting up professional app icons and splash screens for BetterOpnr iOS and Android apps.

## 📱 What's Included

✅ **App Icon** (1024x1024px) - `public/icon.png`
- Speech bubble with coral-to-yellow spark burst
- Coral red background (#FF6B6B)
- Optimized for small sizes

✅ **Splash Screen** (1024x1920px) - `public/splash.png`
- Navy-to-coral gradient background
- BetterOpnr logo with spark icon
- Professional launch screen

## 🚀 Automated Icon Generation (Recommended)

After adding iOS and Android platforms, use Capacitor Assets to automatically generate all required sizes:

### Step 1: Ensure Platforms Are Added

```bash
# If you haven't already
npx cap add ios
npx cap add android
```

### Step 2: Generate All Icon Sizes Automatically

```bash
# Generate icons and splash screens for all platforms
npx capacitor-assets generate
```

This will automatically create:
- **iOS**: All 10+ icon sizes (20x20 to 1024x1024)
- **Android**: All mipmap densities (mdpi to xxxhdpi)
- **Splash screens**: All orientations and sizes

The tool reads from `assets-config.json` and generates everything automatically!

## 📋 What Gets Generated

### iOS Assets (in `ios/App/App/Assets.xcassets/`)

**App Icons:**
- AppIcon.appiconset/ (all required sizes)
  - 20x20 (@2x, @3x) - Notification icon
  - 29x29 (@2x, @3x) - Settings icon
  - 40x40 (@2x, @3x) - Spotlight icon
  - 60x60 (@2x, @3x) - App icon
  - 76x76 (@1x, @2x) - iPad icon
  - 83.5x83.5 (@2x) - iPad Pro icon
  - 1024x1024 - App Store icon

**Splash Screens:**
- Splash.imageset/ (multiple device sizes)
  - iPhone 8, X, 11, 12, 13, 14, 15
  - iPad (portrait & landscape)
  - All @2x and @3x variants

### Android Assets

**Icons (in `android/app/src/main/res/`):**
- mipmap-mdpi/ (48x48)
- mipmap-hdpi/ (72x72)
- mipmap-xhdpi/ (96x96)
- mipmap-xxhdpi/ (144x144)
- mipmap-xxxhdpi/ (192x192)

**Splash Screens (in `android/app/src/main/res/`):**
- drawable/ (default)
- drawable-land/ (landscape)
- drawable-port/ (portrait)
- drawable-night/ (dark mode)

## 🎨 Splash Screen Configuration

Already configured in `capacitor.config.ts`:

```typescript
SplashScreen: {
  launchShowDuration: 2000,        // Show for 2 seconds
  launchAutoHide: true,             // Auto-hide after duration
  launchFadeOutDuration: 500,       // 500ms fade out
  backgroundColor: "#1A1A40",       // Deep navy
  androidSplashResourceName: "splash",
  androidScaleType: "CENTER_CROP",
  showSpinner: false,               // No loading spinner
  splashFullScreen: true,           // Full screen
  splashImmersive: true,            // Hide status bar
}
```

## 🔧 Manual Generation (If Needed)

If automatic generation doesn't work, you can manually resize and place assets:

### iOS Icons (Manual)

1. Open `public/icon.png` in image editor
2. Export at these sizes to `ios/App/App/Assets.xcassets/AppIcon.appiconset/`:
   - icon-20@2x.png (40x40)
   - icon-20@3x.png (60x60)
   - icon-29@2x.png (58x58)
   - icon-29@3x.png (87x87)
   - icon-40@2x.png (80x80)
   - icon-40@3x.png (120x120)
   - icon-60@2x.png (120x120)
   - icon-60@3x.png (180x180)
   - icon-76.png (76x76)
   - icon-76@2x.png (152x152)
   - icon-83.5@2x.png (167x167)
   - icon-1024.png (1024x1024)

3. Update `Contents.json` in the same folder

### Android Icons (Manual)

Export `public/icon.png` to these sizes:

- `android/app/src/main/res/mipmap-mdpi/ic_launcher.png` (48x48)
- `android/app/src/main/res/mipmap-hdpi/ic_launcher.png` (72x72)
- `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png` (96x96)
- `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png` (144x144)
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` (192x192)

## ✅ Verification Checklist

After generating assets:

### iOS
- [ ] Open `ios/App/App.xcworkspace` in Xcode
- [ ] Navigate to App → Assets.xcassets → AppIcon
- [ ] Verify all icon slots are filled (no warnings)
- [ ] Check splash screen in Splash.imageset
- [ ] Build and run on simulator to test

### Android
- [ ] Open `android/` in Android Studio
- [ ] Navigate to `res/mipmap-*/` folders
- [ ] Verify `ic_launcher.png` exists in all densities
- [ ] Check splash screens in `drawable-*/` folders
- [ ] Build and run on emulator to test

## 🎯 Pro Tips

1. **Test on Real Devices**: Icons look different on actual devices vs simulators
2. **Check Dark Mode**: Ensure splash screen looks good in both light and dark modes
3. **Safe Area**: Keep important splash screen content in center 80% to avoid notches
4. **App Store**: The 1024x1024 icon is required for App Store submission
5. **Adaptive Icons**: Android can create adaptive icons - consider creating separate foreground/background layers

## 🔄 Updating Icons Later

To update icons:

1. Replace `public/icon.png` with new 1024x1024 icon
2. Replace `public/splash.png` with new splash screen
3. Run `npx capacitor-assets generate` again
4. Run `npx cap sync` to update native projects

## 📚 Resources

- [Capacitor Assets Documentation](https://github.com/ionic-team/capacitor-assets)
- [iOS Human Interface Guidelines - App Icons](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Android Icon Design Guidelines](https://developer.android.com/guide/practices/ui_guidelines/icon_design_launcher)
- [Capacitor Splash Screen Plugin](https://capacitorjs.com/docs/apis/splash-screen)

## 🆘 Troubleshooting

**Icons not showing up?**
- Ensure all icon files are properly named
- Clean and rebuild the project
- Check Xcode/Android Studio for asset warnings

**Splash screen not displaying?**
- Verify `@capacitor/splash-screen` is installed
- Check capacitor.config.ts configuration
- Ensure splash screen images are in correct folders

**Wrong colors on splash?**
- Update backgroundColor in capacitor.config.ts
- Regenerate splash screens with new colors in assets-config.json

**Adaptive icon issues (Android)?**
- Consider creating separate ic_launcher_foreground.png and ic_launcher_background.xml
- Use Image Asset Studio in Android Studio for adaptive icons
