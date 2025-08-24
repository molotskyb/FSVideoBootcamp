import VideoPlayer from "../components/VideoPlayer";
import { ENV } from "../config/env";

export default function Metrics() {
	return (
		<>
			<h2>Metrics Overlay</h2>
			<VideoPlayer mpdUrl={ENV.CLEAR_DASH || ENV.MPD} />
			<p>
				Switch network profiles in devtools to see bitrate/resolution changes.
			</p>
		</>
	);
}
