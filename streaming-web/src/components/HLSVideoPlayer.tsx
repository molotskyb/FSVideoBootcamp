// src/components/HLSVideoPlayer.tsx
import { useEffect, useRef } from "react";
import Hls from "hls.js";

type Props = { src: string };

export default function HLSVideoPlayer({ src }: Props) {
	const ref = useRef<HTMLVideoElement | null>(null);

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
		<video
			ref={ref}
			controls
			playsInline
			style={{ width: 960, background: "#000", aspectRatio: "16/9", display: "block", margin: "0 auto" }}
		/>
	);
}
