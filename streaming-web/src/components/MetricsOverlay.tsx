// src/components/MetricsOverlay.tsx
import { usePlayerStore } from "../state/usePlayerStore";
import { fmtKbps } from "../utils/format";

type Metrics = {
	bitrateKbps: number;
	resolution: string;
	stalls: number;
	droppedFrames: number;
};
type Props = {
	metrics?: Metrics;
	info?: { url?: string; drm?: { widevine?: boolean; playready?: boolean } };
};

export default function MetricsOverlay({ metrics, info }: Props) {
	const { bitrateKbps: sBR, height: sH } = usePlayerStore();
	const res = metrics?.resolution ?? (sH ? `?x${sH}` : "—");
	const br = metrics?.bitrateKbps ?? sBR ?? 0;

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
				minWidth: 180,
			}}
		>
			<div>BR: {fmtKbps(br)} kb/s</div>
			<div>Res: {res}</div>
			<div>Stalls: {metrics?.stalls ?? 0}</div>
			<div>DropFrames: {metrics?.droppedFrames ?? 0}</div>
			{info && (
				<div style={{ opacity: 0.8, marginTop: 6 }}>
					DRM: {info.drm?.widevine ? "WV " : ""}
					{info.drm?.playready ? "PR" : ""}
					{!info.drm?.widevine && !info.drm?.playready ? "none" : ""}
				</div>
			)}
		</div>
	);
}
