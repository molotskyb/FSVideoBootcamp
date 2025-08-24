import HlsVideoPlayer from "../components/HLSVideoPlayer";
import { ENV } from "../config/env";

export default function HlsClear() {
	return (
		<>
			<h2>HLS — Clear</h2>
			<HlsVideoPlayer
				src={
					ENV.CLEAR_HLS || "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
				}
			/>
		</>
	);
}
