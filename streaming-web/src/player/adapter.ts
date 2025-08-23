export type DrmConfig = {
	widevine?: string; // license URL
	playready?: string; // license URL
	headers?: Record<string, string>; // license request headers
};

export interface PlayerAdapter {
	init(
		video: HTMLVideoElement,
		drm?: DrmConfig,
		options?: { lowLatencyEnabled?: boolean }
	): Promise<void>;
	load(url: string): Promise<void>;
	setPlaybackRate(rate: number): void;
	destroy(): Promise<void>;
	on(
		event: "bitrateChanged" | "error" | "playing" | "paused",
		cb: (data: any) => void
	): void;
	off?(
		event: "bitrateChanged" | "error" | "playing" | "paused",
		cb: (data: any) => void
	): void;
	getNative?(): any;
}
