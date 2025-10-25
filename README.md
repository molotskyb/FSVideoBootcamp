## 📦 Scripts by Course Part

### ✅ Part 1: Encoding & CDN Foundations (Available Now)

Everything you need to build production-grade adaptive streaming pipelines.

#### Module 1: FFmpeg Encoding (lines 13-75)

```bash
# Inspect & probe
yarn probe              # Analyze source video
yarn probe:output       # Check encoded output

# Rate control comparison
yarn rate:all          # CRF vs CBR vs VBR (2-pass)

# ABR ladder generation
yarn ladder:all        # 240p → 1080p, 5 renditions

# Encoding presets
yarn presets:all       # ultrafast vs slow quality comparison

# Alternative codecs
yarn codecs:all        # HEVC & AV1 encoding
```

#### Module 2: HLS & DASH Packaging (lines 77-102)

```bash
# FFmpeg packaging
yarn hls:cmaf          # HLS with fMP4 segments
yarn dash:cmaf         # DASH with CMAF

# Shaka Packager (production-grade)
yarn hls:sp:package    # Multi-bitrate HLS
yarn dash:sp:package   # Multi-bitrate DASH

# Audio handling
yarn audio:all         # Extract/package audio tracks
```

#### Module 3: Thumbnails & Captions (lines 104-125)

```bash
# Thumbnail generation
yarn thumbs:vtt:extract  # Generate preview thumbnails
yarn thumbs:vtt:make     # Create WebVTT sprite sheet

# Captions
yarn captions:from-srt   # Convert SRT → WebVTT
yarn hls:subs:package    # Add subtitles to HLS
yarn dash:subs:package   # Add subtitles to DASH
yarn captions:burnin     # Hardcode captions (accessibility)
```

#### Module 4: CDN Deployment (lines 126-142)

```bash
# S3 setup
yarn s3:mk            # Create S3 bucket
yarn s3:policy        # Configure public access
yarn s3:sync          # Upload content

# CloudFront setup
yarn cf:config        # Generate distribution config
yarn cf:mk            # Create CloudFront distro
yarn cf:status        # Check deployment status
yarn cf:invalidate    # Clear CDN cache
yarn cf:cache:test    # Verify caching behavior
```

---

### 🚀 Part 2: DRM & Advanced Web Players (Coming Soon)

**What you'll learn:**

- ✅ Widevine & FairPlay DRM integration
- ✅ ClearKey for testing encrypted streams
- ✅ EME (Encrypted Media Extensions) deep dive
- ✅ License server integration & debugging
- ✅ Advanced ABR tuning strategies
- ✅ QoE monitoring & analytics
- ✅ Player error handling workflows

**Status:** Recording in progress. Expected release Q1 2026.

[→ Join Part 2 waitlist](https://yoursite.com/part2-waitlist) for launch discount.

---

## 🛠️ Utility Scripts (lines 144-158)

```bash
# Validation
yarn lint:hls:ffprobe    # Verify HLS structure
yarn lint:dash:ffprobe   # Verify DASH structure

# Smoke testing
yarn canary:all          # Generate 480p test stream
yarn review:urls         # List all deployment URLs
```

---

## 💡 Quick Start

```bash
# 1. Clone and install
git clone https://github.com/yourname/streaming-bootcamp.git
cd streaming-bootcamp
npm install

# 2. Generate test content
yarn mp4:transcode      # Encode source video
yarn ladder:all         # Create ABR ladder
yarn hls:sp:package     # Package as HLS
yarn dash:sp:package    # Package as DASH

# 3. Deploy to CDN (requires AWS account)
yarn s3:mk              # Create bucket
yarn s3:sync            # Upload
yarn cf:mk              # Create CloudFront
```

---

## 📚 Documentation

- **Part 1 Full Guide:** [docs/part1-guide.md](docs/part1-guide.md)
- **Troubleshooting:** [docs/troubleshooting.md](docs/troubleshooting.md)
- **FFmpeg Command Reference:** [docs/ffmpeg-reference.md](docs/ffmpeg-reference.md)

---

## ❓ FAQ

**Q: Why are there fewer scripts than other tutorials?**  
A: These ~50 scripts represent **production workflows**, not one-off experiments. Each script is used in the course and has been tested with real CDNs.

**Q: Can I use this for commercial projects?**  
A: Yes. The code is MIT licensed. Replace test URLs with your own content and you're good to go.

**Q: When is Part 2 launching?**  
A: Q1 2026. Join the [waitlist](https://yoursite.com/part2-waitlist) for early access.

**Q: Do I need to finish Part 1 before Part 2?**  
A: Yes. Part 2 assumes you understand encoding, packaging, and CDN delivery from Part 1.

```

---

## 🎯 **Why This Works Better**

| Benefit | Impact |
|---------|--------|
| **Less overwhelming** | Students don't see "4 locked parts" – just 1 active + 1 coming |
| **Focused messaging** | "Master Part 1, Part 2 adds DRM" is clearer than "4-part series" |
| **Flexibility** | You can pivot Parts 3/4 based on Part 2 feedback |
| **Launch velocity** | Ship Part 1 → announce Part 2 → gauge interest → plan Part 3 |
| **Lower commitment** | Students don't wonder "Will I need 4 courses?" |

---

## 📣 **In Your Marketing**

### **Part 1 Landing Page:**
> **Full-Stack Video Streaming Bootcamp – Part 1**
> Master production encoding and CDN delivery in 20 hours.
>
> ✅ FFmpeg encoding pipelines
> ✅ HLS & DASH packaging
> ✅ CloudFront deployment
>
> **Coming next:** Part 2 adds DRM (Widevine/FairPlay) – join waitlist for launch discount.

### **Inside Part 1 Final Lecture:**
> "You've built a production streaming pipeline! 🎉
>
> **Next: Part 2** covers how Netflix/Disney+ protect content with DRM. I'm recording it now – join the waitlist at [link] to get notified when it launches (Q1 2026) with an exclusive discount."

### **Email to Students After Part 1:**
```

Subject: You completed Part 1! Here's what's next 🚀

Congrats on finishing the encoding & CDN foundations!

You can now:
✅ Encode adaptive bitrate ladders
✅ Package HLS & DASH
✅ Deploy to CloudFront

NEXT UP: Part 2 – Secure Streaming with DRM

I'm currently recording Part 2, which covers:

- Widevine & FairPlay integration
- License server workflows
- Advanced ABR tuning
- QoE monitoring

Expected release: Q1 2026

Questions? Hit reply!
