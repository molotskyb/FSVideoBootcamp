import VideoPlayer from "../components/VideoPlayer";
import { ENV } from "../config/env";

export default function LowLatencyDash() {
	const src = ENV.LL_DASH || ENV.CLEAR_DASH;
	const configured = !!ENV.LL_DASH;
	return (
		<>
			<h2>
				Low-Latency DASH {configured ? "" : "(fallback to standard DASH)"}
			</h2>
			<VideoPlayer mpdUrl={src} lowLatency />
			<p style={{ opacity: 0.7, wordBreak: "break-all" }}>
				Source: {src || "—"}
			</p>
			{!configured && (
				<p style={{ opacity: 0.8 }}>
					Set <code>VITE_LL_DASH</code> to a real LL-DASH MPD to see reduced
					live delay.
				</p>
			)}
		</>
	);
}
