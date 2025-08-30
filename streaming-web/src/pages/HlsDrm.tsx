// src/pages/HlsDrm.tsx
import HLSFairPlayPlayer from "../components/HLSFairPlayPlayer";
import HLSVideoPlayer from "../components/HLSVideoPlayer";
import { ENV } from "../config/env";

export default function HlsDrm() {
	const ready = !!(ENV.FPS_HLS && ENV.FPS_CERT_URL && ENV.FPS_LICENSE_URL);

	if (!ready) {
		// Fallback: play clear HLS so the page still runs; show guidance
		const clear = ENV.CLEAR_HLS;
		return (
			<>
				<h2>HLS — DRM (FairPlay · Safari only)</h2>
				<p style={{ color: "#c66" }}>
					FairPlay demo not configured. Set <code>VITE_FPS_HLS</code>,{" "}
					<code>VITE_FPS_CERT_URL</code>, and <code>VITE_FPS_LICENSE_URL</code>.
					Until then, showing clear HLS fallback below.
				</p>
				<HLSVideoPlayer src={clear} />
				<p style={{ opacity: 0.7, wordBreak: "break-all" }}>
					Fallback Source: {clear}
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
					headers: ENV.DRM_HEADERS, // optional
					// useBase64: true, // enable only if your license server expects base64 SPC/CKC
				}}
			/>
			<p style={{ opacity: 0.7, wordBreak: "break-all" }}>
				Source: {ENV.FPS_HLS}
			</p>
		</>
	);
}
