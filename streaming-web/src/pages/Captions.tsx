import HlsVideoPlayer from "../components/HLSVideoPlayer";

export default function Captions() {
	const src = "https://test-streams.mux.dev/pts_shift/master.m3u8"; // has WebVTT
	return (
		<>
			<h2>Captions (HLS + WebVTT)</h2>
			<HlsVideoPlayer src={src} />
			<p>Use the player CC menu (browser/native) to toggle subtitles.</p>
		</>
	);
}
