// src/components/VideoPlayer.tsx
import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
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
	lowLatency?: boolean; // for LL-DASH
};

type LayoutCtx = { showMetrics: boolean };

export default function VideoPlayer({
	mpdUrl,
	drm,
	tracks,
	autoSelectFirstSubtitle,
	lowLatency,
}: Props) {
	// Read <Outlet context>; default to true (teaching HUD always visible).
	let showMetrics = true;
	try {
		const ctx = useOutletContext<LayoutCtx>();
		if (typeof ctx?.showMetrics === "boolean") showMetrics = ctx.showMetrics;
	} catch {
		// Rendered outside router/Outlet (tests, storybook) — keep default true.
	}

	const { videoRef, player, error } = useDashPlayer(mpdUrl, drm, {
		lowLatency,
	});

	// dash.js metrics (DASH path)
	const dashMetrics = useMetrics(player);

	// HTML5 metrics (MP4 or when no dash player attached)
	const isMp4 = /\.mp4($|\?)/i.test(mpdUrl);
	const html5Metrics = useHtml5Metrics(
		videoRef,
		showMetrics && (isMp4 || !player) // poll only when overlay shown
	);

	const overlayMetrics = player ? dashMetrics : html5Metrics;

	// Auto-show first side-loaded subtitle track (MP4/native only; DASH text is handled by dash.js)
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

			{showMetrics && (
				<MetricsOverlay
					metrics={overlayMetrics}
					info={{
						url: mpdUrl,
						drm: { widevine: !!drm?.widevine, playready: !!drm?.playready },
					}}
				/>
			)}

			{error ? <ErrorBanner message={String(error)} /> : null}
		</div>
	);
}
