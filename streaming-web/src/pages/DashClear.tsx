// src/pages/DashClear.tsx
import VideoPlayer from "../components/VideoPlayer";
import { ENV } from "../config/env";
export default function DashClear() {
	const src = ENV.CLEAR_DASH;
	return (
		<>
			<h2>DASH — Clear</h2>
			<VideoPlayer mpdUrl={src} />
			<p style={{ opacity: 0.7, wordBreak: "break-all" }}>Source: {src}</p>
		</>
	);
}
