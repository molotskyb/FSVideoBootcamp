// src/pages/CaptionsDash.tsx  (WebVTT in DASH manifest)
import VideoPlayer from "../components/VideoPlayer";
import { ENV } from "../config/env";
export default function CaptionsDash() {
	const src = ENV.DASH_CAPTIONS || ENV.CLEAR_DASH;
	return (
		<>
			<h2>Captions — DASH (WebVTT)</h2>
			<VideoPlayer mpdUrl={src} autoSelectFirstSubtitle />
			<p style={{ opacity: 0.7, wordBreak: "break-all" }}>Source: {src}</p>
		</>
	);
}
