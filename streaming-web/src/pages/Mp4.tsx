// src/pages/Mp4.tsx
import VideoPlayer from "../components/VideoPlayer";
import { ENV } from "../config/env";
export default function Mp4() {
	const src = ENV.MP4;
	return (
		<>
			<h2>Progressive MP4</h2>
			<VideoPlayer mpdUrl={src} />
			<p style={{ opacity: 0.7, wordBreak: "break-all" }}>Source: {src}</p>
			<p style={{ opacity: 0.8 }}>
				Note: wrapper bypasses dash.js for .mp4 (native playback).
			</p>
		</>
	);
}
