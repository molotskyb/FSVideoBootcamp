export const ENV = {
	MPD: import.meta.env.VITE_DASH_URL as string,
	WV: import.meta.env.VITE_WV_LICENSE_URL as string | undefined,
	PR: import.meta.env.VITE_PR_LICENSE_URL as string | undefined,
	DRM_HEADERS: safeJson(import.meta.env.VITE_DRM_HEADERS || "{}") as Record<
		string,
		string
	>,
};
function safeJson(s: string) {
	try {
		return JSON.parse(s);
	} catch {
		return {};
	}
}
