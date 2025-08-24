import VideoPlayer from "../components/VideoPlayer";
import { ENV } from "../config/env";

export default function DashClear() {
	return (
		<>
			<h2>DASH — Clear</h2>
			<VideoPlayer mpdUrl={ENV.CLEAR_DASH || ENV.MPD} />
			<p style={{ opacity: 0.7, wordBreak: "break-all" }}>
				Source: {ENV.CLEAR_DASH || ENV.MPD}
			</p>
		</>
	);
}
