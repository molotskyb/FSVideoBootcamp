import { usePlayerStore } from "../state/usePlayerStore";
import { fmtKbps } from "../utils/format";

export default function MetricsOverlay() {
	const { bitrateKbps, height } = usePlayerStore();
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
			}}
		>
			<div>BR: {fmtKbps(bitrateKbps)} kb/s</div>
			<div>H: {height ?? "—"} px</div>
		</div>
	);
}
