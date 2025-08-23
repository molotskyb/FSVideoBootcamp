import { useRef } from "react";
import { useDashPlayer } from "../hooks/useDashPlayer";
import MetricsOverlay from "./MetricsOverlay";
import ErrorBanner from "./ErrorBanner";

type Props = {
	mpdUrl: string;
	drm?: {
		widevine?: string;
		playready?: string;
		headers?: Record<string, string>;
	};
};

export default function VideoPlayer({ mpdUrl, drm }: Props) {
	const { videoRef } = useDashPlayer(mpdUrl, drm);
	const outer = useRef<HTMLDivElement | null>(null);
	return (
		<div ref={outer} style={{ position: "relative" }}>
			<video
				ref={videoRef}
				controls
				playsInline
				style={{
					width: "100%",
					background: "#000",
					height: "56.25vw",
					maxHeight: "65vh",
				}}
			/>
			<MetricsOverlay />
			<ErrorBanner />
		</div>
	);
}
