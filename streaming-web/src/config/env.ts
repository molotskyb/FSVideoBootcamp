// src/config/env.ts
export const ENV = {
	// DASH
	CLEAR_DASH:
		import.meta.env.VITE_CLEAR_DASH ||
		"https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd",
	DRM_DASH:
		import.meta.env.VITE_DRM_DASH ||
		"https://storage.googleapis.com/shaka-demo-assets/angel-one-widevine/dash.mpd",
	DASH_CAPTIONS:
		import.meta.env.VITE_DASH_CAPTIONS ||
		"https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd",

	// HLS
	CLEAR_HLS:
		import.meta.env.VITE_CLEAR_HLS ||
		"https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",

	// MP4
	MP4:
		import.meta.env.VITE_MP4 ||
		"https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",

	// DRM endpoints (WV/PR for DASH; FPS for HLS Safari)
	WV: import.meta.env.VITE_WV || "https://cwip-shaka-proxy.appspot.com/no_auth",
	PR: import.meta.env.VITE_PR || "",

	// HLS DRM (FairPlay on Safari)
	FPS_HLS: import.meta.env.VITE_FPS_HLS || "", // FPS-encrypted HLS master
	FPS_CERT_URL: import.meta.env.VITE_FPS_CERT_URL || "", // server certificate endpoint
	FPS_LICENSE_URL: import.meta.env.VITE_FPS_LICENSE_URL || "", // license (CKC) endpoint

	DRM_HEADERS: (() => {
		try {
			return JSON.parse(import.meta.env.VITE_DRM_HEADERS || "{}");
		} catch {
			return {};
		}
	})(),
};
