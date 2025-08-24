import VideoPlayer from "../components/VideoPlayer";

export default function Errors() {
	return (
		<>
			<h2>Error Handling</h2>
			<VideoPlayer mpdUrl={"https://example.com/does-not-exist.mpd"} />
			<p>You should see ErrorBanner with a readable message.</p>
		</>
	);
}
