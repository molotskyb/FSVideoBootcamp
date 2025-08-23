import { useMemo } from "react";
import { usePlayerStore } from "../state/usePlayerStore";
import { fmtKbps } from "../utils/format";

export type Metrics = {
	bitrateKbps: number;
	resolution: string; // e.g., "1920x1080"
	stalls: number;
	droppedFrames: number;
};

type Props = {
	metrics?: Metrics;
	info?: {
		url?: string;
		drm?: { widevine?: boolean; playready?: boolean };
	};
};

export default function MetricsOverlay({ metrics, info }: Props) {
	const { bitrateKbps: sBR, height: sH } = usePlayerStore();

	const parsed = useMemo(() => {
		const [w, h] = (metrics?.resolution ?? "")
			.split("x")
			.map((n) => Number(n) || undefined);
		return { w, h };
	}, [metrics?.resolution]);

	const displayBR = metrics?.bitrateKbps ?? sBR ?? 0;
	const displayH = parsed.h ?? sH ?? undefined;

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
				lineHeight: 1.35,
				fontSize: 12,
				pointerEvents: "none",
				minWidth: 180,
			}}
		>
			<div>BR: {fmtKbps(displayBR)} kb/s</div>
			<div>
				Res: {metrics?.resolution ?? (displayH ? `?x${displayH}` : "—")}
			</div>
			<div>Stalls: {metrics?.stalls ?? 0}</div>
			<div>DropFrames: {metrics?.droppedFrames ?? 0}</div>

			{info && (
				<>
					<div style={{ opacity: 0.8, marginTop: 6 }}>
						DRM: {info.drm?.widevine ? "WV" : ""}
						{info.drm?.playready ? " PR" : ""}
						{!info.drm?.widevine && !info.drm?.playready ? "none" : ""}
					</div>
					<div
						title={info.url}
						style={{
							opacity: 0.8,
							maxWidth: 260,
							whiteSpace: "nowrap",
							overflow: "hidden",
							textOverflow: "ellipsis",
						}}
					>
						Src: {info.url ?? "—"}
					</div>
				</>
			)}
		</div>
	);
}
