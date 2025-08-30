// src/pages/HlsDrm.tsx (FairPlay · Safari only)
import HLSFairPlayPlayer from "../components/HLSFairPlayPlayer";
import { ENV } from "../config/env";
export default function HlsDrm() {
	const ready = !!(ENV.FPS_HLS && ENV.FPS_CERT_URL && ENV.FPS_LICENSE_URL);
	return (
		<>
			<h2>HLS — DRM (FairPlay · Safari only)</h2>
			{ready ? (
				<HLSFairPlayPlayer
					src={ENV.FPS_HLS}
					fps={{ certUrl: ENV.FPS_CERT_URL, licenseUrl: ENV.FPS_LICENSE_URL }}
				/>
			) : (
				<p style={{ color: "#c66" }}>
					Set <code>VITE_FPS_HLS</code>, <code>VITE_FPS_CERT_URL</code>,{" "}
					<code>VITE_FPS_LICENSE_URL</code>.
				</p>
			)}
			<p style={{ opacity: 0.7, wordBreak: "break-all" }}>
				Source: {ENV.FPS_HLS || "—"}
			</p>
		</>
	);
}
