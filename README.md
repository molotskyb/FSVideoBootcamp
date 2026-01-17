# Full-Stack Video Streaming Bootcamp Part 1

**Created by:** Boris Molotsky
**GitHub:** [github.com/molotskyb/FSVideoBootcamp](https://github.com/molotskyb/FSVideoBootcamp)
**Follow for updates:** LinkedIn – [Boris Molotsky](https://www.linkedin.com/in/boris-molotsky)

Part 1 is available now. It includes **Module 1 and Module 2**

- **Module 1:** FFmpeg Encoding Foundations
- **Module 2:** Packaging Foundations (CMAF HLS and CMAF DASH, plus Shaka Packager)

Part 2 (DRM and Advanced Players) is coming soon.

---

## What you build in Part 1

By the end of Part 1, you can:

- Inspect and validate video with **ffprobe**
- Encode MP4 outputs with streaming-friendly GOP settings
- Compare **CRF vs CBR vs 2-pass VBR**
- Build an **ABR ladder** (240p → 1080p)
- Package **HLS CMAF** and **DASH CMAF** with FFmpeg
- Package production-grade outputs with **Shaka Packager**
- Validate manifests and tags with simple lint scripts

---

## Repo layout (high level)

- `public/assets/` . input media (example: `sample.mp4`, optional captions)
- `public/media/` . published lab outputs (generated)
- `scripts/` . helper scripts (example: thumbnails VTT generator)
- `../ffout/` . local build artifacts (generated outside repo folder)

---

## Requirements

- Node.js (recommended: 22 LTS) and Yarn (Corepack)
- FFmpeg + FFprobe installed and available in PATH
- Shaka Packager installed and available as `packager` in PATH
- macOS or Linux recommended. Windows supported with `:win` scripts where provided

---

## Quick Start

```bash
git clone https://github.com/molotskyb/FSVideoBootcamp.git
cd FSVideoBootcamp
yarn install
yarn dev
```

## FAQ

Q: Do I need Part 1 before Part 2
Yes. Part 2 assumes you already understand encoding and packaging workflows from Part 1.

Q: Can I use this commercially
Yes. The repo is MIT licensed. Replace sample assets and test URLs with your own.

Q: Where are the generated files
Most artifacts go to ../ffout/. Published lab assets are copied into public/media/.

Q: I have an issue running a script
Please open an issue on GitHub with details about your environment and the error message.

Q: Can I contribute
Yes! Feel free to open a PR with improvements or fixes. Please follow existing code style.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

© 2026 Boris Molotsky. All rights reserved.
