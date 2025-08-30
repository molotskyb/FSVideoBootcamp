// src/components/ErrorBanner.tsx
export default function ErrorBanner({ message }: { message: string }) {
	return (
		<div
			style={{
				position: "absolute",
				bottom: 12,
				left: 12,
				right: 12,
				background: "rgba(198, 64, 64, .9)",
				color: "#fff",
				padding: "8px 12px",
				borderRadius: 8,
			}}
		>
			<strong>Error:</strong> {message}
		</div>
	);
}
