import VideoPlayer from "../components/VideoPlayer";
import { ENV } from "../config/env";

const drm = (() => {
	const widevine = (ENV.WV || "").trim();
	const playready = (ENV.PR || "").trim();
	const headers =
		ENV.DRM_HEADERS && Object.keys(ENV.DRM_HEADERS).length
			? ENV.DRM_HEADERS
			: undefined;
	if (!widevine && !playready) return undefined;
	return { widevine, playready, headers };
})();

export default function DashDrm() {
	return (
		<>
			<h2>DASH — DRM (WV/PR)</h2>
			<VideoPlayer mpdUrl={ENV.DRM_DASH || ENV.MPD} drm={drm} />
			<p style={{ opacity: 0.7, wordBreak: "break-all" }}>
				Source: {ENV.DRM_DASH || ENV.MPD}
			</p>
			{!drm && (
				<p style={{ color: "#c66" }}>
					No license URLs configured — this will not play protected content.
				</p>
			)}
		</>
	);
}
