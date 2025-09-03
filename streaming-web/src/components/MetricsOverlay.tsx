// src/components/MetricsOverlay.tsx
import { usePlayerStore } from "../state/usePlayerStore";
import { fmtKbps } from "../utils/format";

type Metrics = {
	bitrateKbps: number;
	resolution: string;
	stalls: number;
	droppedFrames: number;
	bufferLevel?: number;
	latency?: number;
	isLive?: boolean;
};

type Props = {
	metrics?: Metrics;
	info?: { url?: string; drm?: { widevine?: boolean; playready?: boolean } };
};

const fmtSec = (v: number | undefined) =>
	typeof v === "number" && !Number.isNaN(v) ? v.toFixed(1) : "—";

export default function MetricsOverlay({ metrics, info }: Props) {
	// fallback values from store (keeps overlay populated even before hook warms up)
	const { bitrateKbps: sBR, height: sH } = usePlayerStore();

	const br = metrics?.bitrateKbps ?? sBR ?? 0; // kb/s number for fmtKbps
	const res = metrics?.resolution ?? (sH ? `?x${sH}` : "—");
	const stalls = metrics?.stalls ?? 0;
	const drops = metrics?.droppedFrames ?? 0;

	const bufferLevel = metrics?.bufferLevel; // seconds or undefined

	const latencyRow = metrics?.isLive
		? `Latency: ${fmtSec(metrics?.latency)}s`
		: "Latency: — (Not live)";

	return (
		<div
			style={{
				position: "absolute",
				top: 12,
				right: 12,
				background: "rgba(0,0,0,.6)",
				padding: "8px 12px",
				borderRadius: 8,
				color: "#fff",
				fontFamily: "monospace",
				fontSize: 12,
				lineHeight: 1.35,
				pointerEvents: "none",
				minWidth: 220,
			}}
		>
			{/* Core playback */}
			<div>BR: {fmtKbps(br)} kb/s</div>
			<div>Res: {res}</div>
			<div>Stalls: {stalls}</div>
			<div>Drops: {drops}</div>

			{/* ABR/Buffer/Latency — always shown with placeholders */}
			<div>Buffer: {fmtSec(bufferLevel)}s</div>
			<div>{latencyRow}</div>

			{/* DRM summary */}
			<div style={{ opacity: 0.8, marginTop: 6 }}>
				DRM: {info?.drm?.widevine ? "WV " : ""}
				{info?.drm?.playready ? "PR" : ""}
				{!info?.drm?.widevine && !info?.drm?.playready ? "none" : ""}
			</div>
		</div>
	);
}
