# Full-Stack Video Streaming Bootcamp

**Created by:** Boris Molotsky  
**GitHub:** [github.com/molotskyb/FSVideoBootcamp](https://github.com/molotskyb/FSVideoBootcamp)  
**Follow for updates:** [LinkedIn – Boris Molotsky](https://www.linkedin.com/in/boris-molotsky)
A hands-on engineering bootcamp for building a Netflix-Lite style video platform from the ground up.
This repository is public on purpose. It serves as:

- a course companion
- an OTT / CTV engineering portfolio
- a practical reference project for web-video workflows
- a growing codebase for encoding, packaging, CDN delivery, QoE, canary validation, and DRM fundamentals
  The paid course videos provide the full explanation, sequencing, debugging process, and production reasoning behind the code.

---

## Course status

### Part 1. Published

**Encoding & Packaging Foundations**
Part 1 is available now.
It includes:

- **Module 1:** FFmpeg Encoding Foundations
- **Module 2:** Packaging Foundations with CMAF HLS, CMAF DASH, and Shaka Packager

### Part 2. In progress

**Content Delivery, CDN, QoE, Canary, and DRM**
Current and upcoming modules include:

- AWS S3 static website hosting
- CloudFront CDN delivery
- Signed URLs and signed cookies
- Cache-key design
- CloudFront invalidation
- Query-string versioning
- OriginPath rollback
- QoE logging
- 480p canary streams
- DRM basics with ClearKey, CENC, PSSH, and Widevine development flows

### Future parts

Planned advanced topics:

- advanced player architecture
- low-latency streaming
- Smart TV playback constraints
- production DRM patterns
- playback observability
- CI/CD for streaming workflows

---

## What you build

By following the bootcamp, you progressively build a practical streaming stack.
You will learn to:

- inspect and validate video with `ffprobe`
- encode MP4 outputs with streaming-friendly GOP settings
- compare CRF, CBR, and 2-pass VBR
- build an ABR ladder from 240p to 1080p
- package CMAF HLS and CMAF DASH
- use Shaka Packager for production-style packaging
- validate HLS and DASH manifests
- publish media to S3
- deliver assets through CloudFront
- protect content with signed URLs and signed cookies
- test cache behavior with query-string versioning and invalidation
- switch CloudFront OriginPath for rollback-style workflows
- build a lightweight QoE logging page
- generate a 480p canary stream for rollout checks
- prepare for DRM workflows using ClearKey, CENC, PSSH, and Widevine test flows
  The long-term goal is to understand not just “how to play a video,” but how a modern streaming system is prepared, delivered, protected, tested, and debugged.

---

## Repository philosophy

This repo is public intentionally.
The goal is not to hide every line of code. The goal is to demonstrate real engineering practice:

- how the pipeline is assembled
- why each command exists
- how scripts connect into a workflow
- how packaging and playback relate
- how CDN behavior affects real playback
- how production-style mistakes are diagnosed
- how OTT concepts connect end to end
  The course videos provide the guided path, explanation, tradeoffs, debugging, and decision-making process.

---

## Repository layout

```text
streaming-web/
  public/
    assets/          # input media, sample files, optional captions
    media/           # generated published outputs
  scripts/
    aws/             # S3 and CloudFront helper scripts
    *.cjs / *.mjs    # local workflow and generator scripts
  src/
    app/             # React app shell and navigation
    pages/           # lesson/player pages
    player/          # player adapters and DRM helpers
    components/      # shared UI/player components
docs/
  course-map.md
  part-1.md
  part-2.md
  streaming-glossary-student.md
../ffout/             # generated local build artifacts outside the app folder

Generated files are intentionally separated:

* ../ffout/ contains intermediate build artifacts
* streaming-web/public/media/ contains files served by the local app and deployable to S3

This keeps the repository cleaner while still making generated playback assets easy to serve in development.

⸻

Requirements

Recommended environment:

* Node.js 22 LTS
* Yarn
* FFmpeg and FFprobe
* Shaka Packager available as packager
* AWS CLI configured for CDN deployment lessons
* jq for some helper workflows
* macOS or Linux recommended

Windows is supported where :win scripts are provided.

Check your tools:

node -v
yarn -v
ffmpeg -version
ffprobe -version
packager --version
aws --version

Node 22 LTS is recommended because media tooling and frontend build tooling are usually more predictable on LTS releases than on current/non-LTS Node versions.

⸻

Quick start

git clone https://github.com/molotskyb/FSVideoBootcamp.git
cd FSVideoBootcamp/streaming-web
yarn install
yarn dev

Open:

http://localhost:5173/

⸻

Common workflows

Encode a baseline MP4

yarn mp4:transcode

Output:

../ffout/output.mp4

⸻

Generate audio assets

yarn audio:all

Output:

../ffout/audio/

⸻

Package HLS with Shaka Packager

yarn hls:sp:clean
yarn hls:sp:package
yarn hls:sp:publish

Output:

public/media/hls_sp/

⸻

Package DASH with Shaka Packager

yarn dash:sp:clean
yarn dash:sp:package
yarn dash:sp:publish

Output:

public/media/dash_sp/

⸻

Generate the 480p canary stream

yarn canary:all

Output:

public/media/canary/hls/master.m3u8
public/media/canary/dash/stream.mpd

⸻

Run the local React app

yarn dev

Open:

http://localhost:5173/

⸻

CDN and AWS lessons

Part 2 includes S3 and CloudFront workflows.

Typical commands include:

export AWS_REGION=us-east-1
export S3_BUCKET=fs-video-yourname-demo
yarn s3:mk
yarn s3:website
yarn s3:sync
yarn cf:mk
yarn cf:wait
yarn cf:url

CloudFront helper scripts write local artifacts under:

../ffout/aws/

Examples:

../ffout/aws/ffout_cf_id.txt
../ffout/aws/ffout_cf_domain.txt
../ffout/aws/ffout_cf_cache_policy_id.txt

These files are local workflow artifacts. Do not treat them as source code.

⸻

QoE and canary checks

The project includes a lightweight QoE page that logs playback signals to the browser console.

Typical signals:

* startup time
* bitrate switches
* stalls
* errors
* dropped frames

The canary workflow generates a small 480p HLS/DASH test stream.

This is useful for quickly checking whether the delivery path works before trusting a larger ladder or a more complex release.

⸻

DRM direction

The DRM module focuses on fundamentals first:

* DRM landscape
* ClearKey
* CENC
* KID / KEY
* PSSH
* license request flow
* Widevine development playback
* dash.js protection configuration
* DRM error interpretation

FairPlay and deeper production license-server plumbing are treated as advanced add-ons.

Important:

Do not commit real production DRM keys, private license URLs, certificates, customer secrets, or vendor credentials.

Use placeholders and development/test endpoints only.

⸻

Generated files and cleanup

Most scripts generate artifacts under:

../ffout/

Some scripts publish playable files into:

streaming-web/public/media/

If you want a clean local state, remove generated outputs carefully:

rm -rf ../ffout
rm -rf public/media

Then regenerate only what you need for the lesson you are following.

⸻

Git checkpoints

The bootcamp uses commits and tags as learning checkpoints.

Examples:

git add -A
git commit -m "baseline: end of CDN module"
git tag v-part2-module1-complete

This makes it easier to return to a stable state before starting more experimental modules such as DRM.

⸻

FAQ

Do I need Part 1 before Part 2?

Yes. Part 2 assumes you understand the encoding and packaging workflows from Part 1.

Is the repo enough without the course videos?

The repo contains working code and scripts, but the course videos provide the guided explanation, sequencing, reasoning, and debugging workflow.

Can I use this commercially?

Yes. The repo is MIT licensed. Replace sample assets, placeholder domains, test keys, and AWS resources with your own.

Are real secrets included?

No. Do not commit real AWS credentials, DRM keys, private certificates, production license URLs, or vendor secrets.

Where are generated files?

Most intermediate artifacts go to:

../ffout/

Published lab assets are copied into:

streaming-web/public/media/

Why is this repo public if the course is paid?

The repo is a companion and portfolio project. The paid course provides the structured walkthrough, explanations, demos, and engineering reasoning.

Can I contribute?

Yes. Open an issue or pull request with improvements, fixes, or environment notes.

Please keep changes focused and avoid committing generated media unless explicitly needed.

⸻

License

This project is licensed under the MIT License. See the LICENSE￼ file for details.

© 2026 Boris Molotsky. All rights reserved.
```
