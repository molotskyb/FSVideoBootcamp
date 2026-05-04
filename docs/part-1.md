# Part 1. Encoding & Packaging Foundations

Status: published

Part 1 builds the foundation for everything that follows.

It focuses on local video preparation, encoding decisions, ABR ladder generation, and packaging into streaming formats.

---

## Module 1. FFmpeg Encoding Foundations

You learn how to:

- inspect media with ffprobe
- transcode MP4 files
- control GOP and keyframe spacing
- compare rate control strategies
- build a simple ABR ladder
- reason about bitrate, resolution, and encode cost

---

## Module 2. Packaging Foundations

You learn how to:

- package HLS CMAF
- package DASH CMAF
- use Shaka Packager
- generate subtitles and thumbnails
- validate manifests
- prepare assets for player and CDN workflows

---

## Why this matters

Part 2 assumes you already understand:

- what encoded outputs are
- how HLS and DASH manifests reference segments
- why segment duration matters
- how public media assets are generated
- how `../ffout/` and `public/media/` are used

Part 1 is the local media pipeline. Part 2 moves that pipeline toward real delivery.
