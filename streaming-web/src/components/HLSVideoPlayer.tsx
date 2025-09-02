// src/components/HLSVideoPlayer.tsx
import { useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import Hls from "hls.js";
import { useHtml5Metrics } from "../hooks/useHtml5Metrics";
import MetricsOverlay from "./MetricsOverlay";

type Ctx = { showMetrics: boolean };

export default function HLSVideoPlayer({
	src,
	lowLatencyMode,
}: {
	src: string;
	lowLatencyMode?: boolean;
}) {
	// ✅ safe read with default
	let showMetrics = false;
	try {
		const ctx = useOutletContext<Ctx>();
		showMetrics = !!ctx?.showMetrics;
	} catch {
		// rendered outside <Outlet> — keep default false
	}

	const ref = useRef<HTMLVideoElement | null>(null);
	const metrics = useHtml5Metrics(ref, true);

	useEffect(() => {
		const video = ref.current!;
		if (!video) return;

		if (video.canPlayType("application/vnd.apple.mpegurl")) {
			video.src = src;
			return;
		}
		if (Hls.isSupported()) {
			const hls = new Hls({ lowLatencyMode: !!lowLatencyMode });
			hls.loadSource(src);
			hls.attachMedia(video);
			return () => hls.destroy();
		}
		video.src = src;
	}, [src, lowLatencyMode]);

	return (
		<div style={{ position: "relative" }}>
			<video
				ref={ref}
				controls
				playsInline
				style={{ width: "100%", background: "#000", aspectRatio: "16/9" }}
			/>
			{showMetrics && <MetricsOverlay metrics={metrics} />}
		</div>
	);
}
