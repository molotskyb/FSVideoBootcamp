// src/hooks/useHtml5Metrics.ts
import { RefObject, useEffect, useState } from "react";
export type Html5Metrics = {
	bitrateKbps: number;
	resolution: string;
	stalls: number;
	droppedFrames: number;
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
	});

	useEffect(() => {
		if (!enabled) return;
		const v = videoRef.current;
		if (!v) return;
		let mounted = true;
		let t: number | null = null;

		const compute = () => {
			if (!mounted) return;
			const w = v.videoWidth || 0,
				h = v.videoHeight || 0;
			let dropped = 0;
			const anyV = v as any;
			if (typeof anyV.getVideoPlaybackQuality === "function")
				dropped = anyV.getVideoPlaybackQuality()?.droppedVideoFrames ?? 0;
			else if (typeof anyV.webkitDroppedFrameCount === "number")
				dropped = anyV.webkitDroppedFrameCount || 0;
			setM((prev) => ({
				...prev,
				resolution: w && h ? `${w}x${h}` : prev.resolution,
				droppedFrames: dropped,
			}));
		};
		const bump = () => setM((prev) => ({ ...prev, stalls: prev.stalls + 1 }));

		v.addEventListener("waiting", bump);
		v.addEventListener("stalled", bump);
		v.addEventListener("loadedmetadata", compute);
		compute();
		t = window.setInterval(compute, 1000) as unknown as number;

		return () => {
			mounted = false;
			if (t) window.clearInterval(t);
			v.removeEventListener("waiting", bump);
			v.removeEventListener("stalled", bump);
			v.removeEventListener("loadedmetadata", compute);
		};
	}, [videoRef, enabled]);

	return m;
}
