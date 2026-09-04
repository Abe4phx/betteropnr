# Clerk Native-Auth Checkpoint Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Safely split the current large uncommitted working tree on `clerk-debug-working` into a small number of logically coherent, independently reviewable commits — without losing work, without committing generated/backup/dead-code artifacts, and without mixing the Clerk/native-auth migration with the unrelated RevenueCat→StoreKit billing migration.

**Architecture:** File-level (not hunk-level) staging, grouped by the actual subsystem each file belongs to, in dependency order (native plugin → app-wide adoption → backend verification → billing swap). Debug-log stripping and the `betteropnr-main/` deletion are deliberately deferred to their own later commits so today's checkpoint captures current state as-is.

**Tech Stack:** React + Vite + TypeScript, Capacitor (iOS native bridge), Swift/Xcode (ClerkKit SPM package), Supabase Edge Functions (Deno), Clerk (`@clerk/clerk-react` + native `clerk-ios`).

**Spec:** This plan is derived from the investigation conducted directly in conversation (git history archaeology of `betteropnr-main/`, `.env` secret classification, SFSafariViewController flow tracing, and diff-by-diff classification of every modified/untracked path). There is no separate written spec document — the "requirements" are the 9 numbered constraints the user gave when requesting this plan, reproduced in Global Constraints below.

## Global Constraints

- Group files into exact logical commits — no vague buckets.
- Every commit's exact path list must be explicit (this plan lists every path).
- Explicitly list which paths must NOT be staged, in every task where it matters.
- Clerk/native-auth work must be committed separately from RevenueCat/billing work.
- A dedicated debug-logging cleanup step must exist before production readiness.
- `betteropnr-main/` removal is its own cleanup commit, not part of the Clerk-auth checkpoint.
- Verification commands (`npm run lint`, `npm run build`, relevant Deno tests, safe native/Xcode checks) run before each commit where appropriate.
- Anything ambiguous must be called out and NOT committed yet.
- No staging, editing, committing, deleting, stashing, resetting, cleaning, pushing, or branch-switching happens until the user explicitly executes a task.

---

## File Structure (what exists today, and where each uncommitted path is going)

This is not new code being created — it's the current working tree being sorted into destinations:

| Destination commit | Files |
|---|---|
| Task 1 — Native ClerkKit plugin | `ios/App/App/ClerkNativeAuthPlugin.swift`, `ios/App/App/AppDelegate.swift`, `ios/App/App/ViewController.swift`, `ios/App/App/Info.plist`, `ios/App/App.xcodeproj/project.pbxproj`, `ios/App/App.xcodeproj/project.xcworkspace/`, `ios/App/App.xcworkspace/xcshareddata/swiftpm/` |
| Task 2 — JS/TS native-auth core | `src/lib/clerkNativeAuth.ts`, `src/hooks/useNativeAwareAuth.ts`, `src/lib/signInIntent.ts` |
| Task 3 — App-wide adoption + guest reconciliation | `src/App.tsx`, `src/main.tsx`, `src/components/Navigation.tsx`, `src/components/HomeOrGenerator.tsx`, `src/components/ProfileInput.tsx`, `src/components/AIConsentScreen.tsx`, `src/components/auth/AuthModeSync.tsx`, `src/components/auth/RequireAuthOrGuest.tsx`, `src/components/auth/GuestPromptModal.tsx`, `src/pages/Generator.tsx`, `src/pages/SignIn.tsx`, `src/pages/AuthCallback.tsx`, `src/pages/Dashboard.tsx`, `src/hooks/useUserProfile.ts`, `src/hooks/useUsageTracking.ts`, `src/hooks/useIsNewUser.ts`, `src/hooks/useAuthedFunctionInvoke.ts`, `src/hooks/useImageTextExtraction.ts`, `src/lib/guest.ts`, `src/contexts/SupabaseContext.tsx` (deletion) |
| Task 4 — Backend Clerk verification | `supabase/functions/_shared/clerkAuth.ts`, `supabase/functions/extract-profile-text/index.ts`, `supabase/functions/generate/index.ts`, `supabase/functions/clerk-proxy/index.ts` |
| Task 5 — RevenueCat → StoreKit billing swap | `src/pages/Billing.tsx`, `src/lib/revenuecat.ts`, `src/components/RevenueCatAuthBridge.tsx` |
| Task 6 — Debug-logging cleanup (later, after functional verification) | Revisits files from Tasks 1–5 that carry `console.log`/`console.trace`/`console.error` debug instrumentation |
| Task 7 — Remove `betteropnr-main/` (separate cleanup) | `betteropnr-main/` (entire tracked directory, 219 files) |
| Held out — ambiguous, do not commit | `src/lib/templates.ts`, `src/pages/Landing.tsx` |
| Never staged in any task | `betteropnr-main/src/components/AIConsentScreen.tsx`'s uncommitted edit (dies with the directory in Task 7), `dev-dist/`, `supabase/.temp/`, `ios-broken-backup/` |

---

## Task 1: Native ClerkKit plugin (Swift + Xcode project)

**Files:**
- Create (untracked → new): `ios/App/App/ClerkNativeAuthPlugin.swift`
- Modify: `ios/App/App/AppDelegate.swift` (adds `import ClerkKit` + `configureClerk()` called from `didFinishLaunchingWithOptions`)
- Modify: `ios/App/App/ViewController.swift` (registers `ClerkNativeAuthPlugin()` alongside the existing `StoreKitPlugin()`)
- Modify: `ios/App/App/Info.plist` (adds `ClerkPublishableKey` — a `pk_live_...` Clerk **publishable** key; not a secret, same key already embedded client-side via `VITE_CLERK_PUBLISHABLE_KEY`)
- Modify: `ios/App/App.xcodeproj/project.pbxproj` (registers the new Swift file, adds the `clerk-ios` SPM package reference, bumps `CURRENT_PROJECT_VERSION`/`IPHONEOS_DEPLOYMENT_TARGET`)
- Add (untracked directory): `ios/App/App.xcodeproj/project.xcworkspace/` — contains `xcshareddata/swiftpm/Package.resolved`, which pins `clerk-ios@1.3.6`, `Nuke@13.0.6`, `PhoneNumberKit@5.0.6`. **Must be committed** — without it, a fresh checkout could resolve different (possibly incompatible) SPM package versions.
- Add (untracked directory): `ios/App/App.xcworkspace/xcshareddata/swiftpm/` — the sibling `Package.resolved` at the outer `.xcworkspace` level (Capacitor's CocoaPods+SPM hybrid setup keeps a resolved-package file at both levels). **Must be committed** for the same reason.

**Must NOT be staged in this task:**
- `ios/App/App.xcworkspace/xcuserdata/` — already excluded by `ios/.gitignore`'s bare `xcuserdata` pattern; do not force-add it.
- Anything under `ios-broken-backup/`.

- [ ] **Step 1: Confirm nothing else changed in these paths since inspection**

```bash
git status --porcelain -- ios/App/App/ClerkNativeAuthPlugin.swift ios/App/App/AppDelegate.swift ios/App/App/ViewController.swift ios/App/App/Info.plist ios/App/App.xcodeproj/project.pbxproj ios/App/App.xcodeproj/project.xcworkspace/ ios/App/App.xcworkspace/xcshareddata/swiftpm/
```
Expected: same 5 modified + 1 new file + 2 untracked directories as this plan lists — no surprises.

- [ ] **Step 2: Safe native verification — Xcode project sanity check (no build required)**

A full `xcodebuild` run is not "safe" to assume will succeed without a paired Mac/simulator setup and signing config, so keep verification to structural checks that can't mutate anything:

```bash
plutil -lint ios/App/App/Info.plist
python3 -c "import plistlib,sys; plistlib.load(open('ios/App/App.xcodeproj/project.pbxproj','rb'))" 2>/dev/null || echo "pbxproj is not plist-parseable directly (expected for OpenStep-format pbxproj — use plutil instead)"
plutil -lint ios/App/App.xcodeproj/project.pbxproj
```
Expected: `Info.plist: OK` and `project.pbxproj: OK` (or equivalent "OK" output) — confirms neither file is corrupted/malformed before committing. If you have Xcode installed and want a real build check, that is an optional manual step outside this plan (open the workspace, let it resolve packages, build for a simulator) — do not script an automatic `xcodebuild` invocation here since it can trigger code-signing prompts and long dependency downloads.

- [ ] **Step 3: Stage exactly these paths**

```bash
git add \
  ios/App/App/ClerkNativeAuthPlugin.swift \
  ios/App/App/AppDelegate.swift \
  ios/App/App/ViewController.swift \
  ios/App/App/Info.plist \
  ios/App/App.xcodeproj/project.pbxproj \
  ios/App/App.xcodeproj/project.xcworkspace/ \
  ios/App/App.xcworkspace/xcshareddata/swiftpm/
```

- [ ] **Step 4: Verify staged content matches exactly this file list, nothing more**

```bash
git status --porcelain | grep '^[MA]'
```
Expected: only the 7 paths above show as staged (`M` or `A`); everything else in the working tree remains unstaged/untracked.

- [ ] **Step 5: Commit**

```bash
git commit -m "$(cat <<'EOF'
Add native ClerkKit plugin for iOS auth

Registers a Capacitor plugin bridging ClerkKit's native auth state,
session token, and sign-in UI into the app, configured once at launch
via AppDelegate. Includes the SPM Package.resolved pinning clerk-ios
1.3.6.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: JS/TS native-auth core library

**Files:**
- Create (untracked): `src/lib/clerkNativeAuth.ts` — thin bridge to the Capacitor plugin from Task 1
- Create (untracked): `src/hooks/useNativeAwareAuth.ts` — unifies web-Clerk vs native-ClerkKit auth state (depends on `clerkNativeAuth.ts`)
- Create (untracked): `src/lib/signInIntent.ts` — centralizes "navigate to sign-in" so `exitGuest()` always runs first (depends on `src/lib/guest.ts`, which is committed in Task 3 — see dependency note below)

**Interfaces:**
- `src/lib/clerkNativeAuth.ts` exports: `getNativeAuthState(): Promise<ClerkNativeAuthState>`, `getNativeAuthToken(): Promise<ClerkNativeTokenResult>`, `signOutNative(): Promise<void>`, `isNativeClerkReady(): Promise<boolean>`, `presentNativeSignIn(): Promise<ClerkNativeSignInResult>`.
- `src/hooks/useNativeAwareAuth.ts` exports a hook returning `{ user, isLoaded, isSignedIn, isNativeAuthenticated, nativeToken, userId, firstName, username, email, getAuthToken }` — this is what Task 3's ~15 consuming files rely on.
- `src/lib/signInIntent.ts` exports `intentionalNavigateToSignIn(navigate, { source, replace? })` and the `SignInIntentSource` union type.

**Dependency note:** `signInIntent.ts` imports `exitGuest` from `src/lib/guest.ts`, and `src/lib/guest.ts` is one of the files whose *diff* lives in Task 3. This is fine to commit in this order because `guest.ts` already exists on disk (it's a modified file, not a new one) — Task 2's new files will compile against whatever version of `guest.ts` is on disk at commit time, committed or not. There is no ordering hazard; both tasks land in the same working tree before either is pushed.

**Must NOT be staged in this task:** nothing else — this task is exactly 3 new files, no modifications to existing files.

- [ ] **Step 1: Confirm these are the only 3 untracked files matching this scope**

```bash
git status --porcelain -- src/lib/clerkNativeAuth.ts src/hooks/useNativeAwareAuth.ts src/lib/signInIntent.ts
```
Expected: three `??` lines, nothing else.

- [ ] **Step 2: Lint just these files (fast, isolated check)**

```bash
npx eslint src/lib/clerkNativeAuth.ts src/hooks/useNativeAwareAuth.ts src/lib/signInIntent.ts
```
Expected: no errors. (Full-project lint happens after Task 3, once all consumers are staged together — linting these 3 files alone first catches issues isolated to the new code before the bigger surface area is added.)

- [ ] **Step 3: Stage exactly these paths**

```bash
git add src/lib/clerkNativeAuth.ts src/hooks/useNativeAwareAuth.ts src/lib/signInIntent.ts
```

- [ ] **Step 4: Verify nothing else got swept in**

```bash
git status --porcelain | grep '^A'
```
Expected: exactly these 3 paths staged as `A`.

- [ ] **Step 5: Commit**

```bash
git commit -m "$(cat <<'EOF'
Add native-aware auth hook and sign-in intent helper

useNativeAwareAuth() unifies web Clerk and native ClerkKit auth state
behind one interface. signInIntent centralizes navigation to sign-in
so exitGuest() always runs first, keeping the main.tsx guest-mode
route guard in sync.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: App-wide adoption of native-aware auth + guest reconciliation

**Files:**
- Modify: `src/App.tsx`, `src/main.tsx`
- Modify: `src/components/Navigation.tsx`, `src/components/HomeOrGenerator.tsx`, `src/components/ProfileInput.tsx`, `src/components/AIConsentScreen.tsx`
- Modify: `src/components/auth/AuthModeSync.tsx`, `src/components/auth/RequireAuthOrGuest.tsx`, `src/components/auth/GuestPromptModal.tsx`
- Modify: `src/pages/Generator.tsx`, `src/pages/SignIn.tsx`, `src/pages/AuthCallback.tsx`, `src/pages/Dashboard.tsx`
- Modify: `src/hooks/useUserProfile.ts`, `src/hooks/useUsageTracking.ts`, `src/hooks/useIsNewUser.ts`, `src/hooks/useAuthedFunctionInvoke.ts`, `src/hooks/useImageTextExtraction.ts`
- Modify: `src/lib/guest.ts`
- Delete: `src/contexts/SupabaseContext.tsx` (superseded by `src/contexts/ClerkSyncContext.tsx`, which is **already committed** from an earlier pushed commit — no action needed on it here)

**Notes on individual files:**
- `GuestPromptModal.tsx` and `Dashboard.tsx` each carry only a single added `console.trace(...)` line inside their sign-in-redirect logic — no other change. They're grouped here (not skipped) because the checkpoint's job is to preserve current state, including in-progress debug instrumentation; Task 6 removes these specific lines later.
- `AuthCallback.tsx`'s diff is mostly Prettier-style reformatting (single→double quotes, multi-line breaks) plus a few added `console.log` lines and one new early-return guard for `!isSignedIn`. All in scope for this task since it's the Clerk deep-link callback handler.

**Interfaces:**
- Consumes: everything from Task 2 (`useNativeAwareAuth`, `intentionalNavigateToSignIn`, `getNativeAuthState`).
- Produces: nothing new consumed by later tasks in this plan — Task 4 (backend) and Task 5 (billing) are independent of this task's frontend changes.

- [ ] **Step 1: Confirm full file list matches exactly**

```bash
git status --porcelain -- src/App.tsx src/main.tsx src/components/Navigation.tsx src/components/HomeOrGenerator.tsx src/components/ProfileInput.tsx src/components/AIConsentScreen.tsx src/components/auth/AuthModeSync.tsx src/components/auth/RequireAuthOrGuest.tsx src/components/auth/GuestPromptModal.tsx src/pages/Generator.tsx src/pages/SignIn.tsx src/pages/AuthCallback.tsx src/pages/Dashboard.tsx src/hooks/useUserProfile.ts src/hooks/useUsageTracking.ts src/hooks/useIsNewUser.ts src/hooks/useAuthedFunctionInvoke.ts src/hooks/useImageTextExtraction.ts src/lib/guest.ts src/contexts/SupabaseContext.tsx
```
Expected: 19 `M` lines + 1 `D` line (`src/contexts/SupabaseContext.tsx`), matching this task's file list exactly.

- [ ] **Step 2: Full project lint** (Task 2's new files are still unstaged-but-on-disk at this point since Task 2 already committed them — this lints the real, current tree)

```bash
npm run lint
```
Expected: no errors. Pre-existing warnings unrelated to these files are acceptable — but do not proceed if lint reports errors in any file from this task's list.

- [ ] **Step 3: Full production build**

```bash
npm run build
```
Expected: build succeeds. This is the most important gate for this task — it's the first point where all ~15 consumers of `useNativeAwareAuth` compile together against the real `src/contexts/SupabaseContext.tsx` deletion.

- [ ] **Step 4: Stage exactly these paths**

```bash
git add \
  src/App.tsx src/main.tsx \
  src/components/Navigation.tsx src/components/HomeOrGenerator.tsx src/components/ProfileInput.tsx src/components/AIConsentScreen.tsx \
  src/components/auth/AuthModeSync.tsx src/components/auth/RequireAuthOrGuest.tsx src/components/auth/GuestPromptModal.tsx \
  src/pages/Generator.tsx src/pages/SignIn.tsx src/pages/AuthCallback.tsx src/pages/Dashboard.tsx \
  src/hooks/useUserProfile.ts src/hooks/useUsageTracking.ts src/hooks/useIsNewUser.ts src/hooks/useAuthedFunctionInvoke.ts src/hooks/useImageTextExtraction.ts \
  src/lib/guest.ts
git rm src/contexts/SupabaseContext.tsx
```

- [ ] **Step 5: Verify staged set matches exactly this task's 20 paths (19 modified + 1 deleted), nothing from Tasks 4/5 or the held-out files**

```bash
git status --porcelain | grep -E '^[MAD]'
```
Expected: exactly the paths from Step 4, no `src/pages/Billing.tsx`, no `src/lib/revenuecat.ts`, no `src/lib/templates.ts`, no `src/pages/Landing.tsx`, no `supabase/...`.

- [ ] **Step 6: Commit**

```bash
git commit -m "$(cat <<'EOF'
Adopt native-aware auth across the app; retire SupabaseContext

Routes, navigation, profile/generator flows, and usage-tracking hooks
now read auth state through useNativeAwareAuth() instead of Clerk's
web hooks directly, so native ClerkKit sessions are respected on iOS.
Guest-mode reconciliation (STAGE_E2) ensures a restored native session
clears stale guest state. SupabaseContext.tsx is removed; its role is
now covered by the already-committed ClerkSyncContext.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Backend Clerk auth verification (Supabase Edge Functions)

**Files:**
- Modify: `supabase/functions/_shared/clerkAuth.ts`
- Modify: `supabase/functions/extract-profile-text/index.ts`
- Modify: `supabase/functions/generate/index.ts`
- Create (untracked): `supabase/functions/clerk-proxy/index.ts`

**Note on `generate/index.ts` scope:** this file's diff is large (~1370 changed lines) and is not purely an auth change — grep confirms `verifyClerkJWT` is newly imported and `clerk_user_id` replaces the old user-id lookup (the auth-relevant part), but the same diff also touches guest-run-limit logic and generation-prompt content that appear unrelated to auth. Splitting this file by hunk was considered and rejected as unsafe (risk of committing a half-working function); it is committed whole. Flag this for a human follow-up read-through after the checkpoint to confirm the non-auth portions were intentional.

**Must NOT be staged in this task:**
- `supabase/.temp/` — Supabase CLI local project-link state (project ref, pooler URL). Never commit.

- [ ] **Step 1: Confirm file list**

```bash
git status --porcelain -- supabase/functions/_shared/clerkAuth.ts supabase/functions/extract-profile-text/index.ts supabase/functions/generate/index.ts supabase/functions/clerk-proxy/index.ts
```
Expected: 3 `M` + 1 `??`.

- [ ] **Step 2: Run the relevant Deno test suite**

The only existing test file in this area is for Apple StoreKit JWS verification, not Clerk — it's unrelated to this task's content but is the one automated check available in `supabase/functions/`, so run it as a smoke test that the Deno toolchain and shared-function directory aren't broken by this diff:

```bash
deno test supabase/functions/_shared/appleTransactionAuth.test.ts
```
Expected: all tests pass. This does **not** exercise `clerkAuth.ts`, `generate/index.ts`, or `clerk-proxy/index.ts` — there is no automated coverage for the Clerk verification path itself (see "Ambiguous / not committed yet" section below for the follow-up this implies).

- [ ] **Step 3: Type-check the edge functions with Deno**

```bash
deno check supabase/functions/_shared/clerkAuth.ts supabase/functions/extract-profile-text/index.ts supabase/functions/generate/index.ts supabase/functions/clerk-proxy/index.ts
```
Expected: no type errors. This is the closest available substitute for a build step in this Deno-based directory (there is no `npm run build` coverage for `supabase/functions/`).

- [ ] **Step 4: Stage exactly these paths**

```bash
git add \
  supabase/functions/_shared/clerkAuth.ts \
  supabase/functions/extract-profile-text/index.ts \
  supabase/functions/generate/index.ts \
  supabase/functions/clerk-proxy/index.ts
```

- [ ] **Step 5: Verify nothing from `supabase/.temp/` or other tasks got staged**

```bash
git status --porcelain | grep '^supabase'
```
Expected: only the 4 paths above show as staged; `supabase/.temp/` must still show as untracked (`??`), not staged.

- [ ] **Step 6: Commit**

```bash
git commit -m "$(cat <<'EOF'
Verify Clerk JWTs in Supabase edge functions; add clerk-proxy

generate and extract-profile-text now identify users via
verifyClerkJWT()/clerk_user_id instead of Supabase auth. clerk-proxy
forwards requests to Clerk's Frontend API under capacitor://localhost
CORS rules, since the native WebView can't reach the hosted Clerk
domain directly.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: RevenueCat → StoreKit billing swap (kept separate from Clerk work)

**Files:**
- Modify: `src/pages/Billing.tsx` — swaps `@/lib/revenuecat` imports for `@/lib/storekit` (already committed in the earlier-pushed `f806d36`/`8321a8f` commits), renames `rc*`-prefixed state to `iap*`/`isIOSSubscribed`, adds per-product localized pricing display
- Modify: `src/lib/revenuecat.ts` — gutted from a full RevenueCat SDK integration (~111 lines) down to a ~16-line stub file ("RevenueCat removed — native StoreKit integration pending. Stubs keep existing import sites compiling without changes.")
- Modify: `src/components/RevenueCatAuthBridge.tsx` — gutted to a no-op (`return null`)

**Flag before committing:** `RevenueCatAuthBridge.tsx` is no longer imported anywhere in `src/` (confirmed via repo-wide grep) — it's now fully dead code left in place as a no-op rather than deleted. That's a judgment call belonging to whoever finishes the RevenueCat removal, not something to silently resolve here; commit it as-is (matches "current state, nothing lost") and note it in the PR description if one is opened later.

**Note:** `Billing.tsx` also contains one added `console.trace(...)` debug line (same pattern as `Dashboard.tsx`/`GuestPromptModal.tsx` in Task 3) inside its `isLoaded && !user` redirect effect. It stays in this commit since it's part of this file's current state; Task 6 removes it later.

**Must NOT be staged in this task:** nothing from Task 1–4's paths.

- [ ] **Step 1: Confirm file list**

```bash
git status --porcelain -- src/pages/Billing.tsx src/lib/revenuecat.ts src/components/RevenueCatAuthBridge.tsx
```
Expected: 3 `M` lines, nothing else.

- [ ] **Step 2: Lint just these files**

```bash
npx eslint src/pages/Billing.tsx src/lib/revenuecat.ts src/components/RevenueCatAuthBridge.tsx
```
Expected: no errors.

- [ ] **Step 3: Full build** (confirms `Billing.tsx`'s new `@/lib/storekit` import resolves correctly against the already-committed `src/lib/storekit.ts`)

```bash
npm run build
```
Expected: build succeeds.

- [ ] **Step 4: Stage exactly these paths**

```bash
git add src/pages/Billing.tsx src/lib/revenuecat.ts src/components/RevenueCatAuthBridge.tsx
```

- [ ] **Step 5: Verify isolation from other tasks**

```bash
git status --porcelain | grep '^M'
```
Expected: only these 3 paths staged; nothing from `src/App.tsx`, `supabase/`, etc.

- [ ] **Step 6: Commit**

```bash
git commit -m "$(cat <<'EOF'
Finish RevenueCat to StoreKit billing swap in the UI layer

Billing.tsx now drives iOS purchases/restores through storekit.ts.
revenuecat.ts and RevenueCatAuthBridge.tsx are reduced to stubs to
keep any remaining import sites compiling; RevenueCatAuthBridge is no
longer imported anywhere and can be deleted in a future cleanup once
confirmed safe.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Debug-logging cleanup (run only after Tasks 1–5 are committed and the app has been manually smoke-tested)

**Purpose:** Strip the `console.log`/`console.trace`/`console.error` debug instrumentation added throughout this branch, now that the underlying auth work is checkpointed and verifiable independently of its logging.

**Files to revisit (all already committed by Tasks 1–5 — this task edits them again, in place):**
- `src/App.tsx` (24 debug statements)
- `src/hooks/useUserProfile.ts` (17)
- `src/pages/SignIn.tsx` (10 — **including the token-prefix logging**: `sbt?.substring(0, 30)` and `st?.substring(0, 30)`, which log partial session/Supabase token material to the console and should be treated as the highest-priority removal in this file)
- `src/main.tsx` (3)
- `src/components/auth/AuthModeSync.tsx` (5)
- `src/components/auth/RequireAuthOrGuest.tsx` (5)
- `src/components/auth/GuestPromptModal.tsx` (1 — the `console.trace` added in Task 3)
- `src/pages/Dashboard.tsx` (1 — the `console.trace` added in Task 3)
- `src/pages/Billing.tsx` (1 — the `console.trace` added in Task 5)
- `src/pages/AuthCallback.tsx` (debug `console.log` lines added in Task 3)
- `src/lib/guest.ts` (1)
- `src/hooks/useNativeAwareAuth.ts` (3, added in Task 2)
- `src/components/AIConsentScreen.tsx` (mount/consent-flow logs added in Task 3)
- `supabase/functions/clerk-proxy/index.ts` (logs request method/path/target/cookie-presence/auth-header-presence — the auth-header logging truncates to 40 chars but still logs presence + prefix of a bearer token; remove before production)

- [ ] **Step 1: Decide what to keep vs. remove** — not every log is noise; some (e.g., a single terse error log on a genuine failure path) may be worth keeping as production-appropriate error reporting. This step is a judgment pass, not a blanket delete — read each file's logs in context before removing.
- [ ] **Step 2: Remove or gate the debug logs** (e.g., behind the existing `VITE_ENABLE_CLERK_NATIVE_DEBUG` flag already present in `.env.local`, if that's the intended mechanism — confirm with the user before assuming this is the right gate, since this plan doesn't have evidence of how that flag is currently wired to these specific call sites)
- [ ] **Step 3: Re-run lint, build, and the Deno smoke test**

```bash
npm run lint
npm run build
deno test supabase/functions/_shared/appleTransactionAuth.test.ts
deno check supabase/functions/clerk-proxy/index.ts
```

- [ ] **Step 4: Manual smoke test** — sign-in (native + web), guest mode entry/exit, consent screen, generator flow, billing purchase/restore — on an actual device or simulator, since none of this has automated coverage.
- [ ] **Step 5: Commit** (as one commit or several, at the executor's discretion — this task is intentionally left less prescriptive than Tasks 1–5 since it depends on judgment calls the plan can't make in advance)

---

## Task 7: Remove `betteropnr-main/` (separate cleanup, not part of the Clerk checkpoint)

**Files:**
- Delete: `betteropnr-main/` (219 tracked files — the entire directory)

**Must NOT be staged together with this task:**
- The directory's own uncommitted `AIConsentScreen.tsx` edit must never be staged/committed on its own first — it dies with the rest of the directory. Do not run `git add betteropnr-main/src/components/AIConsentScreen.tsx` at any point; go straight to removing the whole tree.

- [ ] **Step 1: Re-confirm nothing in `betteropnr-main/` is referenced by any build/config path** (this was already verified during investigation — repo-wide grep for `betteropnr-main` outside the directory itself returned zero hits, and `tsconfig.app.json`/`vite.config.ts` scope everything to `./src`). Re-run as a final safety check immediately before removal:

```bash
grep -rn "betteropnr-main" --include="*.ts" --include="*.tsx" --include="*.json" --include="*.js" --include="*.html" . 2>/dev/null | grep -v "^betteropnr-main/" | grep -v node_modules
```
Expected: no output.

- [ ] **Step 2: Remove the tracked directory**

```bash
git rm -r betteropnr-main/
```

- [ ] **Step 3: Full build to confirm nothing broke**

```bash
npm run build
```
Expected: build succeeds — this directory was never part of the build graph, so this should be a no-op confirmation.

- [ ] **Step 4: Commit**

```bash
git commit -m "$(cat <<'EOF'
Remove betteropnr-main/, a stray full-repo copy from a 2026-03-03 merge

Traced via git history: this directory was introduced wholesale by
merge commit d5ca0c4 (gpt-engineer-app[bot]/Lovable sync), not added
deliberately. Confirmed unreferenced by any build, import, or config
path in the real app. Its lone uncommitted edit (a since-discarded
SFSafariViewController scroll fix in AIConsentScreen.tsx) targeted a
rendering context AIConsentScreen never actually runs in.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Ambiguous — do NOT commit yet

- **`src/lib/templates.ts`** — this diff removes the `quirkyEitherOr` export and rewrites `conversationTemplates` copy. It has no relationship to Clerk-auth, RevenueCat/billing, or any of the branch's stated goals. Unclear whether this is intentional in-progress content work, an accidental edit from a different task, or a leftover experiment. **Recommendation:** ask the user directly what this change is before it goes anywhere — it doesn't belong in any of the 5 commits above, and it's not safe to guess-bucket it.
- **`src/pages/Landing.tsx`** — the entire diff is Prettier-style reformatting (single→double quotes, import/line wrapping) with zero functional change detected. Likely an IDE format-on-save that ran when the file was opened for an unrelated reason. **Recommendation:** either revert this file's formatting-only diff (if the user confirms no functional change was intended) or commit it alone as a trivial "reformat" commit — but don't fold it into any of the Clerk/billing commits, since it would falsely inflate their diffs with unrelated noise.
- **No automated test coverage exists for the Clerk verification path** (`clerkAuth.ts`, `generate/index.ts`'s auth branch, `clerk-proxy/index.ts`) or for any of the new native-auth frontend code (`useNativeAwareAuth`, `clerkNativeAuth.ts`). The only test in the repository (`appleTransactionAuth.test.ts`) is unrelated (Apple StoreKit). This isn't something to fix as part of checkpointing, but it means Tasks 3 and 4's "verification" is necessarily limited to lint/build/manual testing — flagging so the absence of test coverage isn't mistaken for "verified" in a stronger sense.
- **Task 6's debug-log-gating mechanism** (`VITE_ENABLE_CLERK_NATIVE_DEBUG`) exists in `.env.local` but this plan found no evidence of it actually being wired to the specific `console.*` call sites listed in Task 6 — confirm with the user whether that flag is meant to gate them before assuming so.

---

## Self-Review

**Constraint coverage:**
1. Exact logical commits — 5 checkpoint commits (Tasks 1–5) + 1 cleanup commit (Task 7) + 1 deferred cleanup task (Task 6). ✅
2. Exact path lists per commit — every task's Files section is a closed, explicit list. ✅
3. Paths that must NOT be staged — called out per-task (Task 1: xcuserdata; Task 4: supabase/.temp; Task 7: never stage the dead-directory's file edit alone) plus a global "never staged" row in the File Structure table (dev-dist/, supabase/.temp/, ios-broken-backup/). ✅
4. Clerk/native-auth (Tasks 1–4) separated from RevenueCat/billing (Task 5). ✅
5. Dedicated debug-logging cleanup step — Task 6, explicitly deferred until after functional verification. ✅
6. `betteropnr-main/` removal is Task 7, explicitly separate from Tasks 1–5. ✅
7. Verification commands before each commit — lint/build/deno test/deno check/plutil per task, matched to what's actually checkable safely. ✅
8. Ambiguous items called out and excluded — `templates.ts`, `Landing.tsx`, missing test coverage, and the debug-flag question are all listed with no commit assigned. ✅
9. No execution happened while writing this plan — confirmed no `git add`/`commit`/etc. were run in this session beyond read-only `git status`/`git diff`/`git log`/`grep` used for investigation.

**Placeholder scan:** no TBD/TODO markers; every commit message and command is concrete and copy-pasteable.

**Type/name consistency:** `useNativeAwareAuth`'s return shape in Task 2 matches how it's destructured across every Task 3 consumer file (verified via grep during investigation — `isLoaded`, `isSignedIn`, `userId`, `getAuthToken`, `isNativeAuthenticated`, `nativeToken`, `firstName`, `username`, `email` all match actual call sites).
