# iOS Privacy Permission Strings

After running `npx cap add ios`, add these entries to `ios/App/App/Info.plist` before the closing `</dict>` tag:

## Required Permission Strings

```xml
<!-- Camera Permission -->
<key>NSCameraUsageDescription</key>
<string>BetterOpnr needs camera access to capture photos of dating profiles for generating personalized openers.</string>

<!-- Photo Library Read Permission -->
<key>NSPhotoLibraryUsageDescription</key>
<string>BetterOpnr needs access to your photo library to select screenshots of dating profiles for generating personalized openers.</string>

<!-- Photo Library Add Permission (for saving) -->
<key>NSPhotoLibraryAddUsageDescription</key>
<string>BetterOpnr needs permission to save generated opener images to your photo library.</string>

<!-- Push Notifications -->
<key>NSUserNotificationsUsageDescription</key>
<string>BetterOpnr uses notifications to remind you to follow up with your matches at the times you choose.</string>

<!-- Local Notifications (already handled by Capacitor plugin) -->
<!-- The LocalNotifications plugin will request this automatically -->
```

## How to Add

1. Run `npx cap add ios` (if not already done)
2. Open `ios/App/App/Info.plist` in a text editor or Xcode
3. Find the closing `</dict>` tag near the end
4. Paste the XML entries above just before `</dict>`
5. Save the file
6. Run `npx cap sync ios`

## Verification

In Xcode, you can verify the entries are added correctly:
1. Open `ios/App/App.xcworkspace` in Xcode
2. Select the App target → Info tab
3. Look for "Privacy - Camera Usage Description", etc.

## App Store Privacy Questionnaire

When submitting to App Store Connect, disclose:

| Data Type | Collection | Usage |
|-----------|------------|-------|
| Email Address | Yes | Account creation, authentication |
| User ID | Yes | App functionality |
| Usage Data | Yes | Analytics, app improvement |
| Photos | No (processed locally) | Not stored on servers |

Select "Data Not Linked to User" for usage data if you don't tie analytics to user identity.

---

# App Store Compliance Checklist

## ✅ Implemented

### Legal Pages
- [x] Privacy Policy at `/privacy`
- [x] Terms of Service at `/terms`
- [x] Both linked in Footer component

### Authentication
- [x] Sign-up flow (Clerk) with email/password
- [x] Sign-in flow with email/password
- [x] Users must be 18+ (stated in Terms)

### iOS Payment Compliance
- [x] Stripe payments disabled on iOS native
- [x] PaywallModal shows "Open betteropnr.com" on iOS
- [x] Billing page redirects to web for subscription management
- [x] Terms mention "In-App Purchases on iOS" for compliance

### Design & Content
- [x] Professional design (no placeholder content)
- [x] Fully functional app with complete user flows
- [x] All buttons and screens work
- [x] No "coming soon" or beta features visible

### Device Support
- [x] Responsive design for all screen sizes
- [x] Works on iPhone and iPad

## ⚠️ Manual Steps Required

### Before Submission

1. **Demo Account for Reviewers**
   - Create a test account: `demo@betteropnr.com`
   - Password: `[create secure password]`
   - Provide in App Store Connect review notes

2. **Screenshots**
   - Capture real app screenshots (not mockups)
   - Required sizes: iPhone 6.7", 6.5", 5.5"
   - Optional: iPad Pro 12.9"

3. **App Store Metadata**
   - App Name: BetterOpnr
   - Subtitle: AI Dating Conversation Starters
   - Category: Lifestyle or Social Networking
   - Age Rating: 17+ (dating content)
   - Description: Write compelling 4000-char description

4. **Privacy Questionnaire**
   Complete in App Store Connect:
   - Email Address: Yes (Account creation)
   - User ID: Yes (App functionality)  
   - Usage Data: Yes (Analytics)
   - Photos: No (processed locally, not stored)

### Build Requirements
- [ ] Sign app with valid distribution certificate
- [ ] Use App Store provisioning profile
- [ ] Ensure 64-bit support (Capacitor default)
- [ ] Test on multiple device sizes
