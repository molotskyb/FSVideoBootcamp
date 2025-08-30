// src/pages/DashDrm.tsx
import VideoPlayer from "../components/VideoPlayer";
import { ENV } from "../config/env";
export default function DashDrm() {
	const hasWV = !!ENV.WV,
		hasPR = !!ENV.PR;
	const drm =
		!hasWV && !hasPR
			? undefined
			: {
					widevine: hasWV ? ENV.WV : undefined,
					playready: hasPR ? ENV.PR : undefined,
					headers: ENV.DRM_HEADERS,
			  };
	const src = ENV.DRM_DASH || ENV.CLEAR_DASH;
	return (
		<>
			<h2>DASH — DRM (WV/PR)</h2>
			<VideoPlayer mpdUrl={src} drm={drm} />
			<p style={{ opacity: 0.7, wordBreak: "break-all" }}>Source: {src}</p>
			{!drm && (
				<p style={{ color: "#c66" }}>
					Set <code>VITE_WV</code> and/or <code>VITE_PR</code>.
				</p>
			)}
		</>
	);
}
