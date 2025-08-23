import { usePlayerStore } from "../state/usePlayerStore";

export default function ErrorBanner() {
	const { lastError } = usePlayerStore();
	if (!lastError) return null;
	return (
		<div
			style={{
				position: "absolute",
				bottom: 0,
				left: 0,
				right: 0,
				background: "#8b0000",
				color: "#fff",
				padding: 10,
			}}
		>
			Playback error: {lastError.code} – {lastError.message}
		</div>
	);
}
