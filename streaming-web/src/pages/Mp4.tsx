// src/pages/Mp4.tsx
import { useCallback, useState } from "react";
import VideoPlayer from "../components/VideoPlayer";
import { ENV } from "../config/env";

const ALL_SOURCES = [ENV.MP4, ...ENV.MP4_FALLBACKS];

export default function Mp4() {
	const [srcIdx, setSrcIdx] = useState(0);
	const src = ALL_SOURCES[srcIdx];

	const handleError = useCallback(() => {
		setSrcIdx((i) => Math.min(i + 1, ALL_SOURCES.length - 1));
	}, []);

	return (
		<>
			<h2>Progressive MP4</h2>
			<VideoPlayer key={src} mpdUrl={src} onError={handleError} />
			<p style={{ opacity: 0.7, wordBreak: "break-all" }}>Source: {src}</p>
			{srcIdx > 0 && (
				<p style={{ opacity: 0.8, color: "orange" }}>
					Fell back to source {srcIdx + 1} of {ALL_SOURCES.length} (previous unavailable)
				</p>
			)}
			<p style={{ opacity: 0.8 }}>
				Note: wrapper bypasses dash.js for .mp4 (native playback).
			</p>
		</>
	);
}
