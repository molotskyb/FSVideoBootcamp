// src/hooks/useDashPlayer.ts
import { useEffect, useRef, useState } from "react";
import type { MediaPlayerClass } from "dashjs";
import { createDashPlayer } from "../player/dash/createDashPlayer";
import type { DrmConfig } from "../player/adapter"; // your existing type
import { usePlayerStore } from "../state/usePlayerStore";

type Options = { lowLatency?: boolean };

export function useDashPlayer(
	manifestUrl: string,
	drm?: DrmConfig,
	opts?: Options
) {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const [error, setError] = useState<unknown>(null);
	const [player, setPlayer] = useState<MediaPlayerClass | null>(null);
	const store = usePlayerStore();

	useEffect(() => {
		let aborted = false;
		let wrapper: ReturnType<typeof createDashPlayer> | null = null;

		(async () => {
			try {
				if (!videoRef.current) return;
				wrapper = createDashPlayer();
				await wrapper.init(
					videoRef.current,
					drm,
					opts ? { lowLatencyEnabled: opts.lowLatency } : undefined
				);
				wrapper.on("bitrateChanged", store.onBitrate);
				wrapper.on("error", store.onError);
				await wrapper.load(manifestUrl);
				if (!aborted) setPlayer(wrapper.getNative?.() ?? null);
			} catch (e) {
				if (!aborted) setError(e);
			}
		})();

		return () => {
			aborted = true;
			try {
				wrapper?.destroy();
			} catch {
				// intentionally ignored
			}
			setPlayer(null);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		manifestUrl,
		opts?.lowLatency,
		drm?.widevine,
		drm?.playready,
		JSON.stringify(drm?.headers),
	]);

	return { videoRef, player, error };
}
