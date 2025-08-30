// src/pages/HlsClear.tsx
import HLSVideoPlayer from "../components/HLSVideoPlayer";
import { ENV } from "../config/env";
export default function HlsClear() {
	const src = ENV.CLEAR_HLS;
	return (
		<>
			<h2>HLS — Clear</h2>
			<HLSVideoPlayer src={src} />
			<p style={{ opacity: 0.7, wordBreak: "break-all" }}>Source: {src}</p>
		</>
	);
}
