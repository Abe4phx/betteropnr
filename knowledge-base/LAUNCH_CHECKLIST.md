# BetterOpnr Launch Checklist

## Purpose

This checklist defines the minimum quality bar required before BetterOpnr's public launch. Every item on this checklist should be objectively verifiable — checked only when it has been directly confirmed, not assumed. This document does not include aspirational goals or future features; it covers only what must be true at launch.

---

# AI Quality

## Benchmark Validation

- [x] EX-001 through EX-010 reviewed
- [ ] No unsupported factual assumptions
- [ ] No ownership assumptions
- [ ] No direct profile quoting
- [ ] Strong strategy diversity
- [ ] Every opener naturally encourages a reply
- [x] No generic fallback-style messages

## Prompt Quality

- [x] Phase 2A guide finalized
- [x] Prompt wording frozen for launch
- [ ] No known recurring benchmark failures

## Accepted Launch Risks

- Rare unsupported factual or ownership assumptions may still occur because model output is probabilistic.
- Some openers may use an implicit rather than explicit reply path.
- Strategy diversity may occasionally be weaker than requested.
- These risks are accepted for the initial launch because they are isolated rather than systemic and users receive multiple opener options.
- Recurring failures will be documented and addressed using production feedback.

---

# Product

## Guest Experience

- [ ] Guest onboarding works
- [ ] Two free openers generated
- [ ] Guest limit enforced
- [ ] Upgrade path works

## Authenticated Experience

- [ ] Login works
- [ ] Apple Sign In works
- [ ] User profile loads
- [ ] Three opener generation works
- [ ] Usage tracking works

## Subscriptions

- [ ] Monthly purchase
- [ ] Yearly purchase
- [ ] Restore purchases
- [ ] Subscription expiration handling

---

# Reliability

- [ ] Edge Function deployed
- [ ] Gemini primary works
- [ ] Flash-Lite fallback verified
- [ ] Lovable fallback verified
- [ ] Emergency fallback verified
- [ ] Error handling acceptable

---

# iOS

- [ ] Install from TestFlight
- [ ] Image upload
- [ ] Generator flow
- [ ] Guest flow
- [ ] Purchase flow
- [ ] Restore purchases
- [ ] Sign out / Sign in
- [ ] No critical crashes

---

# App Store

- [ ] Screenshots current
- [ ] Description current
- [ ] Privacy Policy current
- [ ] Terms current
- [ ] Review notes current

---

# Analytics

- [ ] Generation events
- [ ] Purchase events
- [ ] Error logging
- [ ] Crash reporting

---

# Manual QA

- [ ] Empty profile
- [ ] Excellent profile
- [ ] Weak profile
- [ ] Poor network
- [ ] API timeout
- [ ] Invalid image
- [ ] Large image

---

# Launch Decision

- [ ] READY
- [ ] READY WITH MINOR FIXES
- [ ] NOT READY

BetterOpnr should launch only when every launch-critical checkbox above has been intentionally reviewed — not skipped, not assumed, and not deferred. A checkbox left unchecked means the corresponding item has not yet been verified.

---

# Revision History

Version 0.1

Status: Draft

Summary: Initial launch readiness checklist.

Version 0.2

Status: Draft

Summary: Recorded completed AI benchmark validation, froze the launch prompt, and documented accepted residual AI risks.
