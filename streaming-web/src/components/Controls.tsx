export default function Controls({
	video,
}: {
	video: HTMLVideoElement | null;
}) {
	const setRate = (r: number) => {
		if (video) video.playbackRate = r;
	};
	const pip = async () => {
		if (!video) return;
		// @ts-ignore
		if (document.pictureInPictureEnabled && !document.pictureInPictureElement) {
			// @ts-ignore
			await video.requestPictureInPicture();
		} else {
			// @ts-ignore
			await document.exitPictureInPicture?.();
		}
	};
	return (
		<div style={{ display: "flex", gap: 8, marginTop: 8 }}>
			<button onClick={() => setRate(1)}>1.0×</button>
			<button onClick={() => setRate(1.25)}>1.25×</button>
			<button onClick={() => setRate(1.5)}>1.5×</button>
			<button onClick={pip}>PiP</button>
		</div>
	);
}
