// src/components/VideoPlayer.tsx
import { useEffect } from "react";
import { useDashPlayer } from "../hooks/useDashPlayer";
import { useMetrics } from "../hooks/useMetrics";
import { useHtml5Metrics } from "../hooks/useHtml5Metrics";
import MetricsOverlay from "./MetricsOverlay";
import ErrorBanner from "./ErrorBanner";
import "./videoFrame.css";

type TextTrackSource = {
	kind?: "subtitles" | "captions";
	src: string;
	srcLang?: string;
	label?: string;
	default?: boolean;
};

type Props = {
	mpdUrl: string; // can be .mpd or .mp4 (wrapper bypass)
	drm?: {
		widevine?: string;
		playready?: string;
		headers?: Record<string, string>;
	};
	tracks?: TextTrackSource[];
	autoSelectFirstSubtitle?: boolean;
	lowLatency?: boolean; // for LL-DASH if you add that lesson later
};

export default function VideoPlayer({
	mpdUrl,
	drm,
	tracks,
	autoSelectFirstSubtitle,
	lowLatency,
}: Props) {
	const { videoRef, player, error } = useDashPlayer(mpdUrl, drm, {
		lowLatency,
	});
	const dashMetrics = useMetrics(player);
	const isMp4 = /\.mp4($|\?)/i.test(mpdUrl);
	const html5Metrics = useHtml5Metrics(videoRef, isMp4 || !player);
	const overlayMetrics = player ? dashMetrics : html5Metrics;

	// Auto-show first subtitle track (works for MP4/side-loaded; DASH text is handled by dash.js)
	useEffect(() => {
		if (!autoSelectFirstSubtitle || !videoRef.current) return;
		const v = videoRef.current;
		const onLoaded = () => {
			for (const tt of Array.from(v.textTracks ?? [])) {
				if (tt.kind === "subtitles" || tt.kind === "captions") {
					tt.mode = "showing";
					break;
				}
			}
		};
		v.addEventListener("loadedmetadata", onLoaded);
		return () => v.removeEventListener("loadedmetadata", onLoaded);
	}, [autoSelectFirstSubtitle, videoRef]);

	return (
		<div className="vf-frame">
			<video ref={videoRef} className="vf-video" controls playsInline>
				{tracks?.map((t, i) => (
					<track
						key={i}
						kind={t.kind ?? "subtitles"}
						src={t.src}
						srcLang={t.srcLang}
						label={t.label}
						default={t.default}
					/>
				))}
			</video>

			<MetricsOverlay
				metrics={overlayMetrics}
				info={{
					url: mpdUrl,
					drm: { widevine: !!drm?.widevine, playready: !!drm?.playready },
				}}
			/>
			{error ? <ErrorBanner message={String(error)} /> : null}
		</div>
	);
}
