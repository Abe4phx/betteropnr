# BetterOpnr Manual QA Test Plan

## Purpose

This document defines the manual test cases required to verify that a first-time user can successfully install, onboard, upload a profile, generate openers, upgrade, restore purchases, and recover from common errors on BetterOpnr. It covers every critical user journey from first launch through paid conversion. Each test case is independently executable and independently verifiable — Pass/Fail is recorded per run, not assumed from a prior run.

Out of scope for this document: automated test coverage, load/performance testing, and AI opener-quality validation (tracked separately in `knowledge-base/LAUNCH_CHECKLIST.md` under AI Quality).

## How to use this plan

- Execute test cases in section order for a first full pass — later sections assume earlier ones succeeded (e.g., Upgrade tests assume Onboarding and Profile Upload passed).
- Record Pass/Fail and Notes for every test case on every full run; do not carry forward results from a previous build.
- A test case that cannot be executed (e.g., blocked by an earlier failure) should be marked Fail with a Notes entry explaining the blocker, not left blank.

---

## Test ID Index

| Section | Range |
|---|---|
| Install & First Launch | INSTALL-01 – INSTALL-05 |
| Onboarding & Consent | ONBOARD-01 – ONBOARD-06 |
| Profile Upload & Extraction | PROFILE-01 – PROFILE-08 |
| Guest Opener Generation | GEN-GUEST-01 – GEN-GUEST-06 |
| Authentication | AUTH-01 – AUTH-08 |
| Authenticated Opener Generation | GEN-AUTH-01 – GEN-AUTH-05 |
| Upgrade / Paywall | UPGRADE-01 – UPGRADE-07 |
| Restore Purchases | RESTORE-01 – RESTORE-04 |
| Error Recovery | ERROR-01 – ERROR-09 |
| Cross-Cutting Regression | REGRESSION-01 – REGRESSION-05 |

---

## Section 1 — Install & First Launch

### INSTALL-01
**Objective:** Verify a first-time user can install the app from TestFlight.
**Preconditions:** Device is enrolled in the TestFlight beta; no prior installation exists.
**Steps:**
1. Open the TestFlight invitation link (email or public link).
2. Tap Install.
3. Wait for installation to complete.
4. Launch the app from the home screen.
**Expected Result:** App installs without error and launches to the initial screen within a few seconds.
**Pass/Fail:**
**Notes:**

### INSTALL-02
**Objective:** Verify app icon, name, and splash screen render correctly on first launch.
**Preconditions:** App freshly installed, not yet launched.
**Steps:**
1. Locate the app icon on the home screen.
2. Launch the app.
3. Observe the splash/launch screen.
**Expected Result:** Icon and app name display correctly (no placeholder/default icon); splash screen renders without layout glitches or flashes of unstyled content.
**Pass/Fail:**
**Notes:**

### INSTALL-03
**Objective:** Verify the app requests only the permissions it needs, at the time they are needed (not all at launch).
**Preconditions:** Fresh install, all permissions in default (undetermined) state.
**Steps:**
1. Launch the app.
2. Observe whether any permission prompts (photo library, notifications, camera) appear before the user has taken an action requiring them.
**Expected Result:** No permission prompt appears until the user performs an action that requires it (e.g., photo library access is requested only when the user taps to upload a profile screenshot).
**Pass/Fail:**
**Notes:**

### INSTALL-04
**Objective:** Verify the app launches successfully on a low-end/older supported device and on the newest supported OS version.
**Preconditions:** Access to at least one older supported device/OS combination and one current device/OS combination.
**Steps:**
1. Install and launch the app on each device.
2. Navigate through the first two screens.
**Expected Result:** App launches and is usable on both ends of the supported device/OS range, with no crash and no unreadable layout.
**Pass/Fail:**
**Notes:**

### INSTALL-05
**Objective:** Verify relaunching the app after a full close (not backgrounded) restores to a sensible state.
**Preconditions:** App has been used at least once (guest or authenticated) and then fully force-quit.
**Steps:**
1. Force-quit the app.
2. Relaunch it from the home screen.
**Expected Result:** App reopens to the expected entry screen for the user's current auth state (guest home, sign-in, or dashboard) without crashing or resetting to a broken state.
**Pass/Fail:**
**Notes:**

---

## Section 2 — Onboarding & Consent

### ONBOARD-01
**Objective:** Verify the welcome flow displays for a first-time user and can be completed end to end.
**Preconditions:** Fresh install, no prior onboarding completed.
**Steps:**
1. Launch the app for the first time.
2. Step through each screen of the welcome flow (`WelcomeFlow`).
3. Reach the end of the flow.
**Expected Result:** Every welcome screen renders correctly, forward/back navigation works, and the flow ends by routing the user into the app (guest home or sign-in), not back to itself.
**Pass/Fail:**
**Notes:**

### ONBOARD-02
**Objective:** Verify the AI consent screen is shown before any profile data is sent for AI processing, and cannot be silently bypassed.
**Preconditions:** Fresh install or a user who has not yet accepted AI consent.
**Steps:**
1. Progress through onboarding to the AI consent screen (`AIConsentScreen`).
2. Attempt to proceed without interacting with the consent control.
3. Accept consent and proceed.
**Expected Result:** The user cannot reach opener generation without explicitly acting on the consent screen; accepting allows normal progression.
**Pass/Fail:**
**Notes:**

### ONBOARD-03
**Objective:** Verify declining AI consent (if declinable) is handled gracefully rather than crashing or dead-ending the user.
**Preconditions:** On the AI consent screen.
**Steps:**
1. Select the decline/back option if one is presented.
**Expected Result:** The app routes the user to a sensible fallback (e.g., back to the previous screen or an explanation), with no crash and no silent stuck state.
**Pass/Fail:**
**Notes:**

### ONBOARD-04
**Objective:** Verify onboarding is not shown again after being completed once.
**Preconditions:** Onboarding already completed in a previous session.
**Steps:**
1. Force-quit and relaunch the app.
**Expected Result:** The welcome flow does not replay; the user lands directly in guest home, sign-in, or dashboard as appropriate.
**Pass/Fail:**
**Notes:**

### ONBOARD-05
**Objective:** Verify the install banner / add-to-home-screen prompt (web/PWA context) behaves correctly.
**Preconditions:** Using the web build in a browser that supports installability (`InstallBanner`).
**Steps:**
1. Load the site in a supported browser.
2. Observe whether the install banner appears at an appropriate time (not immediately blocking first content).
3. Dismiss it and reload — confirm it does not reappear immediately after dismissal.
**Expected Result:** Banner appears at a reasonable point, is dismissible, and respects the dismissal for a reasonable period.
**Pass/Fail:**
**Notes:**

### ONBOARD-06
**Objective:** Verify a returning guest (who skipped account creation) is not forced through onboarding again.
**Preconditions:** User previously used the app as a guest and closed it.
**Steps:**
1. Relaunch the app.
2. Observe the landing screen.
**Expected Result:** User returns to guest home (or an appropriate continuation point), not the onboarding flow.
**Pass/Fail:**
**Notes:**

---

## Section 3 — Profile Upload & Extraction

### PROFILE-01
**Objective:** Verify a user can upload a profile screenshot and have text extracted successfully.
**Preconditions:** User is on the profile input screen (`ProfileInput` / `UserProfileInput`); a valid dating-profile screenshot is available.
**Steps:**
1. Tap the upload/photo control.
2. Select a clear, readable profile screenshot.
3. Wait for extraction (`extract-profile-text` function) to complete.
**Expected Result:** Extracted text populates the profile field accurately, reflecting the bio/interests visible in the screenshot, within a reasonable time.
**Pass/Fail:**
**Notes:**

### PROFILE-02
**Objective:** Verify a user can manually type/paste profile text instead of uploading an image.
**Preconditions:** On the profile input screen.
**Steps:**
1. Tap into the text field.
2. Type or paste profile text directly.
3. Proceed to generation.
**Expected Result:** Manually entered text is accepted and used identically to extracted text; no image is required.
**Pass/Fail:**
**Notes:**

### PROFILE-03
**Objective:** Verify the user's own profile/interests (`userProfileText`) can optionally be added and is used to personalize openers.
**Preconditions:** On the profile input flow with the optional "your interests" field available.
**Steps:**
1. Enter the recipient's profile text.
2. Enter the user's own interests in the optional field.
3. Generate openers.
**Expected Result:** The optional field is accepted without being required; generated openers may reference the user's stated interests where relevant.
**Pass/Fail:**
**Notes:**

### PROFILE-04
**Objective:** Verify the profile review step (if applicable) lets the user confirm or edit extracted text before generation.
**Preconditions:** A screenshot has just been processed (`ProfileReview` / `review-profile` function).
**Steps:**
1. Complete a screenshot upload.
2. Reach the review screen.
3. Edit the extracted text.
4. Confirm and proceed.
**Expected Result:** Edits persist and are what gets sent to generation, not the original unedited extraction.
**Pass/Fail:**
**Notes:**

### PROFILE-05
**Objective:** Verify uploading a low-quality or blurry screenshot degrades gracefully.
**Preconditions:** A blurry or low-resolution screenshot is available.
**Steps:**
1. Upload the low-quality image.
2. Observe extraction result.
**Expected Result:** The app either extracts partial/best-effort text or clearly informs the user extraction was incomplete, without crashing or silently producing empty output that blocks progress.
**Pass/Fail:**
**Notes:**

### PROFILE-06
**Objective:** Verify uploading a non-profile image (e.g., a random photo, screenshot of a different app) is handled sensibly.
**Preconditions:** A non-dating-profile image is available.
**Steps:**
1. Upload the unrelated image.
2. Observe the result.
**Expected Result:** The app does not crash; it either extracts nothing meaningful and informs the user, or allows the user to proceed to manual text entry.
**Pass/Fail:**
**Notes:**

### PROFILE-07
**Objective:** Verify the character/length limit on profile text is enforced with a clear message, not a silent failure.
**Preconditions:** On the profile text input.
**Steps:**
1. Paste text far exceeding the expected input limit.
2. Attempt to proceed.
**Expected Result:** The user sees a clear message about the limit (truncation or block), matching the backend's enforced maximum payload size; the request is not silently dropped.
**Pass/Fail:**
**Notes:**

### PROFILE-08
**Objective:** Verify tone selection (`TonePicker`) is required/available and affects generation.
**Preconditions:** On the generator screen with profile text entered.
**Steps:**
1. Select one or more tones.
2. Generate openers.
3. Repeat with a different tone selection for the same profile.
**Expected Result:** Tone selection is reflected in the generated openers' style; changing tone produces a noticeably different style on regeneration.
**Pass/Fail:**
**Notes:**

---

## Section 4 — Guest Opener Generation

### GEN-GUEST-01
**Objective:** Verify a guest (not signed in) can generate openers without creating an account.
**Preconditions:** User has not signed in; guest mode is available.
**Steps:**
1. Complete profile input as a guest.
2. Tap Generate.
**Expected Result:** Openers are generated and displayed without requiring sign-in; exactly 2 openers are returned per the guest opener count.
**Pass/Fail:**
**Notes:**

### GEN-GUEST-02
**Objective:** Verify the guest daily run limit is enforced.
**Preconditions:** Guest has used their allotted number of generation runs for the day (per `GUEST_DAILY_RUN_LIMIT`).
**Steps:**
1. Exhaust the guest's daily runs by generating repeatedly.
2. Attempt one more generation.
**Expected Result:** The app blocks the additional run and clearly communicates the limit and reset time, rather than failing silently or showing a generic error.
**Pass/Fail:**
**Notes:**

### GEN-GUEST-03
**Objective:** Verify the guest sees an accurate remaining-runs indicator.
**Preconditions:** Guest has used some but not all daily runs.
**Steps:**
1. Generate openers once as a guest.
2. Observe any "runs remaining" indicator in the UI.
**Expected Result:** The displayed remaining count matches the `guestLimits.remainingRunsToday` value returned by the backend.
**Pass/Fail:**
**Notes:**

### GEN-GUEST-04
**Objective:** Verify the guest is prompted to sign up/upgrade at an appropriate point (e.g., `GuestPromptModal`), not before they've seen value.
**Preconditions:** Guest has generated at least once.
**Steps:**
1. Complete a generation as a guest.
2. Observe whether and when a sign-up/upgrade prompt appears.
**Expected Result:** The prompt appears after the user has experienced the core value (seen generated openers), not as an immediate blocking wall before any use.
**Pass/Fail:**
**Notes:**

### GEN-GUEST-05
**Objective:** Verify guest openers can be copied/used (e.g., copy-to-clipboard) without requiring an account.
**Preconditions:** Guest has generated openers.
**Steps:**
1. Tap the copy/use action on a generated opener.
**Expected Result:** The opener text is copied or otherwise made usable without any additional account requirement.
**Pass/Fail:**
**Notes:**

### GEN-GUEST-06
**Objective:** Verify a locked-opener upsell (`LockedOpenerCard`) displays correctly if guests see a preview of additional locked results.
**Preconditions:** Guest generation complete, locked-card feature in use.
**Steps:**
1. Generate as a guest.
2. Observe any locked/blurred additional opener slots.
3. Tap the locked card.
**Expected Result:** Locked card clearly communicates it requires upgrade/sign-in, and tapping it routes to the appropriate upgrade or sign-in flow rather than erroring.
**Pass/Fail:**
**Notes:**

---

## Section 5 — Authentication

### AUTH-01
**Objective:** Verify a new user can sign up with email.
**Preconditions:** No existing account for the test email.
**Steps:**
1. Navigate to Sign Up.
2. Enter a new email and complete the Clerk sign-up flow.
**Expected Result:** Account is created; user lands in the authenticated dashboard/generator.
**Pass/Fail:**
**Notes:**

### AUTH-02
**Objective:** Verify an existing user can sign in with email.
**Preconditions:** An account already exists.
**Steps:**
1. Navigate to Sign In (`SignIn`).
2. Enter existing credentials.
**Expected Result:** User authenticates successfully and lands in the authenticated experience with their existing data (plan, saved openers) intact.
**Pass/Fail:**
**Notes:**

### AUTH-03
**Objective:** Verify Apple Sign In works end to end on iOS.
**Preconditions:** iOS device/build, Apple ID available.
**Steps:**
1. Tap "Sign in with Apple."
2. Complete the native Apple authentication prompt.
3. Grant or hide email as desired.
**Expected Result:** Sign-in completes, a user record is created or matched, and the user reaches the authenticated experience.
**Pass/Fail:**
**Notes:**

### AUTH-04
**Objective:** Verify Apple Sign In with "Hide My Email" still results in a usable account.
**Preconditions:** Apple ID configured to hide email on sign-in.
**Steps:**
1. Sign in with Apple, choosing to hide the real email.
2. Complete any follow-up account setup.
**Expected Result:** Account is created successfully using the private relay email; no downstream feature (e.g., receipts, notifications) breaks due to the relay address.
**Pass/Fail:**
**Notes:**

### AUTH-05
**Objective:** Verify the OAuth/redirect callback (`AuthCallback`) completes correctly on iOS after an external browser hand-off.
**Preconditions:** iOS build, using a sign-in method that redirects out of the app and back.
**Steps:**
1. Initiate sign-in.
2. Complete authentication in the external browser/webview.
3. Observe the return to the app.
**Expected Result:** The app regains focus, completes the session handoff, and lands the user in the authenticated state without requiring a manual relaunch.
**Pass/Fail:**
**Notes:**

### AUTH-06
**Objective:** Verify sign out works and clears session state.
**Preconditions:** User is signed in.
**Steps:**
1. Navigate to account/profile settings.
2. Tap Sign Out.
**Expected Result:** User is returned to a signed-out state (guest home or sign-in); no authenticated data remains visible; attempting to access an authenticated-only screen requires signing in again.
**Pass/Fail:**
**Notes:**

### AUTH-07
**Objective:** Verify signing back in after sign-out restores the correct account state (plan, usage).
**Preconditions:** Completed AUTH-06 on an account with a known plan/usage state.
**Steps:**
1. Sign back in with the same account.
2. Check plan status and usage counters.
**Expected Result:** Plan and usage reflect the account's actual server-side state, not a stale or reset local value.
**Pass/Fail:**
**Notes:**

### AUTH-08
**Objective:** Verify an invalid/incorrect credential attempt is rejected with a clear error, not a crash or silent failure.
**Preconditions:** On the sign-in screen.
**Steps:**
1. Enter an incorrect password for an existing account.
2. Submit.
**Expected Result:** A clear, non-technical error message is shown; the user can retry immediately.
**Pass/Fail:**
**Notes:**

---

## Section 6 — Authenticated Opener Generation

### GEN-AUTH-01
**Objective:** Verify an authenticated free-plan user receives 3 openers per generation.
**Preconditions:** Signed in on the free plan.
**Steps:**
1. Enter profile text and tones.
2. Tap Generate.
**Expected Result:** Exactly 3 openers are returned, matching the authenticated opener count.
**Pass/Fail:**
**Notes:**

### GEN-AUTH-02
**Objective:** Verify authenticated daily usage tracking and the free-plan daily limit are enforced.
**Preconditions:** Signed in on the free plan, near or at the daily generation limit.
**Steps:**
1. Generate repeatedly until the daily limit is reached.
2. Attempt one more generation.
**Expected Result:** The app blocks further generation once the limit is hit and clearly communicates the limit and the option to upgrade.
**Pass/Fail:**
**Notes:**

### GEN-AUTH-03
**Objective:** Verify usage tracking (`useUsageTracking`) accurately reflects generations across the session and after app restart.
**Preconditions:** Signed in, some generations already performed today.
**Steps:**
1. Note the current usage count in the UI.
2. Force-quit and relaunch the app.
3. Recheck the usage count.
**Expected Result:** Usage count is consistent before and after restart, matching server-side state.
**Pass/Fail:**
**Notes:**

### GEN-AUTH-04
**Objective:** Verify variation actions (safer/warmer/funnier/shorter) produce a distinctly modified opener.
**Preconditions:** Signed in, at least one opener already generated.
**Steps:**
1. Select a generated opener.
2. Apply each variation style in turn.
**Expected Result:** Each variation visibly reflects its intent (e.g., "shorter" is noticeably shorter, under the stated character limit) and remains coherent.
**Pass/Fail:**
**Notes:**

### GEN-AUTH-05
**Objective:** Verify saved openers (`Saved` page) persist correctly for an authenticated user.
**Preconditions:** Signed in, at least one opener generated.
**Steps:**
1. Save a generated opener.
2. Navigate to the Saved page.
3. Sign out and back in (or restart the app).
4. Revisit the Saved page.
**Expected Result:** Saved opener persists across navigation, restart, and sign-out/sign-in.
**Pass/Fail:**
**Notes:**

---

## Section 7 — Upgrade / Paywall

### UPGRADE-01
**Objective:** Verify the paywall (`PaywallModal`) displays monthly and yearly pricing options correctly.
**Preconditions:** Signed in on the free plan, viewing the paywall.
**Steps:**
1. Trigger the paywall (via limit, upsell prompt, or Billing page).
2. Observe both pricing options.
**Expected Result:** Monthly and yearly prices display correctly and match the configured Stripe price IDs; any "save X%" messaging on the yearly plan is mathematically accurate.
**Pass/Fail:**
**Notes:**

### UPGRADE-02
**Objective:** Verify a monthly purchase completes successfully.
**Preconditions:** Signed in, on the paywall, using a sandbox/test payment method.
**Steps:**
1. Select the monthly plan.
2. Complete the purchase flow (native IAP on iOS, or `create-checkout`/Stripe on web).
3. Return to the app.
**Expected Result:** Purchase completes, the user's plan updates to paid, and previously limited features (unlimited or higher generation count) unlock immediately.
**Pass/Fail:**
**Notes:**

### UPGRADE-03
**Objective:** Verify a yearly purchase completes successfully.
**Preconditions:** Signed in, on the paywall, using a sandbox/test payment method.
**Steps:**
1. Select the yearly plan.
2. Complete the purchase flow.
3. Return to the app.
**Expected Result:** Purchase completes, the user's plan updates to the correct paid tier, and the correct renewal period is reflected in account/billing details.
**Pass/Fail:**
**Notes:**

### UPGRADE-04
**Objective:** Verify the upgrade success confirmation (`UpgradeSuccessModal`) displays after a successful purchase.
**Preconditions:** A purchase has just completed.
**Steps:**
1. Complete UPGRADE-02 or UPGRADE-03.
2. Observe the confirmation UI.
**Expected Result:** A clear success confirmation is shown before returning the user to normal app usage.
**Pass/Fail:**
**Notes:**

### UPGRADE-05
**Objective:** Verify a user can cancel out of the purchase flow without being charged or left in a broken state.
**Preconditions:** On the native purchase sheet or Stripe checkout.
**Steps:**
1. Initiate a purchase.
2. Cancel before completing payment.
**Expected Result:** No charge occurs; the user returns cleanly to the paywall or previous screen with the free plan still active.
**Pass/Fail:**
**Notes:**

### UPGRADE-06
**Objective:** Verify the billing portal (`create-portal-session` / `Billing` page) allows a paid user to manage their subscription.
**Preconditions:** Signed in on a paid plan.
**Steps:**
1. Navigate to Billing.
2. Open the manage-subscription/portal link.
**Expected Result:** The portal opens and accurately reflects the user's current subscription, with working links back to the app.
**Pass/Fail:**
**Notes:**

### UPGRADE-07
**Objective:** Verify an existing subscriber migrating between platforms (`sync-existing-subscription`) has their paid status recognized without double-charging.
**Preconditions:** A test account with an existing subscription on one platform (e.g., web/Stripe), now signing in via iOS/RevenueCat.
**Steps:**
1. Sign in on the new platform with the existing subscriber account.
2. Observe plan status.
**Expected Result:** The account is recognized as already paid; the user is not prompted to purchase again.
**Pass/Fail:**
**Notes:**

---

## Section 8 — Restore Purchases

### RESTORE-01
**Objective:** Verify "Restore Purchases" recovers an active subscription on the same device after a reinstall.
**Preconditions:** A paid subscription exists for the test Apple ID; app has been deleted and reinstalled.
**Steps:**
1. Install the app fresh.
2. Sign in with the same account.
3. Tap Restore Purchases.
**Expected Result:** The paid plan is restored and reflected in the app without requiring a new purchase.
**Pass/Fail:**
**Notes:**

### RESTORE-02
**Objective:** Verify Restore Purchases on a new device recovers the subscription.
**Preconditions:** Paid subscription exists; a second, previously unused device is available.
**Steps:**
1. Install and sign in on the new device.
2. Tap Restore Purchases.
**Expected Result:** Subscription status is recognized on the new device.
**Pass/Fail:**
**Notes:**

### RESTORE-03
**Objective:** Verify Restore Purchases with no prior purchase is handled gracefully.
**Preconditions:** Account/device with no purchase history.
**Steps:**
1. Tap Restore Purchases.
**Expected Result:** A clear "nothing to restore" message is shown; no error state or crash occurs.
**Pass/Fail:**
**Notes:**

### RESTORE-04
**Objective:** Verify the RevenueCat auth bridge (`RevenueCatAuthBridge`) correctly links purchase identity to the signed-in user, so restore works after switching accounts.
**Preconditions:** Two test accounts, one with a purchase.
**Steps:**
1. Sign in as the non-purchasing account.
2. Sign out.
3. Sign in as the purchasing account.
4. Tap Restore Purchases.
**Expected Result:** The purchase is correctly attributed to the purchasing account only; switching back to the non-purchasing account does not show the paid entitlement.
**Pass/Fail:**
**Notes:**

---

## Section 9 — Error Recovery

### ERROR-01
**Objective:** Verify generation with an empty profile is blocked with a clear message.
**Preconditions:** On the generator screen with no profile text entered.
**Steps:**
1. Leave the profile field empty.
2. Tap Generate.
**Expected Result:** Generation does not proceed; a clear inline message asks for profile information (matches the `INVALID_INPUT` / "Please provide the required information" backend response).
**Pass/Fail:**
**Notes:**

### ERROR-02
**Objective:** Verify generation with an excellent, detailed profile succeeds and produces high-quality, specific openers.
**Preconditions:** A rich profile with clear bio, multiple photo descriptions, and stated interests.
**Steps:**
1. Enter the detailed profile.
2. Generate.
**Expected Result:** Openers are specific, varied, and clearly reference real profile details.
**Pass/Fail:**
**Notes:**

### ERROR-03
**Objective:** Verify generation with a weak/sparse profile (e.g., one-line bio, no interests) still produces a usable, non-broken result.
**Preconditions:** A minimal profile (a few words only).
**Steps:**
1. Enter minimal profile text.
2. Generate.
**Expected Result:** The app returns restrained, honest openers rather than fabricated or broken output, and does not error out due to insufficient input.
**Pass/Fail:**
**Notes:**

### ERROR-04
**Objective:** Verify behavior on poor/intermittent network during generation.
**Preconditions:** Ability to simulate a slow or unstable connection (e.g., Network Link Conditioner).
**Steps:**
1. Enable a poor-network profile.
2. Attempt to generate.
**Expected Result:** The app shows a loading state, and on failure shows a clear retry-capable error rather than hanging indefinitely or crashing.
**Pass/Fail:**
**Notes:**

### ERROR-05
**Objective:** Verify behavior when the network is fully offline.
**Preconditions:** Device in airplane mode or Wi-Fi/cellular disabled.
**Steps:**
1. Disable all connectivity.
2. Attempt to generate or sign in.
**Expected Result:** A clear "no connection" message is shown; the app does not crash and recovers automatically once connectivity is restored.
**Pass/Fail:**
**Notes:**

### ERROR-06
**Objective:** Verify behavior when the AI request times out (simulated 25s+ delay upstream, or observed under real degraded conditions).
**Preconditions:** Ability to reproduce or simulate an upstream timeout.
**Steps:**
1. Trigger a generation request that times out.
**Expected Result:** The app falls back gracefully (emergency template fallback) or shows a clear timeout error with retry, matching backend timeout-handling behavior; no indefinite spinner.
**Pass/Fail:**
**Notes:**

### ERROR-07
**Objective:** Verify uploading an invalid file (non-image, corrupted image) as a profile screenshot is rejected cleanly.
**Preconditions:** A non-image file or corrupted image file available.
**Steps:**
1. Attempt to upload the invalid file via the photo picker.
**Expected Result:** The app rejects the file with a clear message; no crash, no stuck loading state.
**Pass/Fail:**
**Notes:**

### ERROR-08
**Objective:** Verify uploading a very large image is handled without crashing or exceeding payload limits.
**Preconditions:** A large image file (e.g., >20MB or maximum camera resolution).
**Steps:**
1. Upload the large image.
**Expected Result:** The app either compresses/resizes before upload, or clearly informs the user the file is too large; no crash and no silent hang.
**Pass/Fail:**
**Notes:**

### ERROR-09
**Objective:** Verify a 500-level server error during generation is surfaced without leaking technical details, and is retryable.
**Preconditions:** Ability to simulate or observe a backend 500 error.
**Steps:**
1. Trigger a request that results in a server error.
**Expected Result:** The user sees a generic, non-technical "something went wrong, please try again" message (matching the `SERVER_ERROR` response contract); the user can retry without restarting the app.
**Pass/Fail:**
**Notes:**

---

## Section 10 — Cross-Cutting Regression

### REGRESSION-01
**Objective:** Verify a guest who upgrades mid-session (signs up during/after guest use) retains no unexpected data loss or duplication.
**Preconditions:** Guest has generated openers; now signs up for an account.
**Steps:**
1. Use the app as a guest, generating at least once.
2. Sign up for a new account from within the guest flow.
**Expected Result:** The transition from guest to authenticated is smooth; the user is not double-charged against guest limits after becoming authenticated, and prior guest-generated content is not lost from view if it was expected to carry over.
**Pass/Fail:**
**Notes:**

### REGRESSION-02
**Objective:** Verify the full first-time journey end to end in one pass: install → onboard → upload profile → generate as guest → sign up → upgrade → generate as paid user.
**Preconditions:** Completely fresh device/account state.
**Steps:**
1. Execute INSTALL-01, ONBOARD-01, PROFILE-01, GEN-GUEST-01, AUTH-01, UPGRADE-02, GEN-AUTH-01 in sequence without resetting state between them.
**Expected Result:** Every step succeeds using the state carried over from the previous step; no step requires an undocumented workaround.
**Pass/Fail:**
**Notes:**

### REGRESSION-03
**Objective:** Verify no critical crashes occur across the full journey above on the primary supported iOS version.
**Preconditions:** Same as REGRESSION-02.
**Steps:**
1. Execute the full journey while monitoring for crashes (device console or crash reporting dashboard).
**Expected Result:** Zero crashes recorded across the full journey.
**Pass/Fail:**
**Notes:**

### REGRESSION-04
**Objective:** Verify backgrounding and resuming the app mid-generation does not corrupt state or duplicate the request.
**Preconditions:** A generation request is in flight.
**Steps:**
1. Start a generation.
2. Immediately background the app.
3. Resume after a few seconds.
**Expected Result:** The generation completes and displays correctly on resume; it is not silently duplicated or lost.
**Pass/Fail:**
**Notes:**

### REGRESSION-05
**Objective:** Verify analytics/error logging fire for the key events in this plan (generation attempt, purchase, error) without blocking or slowing the user-facing flow.
**Preconditions:** Access to the analytics/logging dashboard.
**Steps:**
1. Perform a generation, a purchase, and a deliberate error (e.g., ERROR-01).
2. Check the dashboard for corresponding events.
**Expected Result:** Each action produces a corresponding logged event within a reasonable delay; the user-facing action itself is not perceptibly slowed by logging.
**Pass/Fail:**
**Notes:**

---

## Revision History

Version 0.1

Status: Draft

Summary: Initial manual QA test plan covering install, onboarding, profile upload, guest and authenticated generation, upgrade, restore purchases, and error recovery.
