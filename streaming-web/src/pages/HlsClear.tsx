// src/pages/HlsClear.tsx
import HLSVideoPlayer from "../components/HLSVideoPlayer";
import { ENV } from "../config/env";
export default function HlsClear() {
	const src = ENV.CLEAR_HLS;
	const abrTuning = {
		// Trim the buffer/throughput defaults so the player reacts quickly to throttling.
		maxBufferLength: 10,
		abrEwmaDefaultEstimate: 1_000_000,
		capLevelToPlayerSize: true,
		startLevel: 0,
	};
	return (
		<>
			<h2>HLS — Clear</h2>
			<HLSVideoPlayer src={src} hlsConfig={abrTuning} />
			<p style={{ opacity: 0.7, wordBreak: "break-all" }}>Source: {src}</p>
		</>
	);
}
