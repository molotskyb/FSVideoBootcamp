import VideoPlayer from "../components/VideoPlayer";
import { PlayerProvider } from "../state/playerStore";
import { ENV } from "../config/env";

export default function App() {
	return (
		<PlayerProvider>
			<div
				style={{
					padding: 16,
					width: "100vw",
					maxWidth: 1260,
					margin: "0 auto",
					boxSizing: "border-box",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "flex-start",
					minHeight: "100vh",
				}}
			>
				<img
					src="/assets/logo.png"
					alt="Logo"
					style={{
						display: "block",
						margin: "32px 0 16px 0",
						maxWidth: "180px",
						width: "40vw",
						height: "auto",
						alignSelf: "start",
					}}
				/>
				<h1 style={{ textAlign: "center" }}>Dash Player Seed</h1>
				<VideoPlayer
					mpdUrl={ENV.MPD}
					drm={{
						widevine: ENV.WV,
						playready: ENV.PR,
						headers: ENV.DRM_HEADERS,
					}}
				/>
				<p
					style={{ opacity: 0.7, wordBreak: "break-all", textAlign: "center" }}
				>
					Source: {ENV.MPD}
				</p>
			</div>
		</PlayerProvider>
	);
}
