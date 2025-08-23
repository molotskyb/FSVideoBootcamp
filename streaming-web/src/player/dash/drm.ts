import type { DrmConfig } from "../adapter";

/** Build dash.js ProtectionData from our simple DrmConfig. */
export function buildProtectionData(drm?: DrmConfig) {
	if (!drm) return undefined;
	const pd: any = {};
	if (drm.widevine) {
		pd["com.widevine.alpha"] = { serverURL: drm.widevine };
		if (drm.headers) pd["com.widevine.alpha"].httpRequestHeaders = drm.headers;
	}
	if (drm.playready) {
		pd["com.microsoft.playready"] = { serverURL: drm.playready };
		if (drm.headers)
			pd["com.microsoft.playready"].httpRequestHeaders = drm.headers;
	}
	return pd;
}
