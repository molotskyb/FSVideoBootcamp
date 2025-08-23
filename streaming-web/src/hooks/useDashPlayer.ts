// src/hooks/useDashPlayer.ts
import { useEffect, useRef, useState } from "react";
import type { MediaPlayerClass } from "dashjs";
import { createDashPlayer } from "../player/dash/createDashPlayer";
import type { DrmConfig } from "../player/adapter";
import { usePlayerStore } from "../state/usePlayerStore";

type DashWrapper = {
	init: (video: HTMLVideoElement, drm?: DrmConfig) => Promise<void>;
	load: (manifestUrl: string) => Promise<void>;
	destroy: () => void;
	on: (event: string, cb: (...args: any[]) => void) => void;
	off?: (event: string, cb: (...args: any[]) => void) => void;
	// Optional escape hatch to get the native dash.js instance
	getNative?: () => MediaPlayerClass | null;
	// Some wrappers expose the instance on a field:
	mediaPlayer?: MediaPlayerClass | null;
};

export function useDashPlayer(manifestUrl: string, drm?: DrmConfig) {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const [error, setError] = useState<unknown>(null);
	const [player, setPlayer] = useState<MediaPlayerClass | null>(null);

	const store = usePlayerStore();

	useEffect(() => {
		let aborted = false;
		let wrapper: DashWrapper | null = null;

		async function setup() {
			setError(null);

			if (!videoRef.current) return;

			try {
				// 1) Create wrapper and init
				wrapper = createDashPlayer() as unknown as DashWrapper;
				await wrapper.init(videoRef.current, drm);

				// 2) Wire store listeners
				const handleBitrate = (...args: any[]) => store.onBitrate?.(...args);
				const handleError = (e: any) => store.onError?.(e);

				wrapper.on("bitrateChanged", handleBitrate);
				wrapper.on("error", handleError);

				// 3) Load manifest
				await wrapper.load(manifestUrl);
				if (aborted) return;

				// 4) Expose the native dash.js player if available
				const native = wrapper.getNative?.() ?? wrapper.mediaPlayer ?? null;

				setPlayer(native);

				// 5) Cleanup function removes listeners then destroys
				return () => {
					try {
						if (wrapper?.off) {
							wrapper.off("bitrateChanged", handleBitrate);
							wrapper.off("error", handleError);
						}
					} finally {
						// Always destroy last
						wrapper?.destroy();
						wrapper = null;
					}
				};
			} catch (err) {
				if (!aborted) setError(err);
				try {
					wrapper?.destroy();
				} catch {
					/* noop */
				}
			}
		}

		const cleanupPromise = setup();

		// Unmount / dep change cleanup
		return () => {
			aborted = true;
			// If setup returned a cleanup, call it when it resolves
			if (cleanupPromise && typeof cleanupPromise === "function") {
				try {
					(cleanupPromise as unknown as () => void)();
				} catch {
					/* noop */
				}
			} else {
				// If not, best-effort destroy
				try {
					wrapper?.destroy();
				} catch {
					/* noop */
				}
			}
			setPlayer(null);
		};

		// Depend on manifest + DRM (stringify headers for stable equality)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		manifestUrl,
		drm?.widevine,
		drm?.playready,
		JSON.stringify(drm?.headers),
	]);

	return { videoRef, player, error };
}
