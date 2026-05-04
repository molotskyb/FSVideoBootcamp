# Streaming Glossary

A quick reference for terms used throughout the Full-Stack Video Streaming Bootcamp.

Keep this open while following the lessons.

---

## Core streaming terms

| Term | Meaning                                                                                                                |
| ---- | ---------------------------------------------------------------------------------------------------------------------- |
| ABR  | Adaptive Bitrate. Multiple renditions let the player switch quality based on network and buffer conditions.            |
| CDN  | Content Delivery Network. Edge network used to cache and deliver media close to users.                                 |
| CMAF | Common Media Application Format. Fragmented MP4 format commonly used for modern HLS and DASH.                          |
| HLS  | HTTP Live Streaming. Apple-originated adaptive streaming protocol.                                                     |
| DASH | Dynamic Adaptive Streaming over HTTP. MPEG adaptive streaming standard.                                                |
| MP4  | MPEG-4 Part 14 container format.                                                                                       |
| GOP  | Group of Pictures. Keyframe interval structure used during encoding.                                                   |
| VTT  | Web Video Text Tracks. Common subtitle and thumbnail timing format.                                                    |
| OTT  | Over-The-Top. Internet-delivered video outside traditional broadcast/cable delivery.                                   |
| QoE  | Quality of Experience. User-facing playback quality signals such as startup time, stalls, errors, and bitrate changes. |

---

## Browser playback terms

| Term  | Meaning                                                                                                          |
| ----- | ---------------------------------------------------------------------------------------------------------------- |
| MSE   | Media Source Extensions. Browser API that allows JavaScript players to feed media segments into a video element. |
| EME   | Encrypted Media Extensions. Browser API used for DRM license exchange and encrypted playback.                    |
| TTFF  | Time To First Frame. Startup delay from play request until first visible frame or first-frame proxy event.       |
| Stall | Playback interruption caused by buffering or unavailable media data.                                             |

---

## DRM terms

| Term      | Meaning                                                                                                |
| --------- | ------------------------------------------------------------------------------------------------------ |
| DRM       | Digital Rights Management. System for controlling playback of encrypted media.                         |
| CENC      | Common Encryption. Standard encryption scheme used across DASH and multi-DRM workflows.                |
| KID       | Key ID. Identifier that tells the player/license system which key is needed.                           |
| KEY       | Content encryption key. Secret value used to encrypt/decrypt media. Never commit real production keys. |
| PSSH      | Protection System Specific Header. DRM init data carried in the manifest or init segment.              |
| ClearKey  | Simple EME key system useful for demos and learning. Not production DRM.                               |
| Widevine  | Google DRM used mainly on Chrome, Android, Android TV, and many smart TVs.                             |
| PlayReady | Microsoft DRM used on Windows, Xbox, Edge, and many TV platforms.                                      |
| FairPlay  | Apple DRM used on Safari, iOS, iPadOS, tvOS, and Apple platforms.                                      |

---

## Encoding and codec terms

| Term         | Meaning                                                                        |
| ------------ | ------------------------------------------------------------------------------ |
| H.264 / AVC  | Widely supported video codec used across web, mobile, and TV devices.          |
| H.265 / HEVC | More efficient codec than H.264, common on Apple and smart TV platforms.       |
| AV1          | Modern open video codec with strong compression efficiency.                    |
| FPS          | Frames per second. Note: FPS can also mean FairPlay Streaming in DRM context.  |
| Bitrate      | Amount of data per second used by audio or video.                              |
| CRF          | Constant Rate Factor. Quality-targeted x264/x265 encoding mode.                |
| CBR          | Constant Bitrate. Bitrate-targeted encoding mode.                              |
| VBR          | Variable Bitrate. Bitrate can vary while targeting quality or average bitrate. |
