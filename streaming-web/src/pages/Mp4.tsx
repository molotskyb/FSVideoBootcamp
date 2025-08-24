import VideoPlayer from "../components/VideoPlayer";

export default function Mp4() {
	return (
		<>
			<h2>Progressive MP4</h2>
			<VideoPlayer
				mpdUrl={"https://storage.googleapis.com/shaka-demo-assets/angel-one-hls/hls.m3u8".replace(
					".m3u8",
					".mp4"
				)}
			/>
			<p>Note: our wrapper has a bypass to play .mp4 directly (no MSE).</p>
		</>
	);
}
