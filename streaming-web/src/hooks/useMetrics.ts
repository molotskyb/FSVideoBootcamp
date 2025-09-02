// src/hooks/useMetrics.ts
import { useEffect, useState } from "react";
import * as dashjs from "dashjs";

export type Metrics = {
	bitrateKbps: number;
	resolution: string; // e.g. "1920x1080"
	stalls: number;
	droppedFrames: number;
	qualityIndex?: number; // ABR index (0 = lowest)
	bufferLevel?: number; // seconds buffered
	latency?: number; // seconds behind live edge
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

		const compute = () => {
			try {
				const dm = player.getDashMetrics?.();
				const da = player.getDashAdapter?.();

				// dropped frames
				const dropped = dm?.getCurrentDroppedFrames?.()?.droppedFrames ?? 0;

				// buffer / latency (optional)
				const bufferLevel = dm?.getCurrentBufferLevel?.("video") ?? undefined;

				const isLive =
					(player as any).isDynamic?.() ??
					(player as any).getActiveStream?.()?.getStreamInfo?.()?.manifestInfo
						?.isDynamic ??
					false;

				let latency: number | undefined = undefined;
				if (isLive) {
					const dmAny = dm as any;
					if (dmAny && typeof dmAny.getCurrentLiveLatency === "function") {
						const l = dmAny.getCurrentLiveLatency();
						latency = Number.isFinite(l) ? l : undefined;
					}
				}

				// current representation info
				const streamInfo = (player as any)
					.getActiveStream?.()
					?.getStreamInfo?.();
				const periodIdx = streamInfo?.index ?? 0;
				const repSwitch = dm?.getCurrentRepresentationSwitch?.("video"); // {to: repId}

				let bandwidth: number | undefined;
				let width: number | undefined;
				let height: number | undefined;

				// Preferred (modern): adapter lookups by rep id
				if (repSwitch && da) {
					const rep = (da as any).getRepresentationFor?.(
						"video",
						(repSwitch as any).to,
						periodIdx
					);
					if (rep) {
						bandwidth = rep.bandwidth;
						width = rep.width;
						height = rep.height;
					}
					// Some typings expose helpers with different names; try bandwidth specifically:
					if (!bandwidth && (da as any).getBandwidthForRepresentation) {
						bandwidth = (da as any).getBandwidthForRepresentation(
							(repSwitch as any).to,
							periodIdx
						);
					}
				}

				// Legacy fallback
				const legacy = player as unknown as {
					getQualityFor?: (t: string) => number;
					getBitrateInfoListFor?: (
						t: string
					) => Array<{ bitrate?: number; width?: number; height?: number }>;
				};

				let qualityIndex: number | undefined;
				if (typeof legacy.getQualityFor === "function") {
					qualityIndex = legacy.getQualityFor("video");
					if (
						(!bandwidth || !width || !height) &&
						typeof legacy.getBitrateInfoListFor === "function"
					) {
						const list = legacy.getBitrateInfoListFor("video");
						const info = Array.isArray(list) ? list[qualityIndex] : undefined;
						bandwidth = bandwidth ?? info?.bitrate;
						width = width ?? info?.width;
						height = height ?? info?.height;
					}
				}

				// Finalize with hard numeric defaults
				const bitrateKbps = bandwidth ? Math.round(bandwidth / 1000) : 0;
				const resolution = width && height ? `${width}x${height}` : "-";

				setMetrics((prev) => ({
					...prev,
					bitrateKbps, // ✅ always a number
					resolution: resolution || prev.resolution || "-",
					droppedFrames: dropped,
					bufferLevel,
					latency,
					qualityIndex,
					isLive,
				}));
			} catch {
				// ignore in demos
			}
		};

		const onQualityRendered = () => compute();
		const onStalled = () =>
			setMetrics((prev) => ({ ...prev, stalls: prev.stalls + 1 }));

		compute();
		const id = window.setInterval(compute, 1000);

		player.on(
			dashjs.MediaPlayer.events.QUALITY_CHANGE_RENDERED,
			onQualityRendered
		);
		player.on(dashjs.MediaPlayer.events.PLAYBACK_STALLED, onStalled);
		player.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, compute);
		player.on(dashjs.MediaPlayer.events.PLAYBACK_STARTED, compute);

		return () => {
			window.clearInterval(id);
			player.off(
				dashjs.MediaPlayer.events.QUALITY_CHANGE_RENDERED,
				onQualityRendered
			);
			player.off(dashjs.MediaPlayer.events.PLAYBACK_STALLED, onStalled);
			player.off(dashjs.MediaPlayer.events.STREAM_INITIALIZED, compute);
			player.off(dashjs.MediaPlayer.events.PLAYBACK_STARTED, compute);
		};
	}, [player]);

	return metrics;
}
