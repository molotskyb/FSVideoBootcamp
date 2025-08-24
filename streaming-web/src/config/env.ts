export const ENV = {
	MPD: import.meta.env.VITE_MPD || "", // legacy default
	CLEAR_DASH:
		import.meta.env.VITE_CLEAR_DASH ||
		"https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd",
	DRM_DASH: import.meta.env.VITE_DRM_DASH || "", // your protected MPD (CMAF)
	CLEAR_HLS:
		import.meta.env.VITE_CLEAR_HLS ||
		"https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
	WV: import.meta.env.VITE_WV || "",
	PR: import.meta.env.VITE_PR || "",
	DRM_HEADERS: (() => {
		try {
			return JSON.parse(import.meta.env.VITE_DRM_HEADERS || "{}");
		} catch {
			return {};
		}
	})(),
};
