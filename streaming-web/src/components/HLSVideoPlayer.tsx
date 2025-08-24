import { useEffect, useRef } from "react";
import Hls from "hls.js";

type Props = { src: string };

export default function HlsVideoPlayer({ src }: Props) {
	const ref = useRef<HTMLVideoElement | null>(null);

	useEffect(() => {
		const video = ref.current!;
		if (!video) return;

		if (video.canPlayType("application/vnd.apple.mpegurl")) {
			video.src = src; // Safari
			return;
		}

		if (Hls.isSupported()) {
			const hls = new Hls({ lowLatencyMode: false });
			hls.loadSource(src);
			hls.attachMedia(video);
			return () => hls.destroy();
		}

		// Fallback
		video.src = src;
	}, [src]);

	return (
		<video
			ref={ref}
			controls
			playsInline
			style={{ width: "100%", background: "#000", aspectRatio: "16/9" }}
		/>
	);
}
