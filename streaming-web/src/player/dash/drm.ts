import type { DrmConfig } from "../adapter";

function shouldAttachHeaders(url?: string, headers?: Record<string, string>) {
    if (!url || !headers || Object.keys(headers).length === 0) return false;
    // The demo Widevine proxy does not allow custom headers and will fail CORS preflight
    if (/cwip-shaka-proxy\.appspot\.com/i.test(url)) return false;
    return true;
}

/** Build dash.js ProtectionData from our simple DrmConfig. */
export function buildProtectionData(drm?: DrmConfig) {
    if (!drm) return undefined;
    const pd: any = {};
    if (drm.widevine) {
        pd["com.widevine.alpha"] = { serverURL: drm.widevine };
        if (shouldAttachHeaders(drm.widevine, drm.headers))
            pd["com.widevine.alpha"].httpRequestHeaders = drm.headers;
    }
    if (drm.playready) {
        pd["com.microsoft.playready"] = { serverURL: drm.playready };
        if (shouldAttachHeaders(drm.playready, drm.headers))
            pd["com.microsoft.playready"].httpRequestHeaders = drm.headers;
    }
    return pd;
}
