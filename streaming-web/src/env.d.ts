interface ImportMetaEnv {
	readonly VITE_MPD?: string;
	readonly VITE_CLEAR_DASH?: string;
	readonly VITE_DRM_DASH?: string;
	readonly VITE_CLEAR_HLS?: string;
	readonly VITE_WV?: string;
	readonly VITE_PR?: string;
	readonly VITE_DRM_HEADERS?: string;
	readonly VITE_GH_REPO?: string;
	readonly VITE_GH_BRANCH?: string;
}
interface ImportMeta {
	readonly env: ImportMetaEnv;
}
