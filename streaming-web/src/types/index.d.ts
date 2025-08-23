/// <reference types="vite/client" />

/**
 * Vite env typings (adjust if you add more)
 */
interface ImportMetaEnv {
	readonly VITE_DASH_URL: string;
	readonly VITE_WV_LICENSE_URL?: string;
	readonly VITE_PR_LICENSE_URL?: string;
	/** JSON string of headers, e.g. {"Authorization":"Bearer <TOKEN>"} */
	readonly VITE_DRM_HEADERS?: string;
}
interface ImportMeta {
	readonly env: ImportMetaEnv;
}

/**
 * Asset modules you may import (optional but handy)
 */
declare module "*.vtt" {
	const url: string;
	export default url;
}
declare module "*.svg" {
	const url: string;
	export default url;
}
declare module "*.png" {
	const url: string;
	export default url;
}
declare module "*.jpg" {
	const url: string;
	export default url;
}
declare module "*.jpeg" {
	const url: string;
	export default url;
}
declare module "*.webp" {
	const url: string;
	export default url;
}

/**
 * App-level shared types (global)
 * Use these if you want to type catalog items across the app.
 */
declare global {
	type AppDrmConfig = {
		widevine?: string; // license URL
		playready?: string; // license URL
		headers?: Record<string, string>; // license request headers
	};

	interface AppCatalogSubtitle {
		lang: string; // e.g., "en"
		vtt: string; // URL to VTT
		label?: string; // shown in UI
	}

	interface AppCatalogItem {
		id: string;
		title: string;
		poster?: string; // /assets/posters/...
		hls?: string; // optional
		dash?: string; // preferred for dash.js
		subtitles?: AppCatalogSubtitle[];
		drm?: {
			widevine?: { licenseUrl: string };
			playready?: { licenseUrl: string };
			fairplay?: {
				certificateUrl: string;
				licenseUrl: string;
				skdUrl?: string;
			};
		};
	}
}

export {};
