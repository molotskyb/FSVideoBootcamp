// src/hooks/useMetrics.ts
import { useEffect, useState } from "react";
import * as dashjs from "dashjs";

export type Metrics = {
	bitrateKbps: number;
	resolution: string; // e.g. "1920x1080"
	stalls: number;
	droppedFrames: number;
};

export function useMetrics(player?: dashjs.MediaPlayerClass | null): Metrics {
	const [metrics, setMetrics] = useState<Metrics>({
		bitrateKbps: 0,
		resolution: "-",
		stalls: 0,
		droppedFrames: 0,
	});

	useEffect(() => {
		if (!player) return;

		let mounted = true;

		const compute = () => {
			try {
				const dm = player.getDashMetrics?.();
				const da = player.getDashAdapter?.();

				// dropped frames
				const dropped = dm?.getCurrentDroppedFrames?.()?.droppedFrames ?? 0;

				// figure out current Representation to read bandwidth/size
				// 1) preferred: via current RepresentationSwitch + adapter
				const repSwitch = dm?.getCurrentRepresentationSwitch?.("video");
				const streamInfo = (
					player as dashjs.MediaPlayerClass & {
						getActiveStream?: () => {
							getStreamInfo?: () => { index?: number };
						};
					}
				)
					.getActiveStream?.()
					?.getStreamInfo?.();
				const periodIdx = streamInfo?.index ?? 0;

				let bandwidth: number | undefined;
				let width: number | undefined;
				let height: number | undefined;

				if (repSwitch && da?.getVoRepresentation && da?.getMediaInfoForType) {
					const mediaInfo = da.getMediaInfoForType(
						{ index: periodIdx },
						"video"
					);
					let reps: Representation[] | undefined;
					if (mediaInfo) {
						reps = da.getVoRepresentation(mediaInfo);
					}
					type Representation = {
						id: string;
						bandwidth?: number;
						width?: number;
						height?: number;
					};
					const rep = Array.isArray(reps)
						? reps.find((r: Representation) => r.id === repSwitch.to)
						: undefined;
					bandwidth = rep?.bandwidth;
					width = rep?.width;
					height = rep?.height;
				}

				// 2) fallback (older APIs or wrappers might have these):
				interface LegacyPlayer {
					getBitrateInfoListFor?: (
						type: string
					) => Array<{ bitrate?: number; width?: number; height?: number }>;
					getQualityFor?: (type: string) => number;
				}
				const legacyPlayer = player as dashjs.MediaPlayerClass & LegacyPlayer;
				if (
					!bandwidth &&
					legacyPlayer.getBitrateInfoListFor &&
					legacyPlayer.getQualityFor
				) {
					const q = legacyPlayer.getQualityFor("video");
					const list = legacyPlayer.getBitrateInfoListFor("video");
					const info = Array.isArray(list) ? list[q] : undefined;
					bandwidth = info?.bitrate;
					width = width ?? info?.width;
					height = height ?? info?.height;
				}

				// finalize
				const bitrateKbps = bandwidth ? Math.round(bandwidth / 1000) : 0;
				const resolution =
					width && height ? `${width}x${height}` : metrics.resolution || "-";

				if (!mounted) return;
				setMetrics((prev) => ({
					...prev,
					bitrateKbps,
					resolution,
					droppedFrames: dropped,
				}));
			} catch {
				/* ignore */
			}
		};

		const intervalId: number = window.setInterval(compute, 1000);

		const onQualityRendered = () => compute();
		const onStalled = () =>
			setMetrics((prev) => ({ ...prev, stalls: prev.stalls + 1 }));

		// listen for changes that impact quality
		player.on(
			dashjs.MediaPlayer.events.QUALITY_CHANGE_RENDERED,
			onQualityRendered
		);
		player.on(dashjs.MediaPlayer.events.PLAYBACK_STALLED, onStalled);
		player.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, compute);
		player.on(dashjs.MediaPlayer.events.PLAYBACK_STARTED, compute);

		// initial + periodic poll (for dropped frames etc.)
		compute();
		// intervalId is now declared as const above

		return () => {
			mounted = false;
			window.clearInterval(intervalId);
			player.off(
				dashjs.MediaPlayer.events.QUALITY_CHANGE_RENDERED,
				onQualityRendered
			);
			player.off(dashjs.MediaPlayer.events.PLAYBACK_STALLED, onStalled);
			player.off(dashjs.MediaPlayer.events.STREAM_INITIALIZED, compute);
			player.off(dashjs.MediaPlayer.events.PLAYBACK_STARTED, compute);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [player]);

	return metrics;
}
