// src/components/HLSVideoPlayer.tsx
import { useEffect, useRef } from "react";
import MetricsOverlay from "./MetricsOverlay";
import { useHtml5Metrics } from "../hooks/useHtml5Metrics";
import "./videoFrame.css";
import Hls from "hls.js";

type Props = { src: string };

export default function HLSVideoPlayer({ src }: Props) {
	const ref = useRef<HTMLVideoElement | null>(null);
    const metrics = useHtml5Metrics(ref, true);

	useEffect(() => {
		const video = ref.current!;
		if (!video) return;

		if (video.canPlayType("application/vnd.apple.mpegurl")) {
			video.src = src; // Safari/iOS native HLS
			return;
		}

		if (Hls.isSupported()) {
			const hls = new Hls({ lowLatencyMode: false });
			hls.loadSource(src);
			hls.attachMedia(video);
			return () => hls.destroy();
		}

		video.src = src; // ancient fallback
	}, [src]);

	return (
		<div className="vf-frame">
			<video ref={ref} className="vf-video" controls playsInline />
			<MetricsOverlay metrics={metrics} info={{ url: src }} />
		</div>
	);
}
