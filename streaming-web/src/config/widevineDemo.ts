// Dev-only Widevine test content.
// The MPD and license URL must be a matched pair from the same test provider.
// Random local KID/KEY values will not work with an unrelated Widevine license server.
// Do not commit production DRM credentials.
function readHeaders() {
	try {
		return JSON.parse(import.meta.env.VITE_DRM_HEADERS || "{}");
	} catch {
		return {};
	}
}

export const WIDEVINE_DEMO = {
	mpdUrl:
		import.meta.env.VITE_WV_MPD_URL ||
		import.meta.env.VITE_DRM_DASH ||
		"https://storage.googleapis.com/shaka-demo-assets/angel-one-widevine/dash.mpd",
	licenseUrl:
		import.meta.env.VITE_WV_LICENSE_URL ||
		import.meta.env.VITE_WV ||
		"https://cwip-shaka-proxy.appspot.com/no_auth",
	headers: readHeaders() as Record<string, string>,
};