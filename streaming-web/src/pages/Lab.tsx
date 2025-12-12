// src/pages/Lab.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import * as dashjs from "dashjs";

type Src = { label: string; type: "mp4" | "hls" | "dash"; url: string };
type Cap = {
	label: string;
	url: string | null;
	lang?: string;
	kind?: "subtitles" | "captions";
};
type ThumbCue = { start: number; end: number; file: string };

const THUMBS_VTT_URL = "/media/thumbs_vtt/thumbs.vtt";
let thumbsPromise: Promise<ThumbCue[] | null> | null = null;
const THUMBS_PRESET_LABEL = "Thumbnails Demo";

const PRESETS: Src[] = [
	{ label: "MP4 sample", type: "mp4", url: "/assets/sample.mp4" },
	{ label: "MP4 output", type: "mp4", url: "/media/output.mp4" },
	{ label: "HLS CMAF", type: "hls", url: "/media/hls/master.m3u8" },
	{ label: "DASH CMAF", type: "dash", url: "/media/dash/stream.mpd" },
	{ label: "HLS (Packager)", type: "hls", url: "/media/hls_sp/master.m3u8" },
	{ label: "DASH (Packager)", type: "dash", url: "/media/dash_sp/stream.mpd" },
	{ label: "CRF=23", type: "mp4", url: "/media/crf/crf23.mp4" },
	{ label: "CBR 2M", type: "mp4", url: "/media/cbr/cbr_2M.mp4" },
	{ label: "VBR 2-pass", type: "mp4", url: "/media/vbr/vbr_2pass_2M.mp4" },
	{ label: "Preset — Ultrafast", type: "mp4", url: "/media/presets/ultrafast.mp4" },
	{ label: "Preset — Slow", type: "mp4", url: "/media/presets/slow.mp4" },
	{ label: "Codec — HEVC (5s)", type: "mp4", url: "/media/codecs/hevc_5s.mp4" },
	{ label: "Codec — AV1 (5s)", type: "mp4", url: "/media/codecs/av1_5s.mp4" },
	{ label: "Audio — AAC (m4a)", type: "mp4", url: "/media/audio/sample_aac128.m4a" },
	{ label: "Audio — AAC (mp4)", type: "mp4", url: "/media/audio/sample_aac128.mp4" },
	{ label: "Ladder 240p", type: "mp4", url: "/media/ladder/p240.mp4" },
	{ label: "Ladder 360p", type: "mp4", url: "/media/ladder/p360.mp4" },
	{ label: "Ladder 480p", type: "mp4", url: "/media/ladder/p480.mp4" },
	{ label: "Ladder 720p", type: "mp4", url: "/media/ladder/p720.mp4" },
	{ label: "Ladder 1080p", type: "mp4", url: "/media/ladder/p1080.mp4" },
	{ label: "HLS 2s", type: "hls", url: "/media/hls2s/master.m3u8" },
	{ label: "HLS 6s", type: "hls", url: "/media/hls6s/master.m3u8" },
	{ label: THUMBS_PRESET_LABEL, type: "mp4", url: "/media/output.mp4" },
];

const CAPTIONS: Cap[] = [
	{ label: "None", url: null },
	{
		label: "English (VTT)",
		url: "/media/captions/en.vtt",
		lang: "en",
		kind: "subtitles",
	},
];

function loadThumbCues(): Promise<ThumbCue[] | null> {
	if (!thumbsPromise) {
		thumbsPromise = (async () => {
			try {
				const res = await fetch(THUMBS_VTT_URL);
				if (!res.ok) return null;
				const text = await res.text();
				const cues: ThumbCue[] = [];
				for (const block of text.split(/\n\s*\n/)) {
					const lines = block.trim().split("\n");
					if (lines.length < 2) continue;
					const timing = lines[0];
					const file = lines[lines.length - 1]?.trim();
					if (!file) continue;
					const match =
						timing.match(
							/(\d+):(\d+):(\d+(?:\.\d+)?)\s+-->\s+(\d+):(\d+):(\d+(?:\.\d+)?)/
						);
					if (!match) continue;
					const start =
						Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
					const end =
						Number(match[4]) * 3600 + Number(match[5]) * 60 + Number(match[6]);
					cues.push({ start, end, file });
				}
				return cues;
			} catch {
				return null;
			}
		})();
	}
	return thumbsPromise;
}

function useThumbCues(enabled: boolean) {
	const [cues, setCues] = useState<ThumbCue[] | null>(null);
	useEffect(() => {
		let active = true;
		if (!enabled) {
			setCues(null);
			return () => {
				active = false;
			};
		}
		loadThumbCues().then((data) => {
			if (active) setCues(data);
		});
		return () => {
			active = false;
		};
	}, [enabled]);
	return cues;
}

async function headSize(url: string): Promise<number | null> {
	try {
		const r = await fetch(url, { method: "HEAD" });
		const v = r.headers.get("content-length");
		return v ? parseInt(v, 10) : null;
	} catch {
		return null;
	}
}

function Player({
	src,
	caption,
	showThumbPreview,
}: {
	src: Src;
	caption: Cap;
	showThumbPreview?: boolean;
}) {
	const ref = useRef<HTMLVideoElement>(null);
	const [size, setSize] = useState<number | null>(null);
	const [avgKbps, setAvgKbps] = useState<number | null>(null);
	const [bwKbps, setBwKbps] = useState<number | null>(null);
	const [level, setLevel] = useState<string>("");
	const thumbCues = useThumbCues(!!showThumbPreview);
	const [thumbUrl, setThumbUrl] = useState<string | null>(null);

	useEffect(() => {
		setSize(null);
		setAvgKbps(null);
		setBwKbps(null);
		setLevel("");
	}, [src.url]);

	useEffect(() => {
		let hls: Hls | undefined;
		let dash: dashjs.MediaPlayerClass | undefined;
		const el = ref.current!;
		const onMeta = async () => {
			if (src.type === "mp4") {
				const sz = await headSize(src.url);
				setSize(sz);
				if (sz && el.duration && isFinite(el.duration)) {
					setAvgKbps(Math.round((sz * 8) / el.duration / 1000));
				}
			}
		};
		if (src.type === "hls") {
			if (el.canPlayType("application/vnd.apple.mpegurl")) {
				el.src = src.url;
			} else if (Hls.isSupported()) {
				hls = new Hls({ enableWorker: true });
				hls.on(Hls.Events.MANIFEST_PARSED, () => {
					setLevel(`${hls!.currentLevel} / ${hls!.levels.length - 1}`);
				});
				hls.on(Hls.Events.LEVEL_SWITCHED, (_, d: any) =>
					setLevel(`${d.level} / ${hls!.levels.length - 1}`)
				);
				// @ts-expect-error private field on type
				hls.on(Hls.Events.TICK, () =>
					setBwKbps(Math.round(hls!.bandwidthEstimate / 1000))
				);
				hls.loadSource(src.url);
				hls.attachMedia(el);
			}
		} else if (src.type === "dash") {
			dash = dashjs.MediaPlayer().create();
			dash.initialize(el, src.url, true);
			dash.on(dashjs.MediaPlayer.events.QUALITY_CHANGE_RENDERED, (e: any) =>
				setLevel(String(e.newQuality))
			);
		} else {
			el.src = src.url;
		}
		el.addEventListener("loadedmetadata", onMeta);
		return () => {
			el.removeEventListener("loadedmetadata", onMeta);
			hls?.destroy();
			dash?.reset();
		};
	}, [src]);

	useEffect(() => {
		const video = ref.current;
		if (!showThumbPreview || !video || !thumbCues || !thumbCues.length) {
			setThumbUrl(null);
			return;
		}
		const updateThumb = () => {
			const t = video.currentTime;
			const cue = thumbCues.find((c) => t >= c.start && t < c.end);
			setThumbUrl(cue ? `/media/thumbs_vtt/${cue.file}` : null);
		};
		video.addEventListener("timeupdate", updateThumb);
		video.addEventListener("seeking", updateThumb);
		updateThumb();
		return () => {
			video.removeEventListener("timeupdate", updateThumb);
			video.removeEventListener("seeking", updateThumb);
		};
	}, [thumbCues]);

	useEffect(() => {
		const video = ref.current;
		if (!video) return;
		const syncSubtitle = () => {
			const tracks = Array.from(
				video.querySelectorAll<HTMLTrackElement>("track[data-lab-track='true']")
			);
			for (const el of tracks) {
				const track = el.track;
				if (!track) continue;
				track.mode = caption.url ? "showing" : "disabled";
			}
		};
		syncSubtitle();
		video.addEventListener("loadedmetadata", syncSubtitle);
		video.addEventListener("loadeddata", syncSubtitle);
		return () => {
			video.removeEventListener("loadedmetadata", syncSubtitle);
			video.removeEventListener("loadeddata", syncSubtitle);
		};
	}, [caption, src.url]);

	return (
		<div
			className="p-4 rounded-xl"
			style={{
				background: "#111",
				color: "#ddd",
				display: "flex",
				flexDirection: "column",
				gap: 12,
			}}
		>
			<div style={{ position: "relative" }}>
				<video
					ref={ref}
					controls
					playsInline
					style={{
						width: "100%",
						height: "auto",
						borderRadius: 8,
						backgroundColor: "black",
					}}
				>
					{caption.url ? (
						<track
							key={caption.url}
							kind={caption.kind ?? "subtitles"}
							src={caption.url}
							srcLang={caption.lang}
							label={caption.label}
							data-lab-track="true"
							default
						/>
					) : null}
				</video>
				{showThumbPreview && thumbUrl ? (
					<div
						style={{
							position: "absolute",
							bottom: 12,
							left: 12,
							background: "rgba(0,0,0,0.7)",
							padding: 4,
							borderRadius: 4,
						}}
					>
						<img
							src={thumbUrl}
							alt="thumbnail"
							style={{
								width: 120,
								height: "auto",
								display: "block",
								borderRadius: 2,
							}}
						/>
					</div>
				) : null}
			</div>
			<div
				style={{
					display: "flex",
					gap: 16,
					marginTop: 8,
					fontFamily: "ui-monospace,monospace",
					fontSize: 12,
				}}
			>
				<span>type: {src.type}</span>
				<span>
					res: {ref.current?.videoWidth}x{ref.current?.videoHeight}
				</span>
				{size != null && <span>size: {(size / 1e6).toFixed(2)} MB</span>}
				{avgKbps != null && <span>avg~ {avgKbps} kb/s</span>}
				{bwKbps != null && <span>hls bw~ {bwKbps} kb/s</span>}
				{level && <span>level: {level}</span>}
			</div>
		</div>
	);
}

export default function Lab() {
	const [a, setA] = useState<Src>(PRESETS[0]);
	const [b, setB] = useState<Src>(PRESETS[1]);
	const [capA, setCapA] = useState<Cap>(CAPTIONS[0]);
	const [capB, setCapB] = useState<Cap>(CAPTIONS[0]);
	const options = useMemo(
		() =>
			PRESETS.map((s, i) => (
				<option key={i} value={i}>
					{s.label}
				</option>
			)),
		[]
	);
	const captionOptions = useMemo(
		() =>
			CAPTIONS.map((c, i) => (
				<option key={i} value={i}>
					{c.label}
				</option>
			)),
		[]
	);
	return (
		<div style={{ padding: 16, display: "grid", gap: 16 }}>
			<h2>Lab</h2>
			<div
				style={{
					display: "grid",
					gap: 12,
					gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
				}}
			>
				<label>
					Left source{" "}
					<select
						value={PRESETS.indexOf(a)}
						onChange={(e) => setA(PRESETS[+e.target.value])}
					>
						{options}
					</select>
				</label>
				<label>
					Left subtitles
					<select
						value={CAPTIONS.indexOf(capA)}
						onChange={(e) => setCapA(CAPTIONS[+e.target.value])}
					>
						{captionOptions}
					</select>
				</label>
				<label>
					Right source
					<select
						value={PRESETS.indexOf(b)}
						onChange={(e) => setB(PRESETS[+e.target.value])}
					>
						{options}
					</select>
				</label>
				<label>
					Right subtitles
					<select
						value={CAPTIONS.indexOf(capB)}
						onChange={(e) => setCapB(CAPTIONS[+e.target.value])}
					>
						{captionOptions}
					</select>
				</label>
			</div>
			<div
				style={{
					display: "grid",
					gap: 16,
					alignItems: "stretch",
					gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
				}}
			>
				<Player
					src={a}
					caption={capA}
					showThumbPreview={a.label === THUMBS_PRESET_LABEL}
				/>
				<Player
					src={b}
					caption={capB}
					showThumbPreview={b.label === THUMBS_PRESET_LABEL}
				/>
			</div>
		</div>
	);
}
