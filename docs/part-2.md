# Part 2. Content Delivery, CDN, QoE, Canary, and DRM

Status: in progress

Part 2 turns the local packaging workflow into a deployable streaming delivery system.

It introduces AWS S3, CloudFront, access control, cache behavior, QoE logging, canary streams, and DRM fundamentals.

---

## Module 1. Content Delivery. S3 + CDN Fundamentals

You build:

- S3 static website hosting
- CloudFront distribution
- signed URL protection
- signed cookie protection
- cache key query-string whitelist
- CloudFront invalidation flow
- query-string versioning strategy
- OriginPath rollback
- QoE console logging page
- 480p canary HLS/DASH stream
- final review and git checkpoint workflow

Core idea:

```text
Package → Publish → Protect → Cache → Observe → Verify
```

---

## Module 2. DRM Fundamentals

You build and inspect:

- DRM landscape map: Widevine, PlayReady, FairPlay
- ClearKey playback demo without a license server
- CENC key concepts: random KID and KEY generation
- encrypted DASH output with Shaka Packager
- init data and PSSH inspection
- license request flow storyboard
- Widevine development-only playback test
- dash.js protection data setup with `setProtectionData`
- DRM error-hunt by breaking keys and reading console errors

Core idea:

```text
Encrypted segments + init data + license flow = controlled playback
```
