import VideoPlayer from "../components/VideoPlayer";
import { PlayerProvider } from "../state/playerStore";
import { ENV } from "../config/env";

export default function App() {
	return (
		<PlayerProvider>
			<div style={{ padding: 16, width: 1260, margin: "0 auto" }}>
				<h1>Dash Player Seed</h1>
				<VideoPlayer
					mpdUrl={ENV.MPD}
					drm={{
						widevine: ENV.WV,
						playready: ENV.PR,
						headers: ENV.DRM_HEADERS,
					}}
				/>
				<p style={{ opacity: 0.7 }}>Source: {ENV.MPD}</p>
			</div>
		</PlayerProvider>
	);
}
