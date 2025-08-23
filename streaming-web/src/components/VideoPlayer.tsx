import { useRef } from "react";
import { useDashPlayer } from "../hooks/useDashPlayer";
import { useMetrics } from "../hooks/useMetrics";
import MetricsOverlay from "./MetricsOverlay";
import ErrorBanner from "./ErrorBanner";
import "./videoFrame.css"; // ⬅️ new CSS file below

type Props = {
	mpdUrl: string;
	drm?: {
		widevine?: string;
		playready?: string;
		headers?: Record<string, string>;
	};
};

export default function VideoPlayer({ mpdUrl, drm }: Props) {
	const { videoRef, player, error } = useDashPlayer(mpdUrl, drm);
	const metrics = useMetrics(player);

	const outerRef = useRef<HTMLDivElement | null>(null);

	return (
		<div ref={outerRef} className="vf-frame">
			<video ref={videoRef} className="vf-video" controls playsInline />
			{player && (
				<MetricsOverlay
					metrics={metrics}
					info={{
						url: mpdUrl,
						drm: { widevine: !!drm?.widevine, playready: !!drm?.playready },
					}}
				/>
			)}
			{error && <ErrorBanner message={String(error)} />}
		</div>
	);
}
