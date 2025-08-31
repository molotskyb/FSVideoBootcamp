import HLSVideoPlayer from "../components/HLSVideoPlayer";
import { ENV } from "../config/env";

export default function LowLatencyHls() {
	const src = ENV.LL_HLS || ENV.CLEAR_HLS; // fallback keeps page usable
	const configured = !!ENV.LL_HLS;
	return (
		<>
			<h2>Low-Latency HLS {configured ? "" : "(fallback to standard HLS)"}</h2>
			<HLSVideoPlayer src={src} lowLatencyMode />
			<p style={{ opacity: 0.7, wordBreak: "break-all" }}>
				Source: {src || "—"}
			</p>
			{!configured && (
				<p style={{ opacity: 0.8 }}>
					Set <code>VITE_LL_HLS</code> to a real LL-HLS endpoint to see reduced
					live delay.
				</p>
			)}
		</>
	);
}
