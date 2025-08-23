import { useEffect, useRef, useState } from "react";
import { createDashPlayer } from "../player/dash/createDashPlayer";
import type { DrmConfig } from "../player/adapter";
import { usePlayerStore } from "../state/usePlayerStore";

export function useDashPlayer(manifestUrl: string, drm?: DrmConfig) {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const [ready, setReady] = useState(false);
	const store = usePlayerStore();

	useEffect(() => {
		if (!videoRef.current) return;
		const player = createDashPlayer();
		(async () => {
			await player.init(videoRef.current!, drm);
			player.on("bitrateChanged", store.onBitrate);
			player.on("error", store.onError);
			await player.load(manifestUrl);
			setReady(true);
		})();
		return () => {
			player.destroy();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [manifestUrl]);

	return { videoRef, ready };
}
