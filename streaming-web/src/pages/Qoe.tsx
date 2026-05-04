import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import * as dashjs from "dashjs";

type SourceKey = "hls" | "dash" | "hls_canary" | "dash_canary";
type SourceConfig = {
	label: string;
	url: string;
	engine: "hls" | "dash";
};

const base = import.meta.env.BASE_URL.replace(/\/$/, "");

const SOURCES: Record<SourceKey, SourceConfig> = {
	hls: {
		label: "HLS",
		url: `${base}/media/hls_sp/master.m3u8`,
		engine: "hls",
	},
	dash: {
		label: "DASH",
		url: `${base}/media/dash_sp/stream.mpd`,
		engine: "dash",
	},
	hls_canary: {
		label: "HLS Canary 480p",
		url: `${base}/media/canary/hls/master.m3u8`,
		engine: "hls",
	},
	dash_canary: {
		label: "DASH Canary 480p",
		url: `${base}/media/canary/dash/stream.mpd`,
		engine: "dash",
	},
};

function logQoe(type: string, data: Record<string, unknown> = {}) {
	console.log(JSON.stringify({ ts: Date.now(), type, ...data }));
}

export default function Qoe() {
	const [sourceKey, setSourceKey] = useState<SourceKey>("hls");
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const hlsRef = useRef<Hls | null>(null);
	const dashRef = useRef<any>(null);
	const playClickAtRef = useRef(0);
	const startupLoggedRef = useRef(false);
	const stallStartAtRef = useRef<number | null>(null);
	const totalStallMsRef = useRef(0);
	const stallCountRef = useRef(0);
	const frameIntervalRef = useRef<number | null>(null);

	function clearFrameLogging() {
		if (frameIntervalRef.current !== null) {
			window.clearInterval(frameIntervalRef.current);
			frameIntervalRef.current = null;
		}
	}

	function destroyPlayers() {
		clearFrameLogging();

		if (hlsRef.current) {
			hlsRef.current.destroy();
			hlsRef.current = null;
		}

		if (dashRef.current) {
			dashRef.current.reset();
			dashRef.current = null;
		}

		const video = videoRef.current;
		if (video) {
			video.pause();
			video.removeAttribute("src");
			video.load();
		}

		playClickAtRef.current = 0;
		startupLoggedRef.current = false;
		stallStartAtRef.current = null;
		totalStallMsRef.current = 0;
		stallCountRef.current = 0;
	}

	function startFrameLogging() {
		const video = videoRef.current;
		if (!video || typeof video.getVideoPlaybackQuality !== "function") {
			return;
		}

		frameIntervalRef.current = window.setInterval(() => {
			const currentVideo = videoRef.current;
			if (
				!currentVideo ||
				typeof currentVideo.getVideoPlaybackQuality !== "function"
			) {
				return;
			}

			const quality = currentVideo.getVideoPlaybackQuality();
			logQoe("qoe.frames", {
				dropped_frames: quality.droppedVideoFrames,
				total_frames: quality.totalVideoFrames,
			});
		}, 4000);
	}

	function playVideo() {
		const video = videoRef.current;
		if (!video) {
			return;
		}

		const result = video.play();
		if (result && typeof result.catch === "function") {
			result.catch((error: unknown) => {
				logQoe("qoe.error", {
					message: error instanceof Error ? error.message : "play() failed",
				});
			});
		}
	}

	function bootHls(src: string) {
		const video = videoRef.current;
		if (!video) {
			return;
		}

		if (Hls.isSupported()) {
			const hls = new Hls();
			hlsRef.current = hls;

			hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
				logQoe("qoe.bitrate", {
					format: "hls",
					level: data.level,
				});
			});

			hls.on(Hls.Events.ERROR, (_, data) => {
				if (!data.fatal) {
					return;
				}

				logQoe("qoe.error", {
					message: data.details || "HLS fatal error",
				});
			});

			hls.on(Hls.Events.MANIFEST_PARSED, () => {
				playVideo();
			});

			hls.loadSource(src);
			hls.attachMedia(video);
			return;
		}

		if (video.canPlayType("application/vnd.apple.mpegurl")) {
			video.src = src;
			playVideo();
			return;
		}

		logQoe("qoe.error", {
			message: "HLS is not supported in this browser",
		});
	}

	function bootDash(src: string) {
		const video = videoRef.current;
		if (!video || !dashjs.MediaPlayer) {
			logQoe("qoe.error", {
				message: "dash.js failed to load",
			});
			return;
		}

		const player = dashjs.MediaPlayer().create();
		dashRef.current = player;

		player.on(
			dashjs.MediaPlayer.events.QUALITY_CHANGE_RENDERED,
			(data: any) => {
				const representation = data?.newRepresentation
					? data.newRepresentation.id ||
						data.newRepresentation.absoluteIndex ||
						null
					: typeof data?.newQuality !== "undefined"
						? data.newQuality
						: null;

				logQoe("qoe.bitrate", {
					format: "dash",
					representation,
					media_type: data?.mediaType ?? null,
				});
			},
		);

		player.on(dashjs.MediaPlayer.events.ERROR, (data: any) => {
			logQoe("qoe.error", {
				message:
					data?.error?.message ||
					(data?.event ? String(data.event) : "dash.js error"),
			});
		});

		player.initialize(video, src, true);
	}

	function handlePlay() {
		const source = SOURCES[sourceKey];

		destroyPlayers();
		playClickAtRef.current = performance.now();
		startFrameLogging();

		if (source.engine === "hls") {
			bootHls(source.url);
			return;
		}

		bootDash(source.url);
	}

	function handleLoadedData() {
		if (startupLoggedRef.current || !playClickAtRef.current) {
			return;
		}

		startupLoggedRef.current = true;
		logQoe("qoe.startup", {
			ttff_ms: Math.round(performance.now() - playClickAtRef.current),
		});
	}

	function handleWaiting() {
		if (stallStartAtRef.current === null) {
			stallStartAtRef.current = performance.now();
		}
	}

	function handlePlaying() {
		if (stallStartAtRef.current === null) {
			return;
		}

		const stallMs = Math.round(performance.now() - stallStartAtRef.current);
		stallStartAtRef.current = null;
		totalStallMsRef.current += stallMs;
		stallCountRef.current += 1;

		logQoe("qoe.stall.end", {
			stall_ms: stallMs,
			total_stall_ms: totalStallMsRef.current,
			count: stallCountRef.current,
		});
	}

	function handleVideoError() {
		const error = videoRef.current?.error;
		logQoe("qoe.error", {
			message:
				error?.message ||
				(error ? `MediaError code ${error.code}` : "Unknown video error"),
		});
	}

	useEffect(() => {
		return () => {
			clearFrameLogging();
			hlsRef.current?.destroy();
			dashRef.current?.reset();
		};
	}, []);

	return (
		<>
			<h2>QoE</h2>
			<p style={{ opacity: 0.8 }}>
				Measure startup delay, stalls, bitrate switches, errors, and dropped
				frames for HLS and DASH playback.
			</p>
			<div
				style={{
					display: "flex",
					gap: 12,
					alignItems: "center",
					flexWrap: "wrap",
					marginBottom: 16,
				}}
			>
				<label>
					Format{" "}
					<select
						value={sourceKey}
						onChange={(event) => setSourceKey(event.target.value as SourceKey)}
					>
						{Object.entries(SOURCES).map(([key, source]) => (
							<option key={key} value={key}>
								{source.label}
							</option>
						))}
					</select>
				</label>
				<button onClick={handlePlay}>Play</button>
			</div>
			<video
				ref={videoRef}
				controls
				playsInline
				onLoadedData={handleLoadedData}
				onWaiting={handleWaiting}
				onPlaying={handlePlaying}
				onError={handleVideoError}
				style={{
					width: "100%",
					maxWidth: 960,
					background: "#000",
					display: "block",
				}}
			/>
			<p style={{ color: "red" }}>Open DevTools console to inspect QoE logs</p>
		</>
	);
}
