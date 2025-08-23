import { useEffect, useState } from "react";
import * as dashjs from "dashjs";

export interface Metrics {
	bitrateKbps: number;
	resolution: string;
	stalls: number;
	droppedFrames: number;
}

export function useMetrics(player?: dashjs.MediaPlayerClass) {
	const [metrics, setMetrics] = useState<Metrics>({
		bitrateKbps: 0,
		resolution: "-",
		stalls: 0,
		droppedFrames: 0,
	});

	useEffect(() => {
		if (!player) return;

		const update = () => {
			const bitrate = player.getBitrateInfoListFor("video")?.[0]?.bitrate || 0;
			const quality = player.getQualityFor("video");
			const rep = player.getCurrentTrackFor("video")?.bitrateList?.[quality];
			const resolution = rep ? `${rep.width}x${rep.height}` : "-";

			setMetrics((prev) => ({
				...prev,
				bitrateKbps: Math.round(bitrate / 1000),
				resolution,
				droppedFrames:
					player.getDashMetrics()?.getCurrentDroppedFrames("video")
						?.droppedFrames || 0,
			}));
		};

		const onStall = () =>
			setMetrics((prev) => ({ ...prev, stalls: prev.stalls + 1 }));

		player.on(dashjs.MediaPlayer.events.QUALITY_CHANGE_RENDERED, update);
		player.on(dashjs.MediaPlayer.events.PLAYBACK_STALLED, onStall);

		return () => {
			player.off(dashjs.MediaPlayer.events.QUALITY_CHANGE_RENDERED, update);
			player.off(dashjs.MediaPlayer.events.PLAYBACK_STALLED, onStall);
		};
	}, [player]);

	return metrics;
}
