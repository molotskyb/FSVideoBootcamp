// src/pages/HlsDrm.tsx
import HLSFairPlayPlayer from "../components/HLSFairPlayPlayer";
import HLSVideoPlayer from "../components/HLSVideoPlayer";
import { ENV } from "../config/env";

export default function HlsDrm() {
	const missing = [
		!ENV.FPS_HLS && "VITE_FPS_HLS",
		!ENV.FPS_CERT_URL && "VITE_FPS_CERT_URL",
		!ENV.FPS_LICENSE_URL && "VITE_FPS_LICENSE_URL",
	].filter(Boolean) as string[];
	const ready = missing.length === 0;

	if (!ready) {
		return (
			<>
				<h2>HLS — DRM (FairPlay · Safari only)</h2>
				{/* Secure teaching banner */}
				<div
					style={{
						background: "rgba(255, 102, 102, 0.15)",
						border: "1px solid #c66",
						padding: "12px",
						borderRadius: 8,
						margin: "12px 0",
					}}
				>
					<strong>Note:</strong> FairPlay DRM requires private license/cert
					endpoints. These are not included in this public repo. Students should
					configure <code>VITE_FPS_HLS</code>, <code>VITE_FPS_CERT_URL</code>,
					and <code>VITE_FPS_LICENSE_URL</code> in their own{" "}
					<code>.env.local</code> after forking or downloading.
				</div>

				{/* Fallback clear stream so the page still works */}
				<HLSVideoPlayer src={ENV.CLEAR_HLS} />
				<p style={{ opacity: 0.7, wordBreak: "break-all" }}>
					Fallback Source: {ENV.CLEAR_HLS}
				</p>
			</>
		);
	}

	return (
		<>
			<h2>HLS — DRM (FairPlay · Safari only)</h2>
			<HLSFairPlayPlayer
				src={ENV.FPS_HLS}
				fps={{
					certUrl: ENV.FPS_CERT_URL,
					licenseUrl: ENV.FPS_LICENSE_URL,
					headers: ENV.DRM_HEADERS,
				}}
			/>
			<p style={{ opacity: 0.7, wordBreak: "break-all" }}>
				Source: {ENV.FPS_HLS}
			</p>
		</>
	);
}
