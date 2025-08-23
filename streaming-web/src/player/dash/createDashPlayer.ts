import dashjs from "dashjs";
import type { PlayerAdapter, DrmConfig } from "../adapter";
import { buildProtectionData } from "./drm";
import { ev, isError, isQualityChange } from "./events";

export function createDashPlayer(): PlayerAdapter {
	let p: dashjs.MediaPlayerClass | undefined;
	let v: HTMLVideoElement | undefined;
	const listeners: Record<string, ((d: any) => void)[]> = {};

	const emit = (name: string, data: any) =>
		(listeners[name] || []).forEach((cb) => cb(data));

	return {
		async init(video: HTMLVideoElement, drm?: DrmConfig) {
			v = video;
			p = dashjs.MediaPlayer().create();
			// Lean defaults (good on laptops & TVs)
			p.updateSettings({
				streaming: {
					abr: {
						autoSwitchBitrate: { video: true },
						initialBitrate: { video: 600 },
					},
					fastSwitchEnabled: true,
					lowLatencyEnabled: false,
				},
				debug: { logLevel: dashjs.Debug.LOG_LEVEL_NONE },
			});
			p.initialize(video, undefined, false);
			const pd = buildProtectionData(drm);
			if (pd) p.setProtectionData(pd);

			p.on(ev.STREAM_INITIALIZED, () => emit("playing", {}));
			p.on(ev.PLAYBACK_PAUSED, () => emit("paused", {}));
			p.on(ev.ERROR, (e: any) => emit("error", normalizeError(e)));
			p.on(ev.QUALITY_CHANGE_RENDERED, (e: any) => {
				const br = p!.getBitrateInfoListFor("video")[e.newQuality]?.bitrate; // kbps
				emit("bitrateChanged", { bitrateKbps: br, height: currentHeight(p!) });
			});
		},
		async load(url: string) {
			if (!p) throw new Error("init() first");
			p.attachSource(url);
		},
		setPlaybackRate(rate: number) {
			if (v) v.playbackRate = rate;
		},
		async destroy() {
			p?.reset();
			p = undefined;
			v = undefined;
		},
		on(event, cb) {
			(listeners[event] ||= []).push(cb);
		},
	};
}

function currentHeight(p: dashjs.MediaPlayerClass) {
	const videoList = p.getBitrateInfoListFor("video");
	const idx = p.getQualityFor("video");
	return videoList?.[idx]?.height;
}

function normalizeError(e: any) {
	if (!e) return { code: "UNKNOWN", message: "Unknown dash.js error" };
	return {
		code: e.error?.code ?? e.event?.id ?? "DASH_ERROR",
		message: e.event?.message || String(e),
	};
}
