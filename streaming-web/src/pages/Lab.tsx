// src/pages/Lab.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import * as dashjs from "dashjs";

type Src = { label: string; type: "mp4" | "hls" | "dash"; url: string };

const PRESETS: Src[] = [
	{ label: "MP4 sample", type: "mp4", url: "/assets/sample.mp4" },
	{ label: "HLS CMAF", type: "hls", url: "/media/hls/master.m3u8" },
	{ label: "DASH CMAF", type: "dash", url: "/media/dash/stream.mpd" },
	// comparisons you publish per lesson:
	{ label: "CRF=23", type: "mp4", url: "/media/crf/crf23.mp4" },
	{ label: "CBR 2M", type: "mp4", url: "/media/cbr/cbr_2M.mp4" },
	{ label: "VBR 2-pass 2M", type: "mp4", url: "/media/vbr/vbr_2pass_2M.mp4" },
	{ label: "HLS 2s", type: "hls", url: "/media/hls2s/master.m3u8" },
	{ label: "HLS 6s", type: "hls", url: "/media/hls6s/master.m3u8" },
];

async function headSize(url: string): Promise<number | null> {
	try {
		const r = await fetch(url, { method: "HEAD" });
		const v = r.headers.get("content-length");
		return v ? parseInt(v, 10) : null;
	} catch {
		return null;
	}
}

function Player({ src }: { src: Src }) {
	const ref = useRef<HTMLVideoElement>(null);
	const [size, setSize] = useState<number | null>(null);
	const [avgKbps, setAvgKbps] = useState<number | null>(null);
	const [bwKbps, setBwKbps] = useState<number | null>(null);
	const [level, setLevel] = useState<string>("");

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

	return (
		<div
			className="p-4 rounded-xl"
			style={{ background: "#111", color: "#ddd", display: "flex", flexDirection: "column", gap: 12 }}
		>
			<video
				ref={ref}
				controls
				playsInline
				style={{ width: "100%", height: "auto", borderRadius: 8, backgroundColor: "black" }}
			/>
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
	const options = useMemo(
		() =>
			PRESETS.map((s, i) => (
				<option key={i} value={i}>
					{s.label}
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
					Right source
					<select
						value={PRESETS.indexOf(b)}
						onChange={(e) => setB(PRESETS[+e.target.value])}
					>
						{options}
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
				<Player src={a} />
				<Player src={b} />
			</div>
		</div>
	);
}
