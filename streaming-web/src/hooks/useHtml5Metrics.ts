// src/hooks/useHtml5Metrics.ts
import type { RefObject } from "react";
import { useEffect, useState } from "react";

export type Html5Metrics = {
	bitrateKbps: number;
	resolution: string;
	stalls: number;
	droppedFrames: number;
	bufferLevel?: number;
	latency?: number; // seconds; undefined on VOD
	isLive?: boolean; // ✅
};

export function useHtml5Metrics(
	videoRef: RefObject<HTMLVideoElement | null>,
	enabled = true
) {
	const [m, setM] = useState<Html5Metrics>({
		bitrateKbps: 0,
		resolution: "-",
		stalls: 0,
		droppedFrames: 0,
		bufferLevel: undefined,
		latency: undefined,
		isLive: undefined,
	});

	useEffect(() => {
		if (!enabled) return;
		const v = videoRef.current;
		if (!v) return;

		let mounted = true;
		let t: number | null = null;

		const compute = () => {
			if (!mounted) return;

			const w = v.videoWidth || 0;
			const h = v.videoHeight || 0;

			// dropped frames
			let dropped = 0;
			const anyV = v as any;
			if (typeof anyV.getVideoPlaybackQuality === "function") {
				dropped = anyV.getVideoPlaybackQuality()?.droppedVideoFrames ?? 0;
			} else if (typeof anyV.webkitDroppedFrameCount === "number") {
				dropped = anyV.webkitDroppedFrameCount || 0;
			}

			// buffer level (seconds ahead)
			let bufferLevel: number | undefined = undefined;
			if (v.buffered?.length) {
				const end = v.buffered.end(v.buffered.length - 1);
				bufferLevel = Math.max(0, end - v.currentTime);
			}

			// live detection + latency
			// Heuristics:
			//  - duration === Infinity (typical live)
			//  - OR seekable window exists and keeps moving
			let isLive = v.duration === Infinity;
			let latency: number | undefined = undefined;
			if (v.seekable?.length) {
				const liveEdge = v.seekable.end(v.seekable.length - 1);
				// Treat as live if liveEdge advances and duration is Infinity
				if (v.duration === Infinity) isLive = true;
				if (isLive) latency = Math.max(0, liveEdge - v.currentTime);
			}

			setM((prev) => ({
				...prev,
				resolution: w && h ? `${w}x${h}` : prev.resolution,
				droppedFrames: dropped,
				bufferLevel,
				latency: isLive ? latency : undefined, // undefined on VOD
				isLive,
			}));
		};

		const onWaiting = () =>
			setM((prev) => ({ ...prev, stalls: prev.stalls + 1 }));
		const onLoaded = () => compute();

		v.addEventListener("waiting", onWaiting);
		v.addEventListener("stalled", onWaiting);
		v.addEventListener("loadedmetadata", onLoaded);

		compute();
		t = window.setInterval(compute, 1000) as unknown as number;

		return () => {
			mounted = false;
			if (t) window.clearInterval(t);
			v.removeEventListener("waiting", onWaiting);
			v.removeEventListener("stalled", onWaiting);
			v.removeEventListener("loadedmetadata", onLoaded);
		};
	}, [videoRef, enabled]);

	return m;
}
