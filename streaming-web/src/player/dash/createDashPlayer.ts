// src/player/dash/createDashPlayer.ts
import * as dashjs from "dashjs";
import type { PlayerAdapter, DrmConfig } from "../adapter";
import { buildProtectionData } from "./drm";
import { ev } from "./events";

export function createDashPlayer(): PlayerAdapter {
	let p: dashjs.MediaPlayerClass | undefined;
	let v: HTMLVideoElement | undefined;
	const listeners: Record<string, Array<(d: any) => void>> = {};

	const emit = (name: string, data: any) => {
		(listeners[name] || []).forEach((cb) => cb(data));
	};

	// ---- native handlers we can remove later with `off`
	const handleQualityEvent = () => {
		if (!p) return;
		const { bitrateKbps, height } = getCurrentVideoRep(p);
		emit("bitrateChanged", { bitrateKbps, height });
	};
	const handlePaused = () => emit("paused", {});
	const handlePlaying = () => emit("playing", {});
	const handleError = (e: any) => emit("error", normalizeError(e));

	return {
		async init(video: HTMLVideoElement, drm?: DrmConfig) {
			v = video;
			p = dashjs.MediaPlayer().create();
			p.updateSettings({
				streaming: {
					abr: {
						autoSwitchBitrate: { video: true },
						initialBitrate: { video: 600 }, // kbps
					},
				},
				debug: { logLevel: dashjs.Debug.LOG_LEVEL_NONE },
			});
			p.initialize(video, undefined, false);

			const pd = buildProtectionData(drm);
			if (pd) p.setProtectionData(pd);

			// wire native events
			p.on(ev.STREAM_INITIALIZED, handlePlaying);
			p.on(ev.PLAYBACK_STARTED, handleQualityEvent);
			p.on(ev.QUALITY_CHANGE_RENDERED, handleQualityEvent);
			p.on(ev.PLAYBACK_PAUSED, handlePaused);
			p.on(ev.ERROR, handleError);
		},

		async load(url: string) {
			if (!p) throw new Error("init() first");
			p.attachSource(url);
		},

		setPlaybackRate(rate: number) {
			if (v) v.playbackRate = rate;
		},

		async destroy() {
			try {
				if (p) {
					p.off(ev.STREAM_INITIALIZED, handlePlaying);
					p.off(ev.PLAYBACK_STARTED, handleQualityEvent);
					p.off(ev.QUALITY_CHANGE_RENDERED, handleQualityEvent);
					p.off(ev.PLAYBACK_PAUSED, handlePaused);
					p.off(ev.ERROR, handleError);
				}
			} finally {
				p?.reset();
				p = undefined;
				v = undefined;
				Object.keys(listeners).forEach((k) => (listeners[k] = []));
			}
		},

		on(event, cb) {
			(listeners[event] ||= []).push(cb);
		},

		off(event, cb) {
			const arr = listeners[event];
			if (!arr) return;
			const i = arr.indexOf(cb);
			if (i >= 0) arr.splice(i, 1);
		},

		// Optional escape hatch for metrics hooks
		getNative() {
			return p ?? null;
		},
	};
}

/** Read current Representation via DashMetrics + DashAdapter */
function getCurrentVideoRep(p: dashjs.MediaPlayerClass): {
	bitrateKbps: number;
	height?: number;
} {
	try {
		const dm = p.getDashMetrics?.();
		const da = p.getDashAdapter?.();
		const streamInfo = (p as any).getActiveStream?.()?.getStreamInfo?.();

		const repSwitch = dm?.getCurrentRepresentationSwitch?.("video");
		if (repSwitch && da?.getVoRepresentation) {
			const reps = da.getVoRepresentation(streamInfo);
			const rep = reps?.find((r: any) => r.id === repSwitch.to);
			const bwKbps = rep?.bandwidth ? Math.round(rep.bandwidth / 1000) : 0; // bandwidth is bits/s
			return { bitrateKbps: bwKbps, height: rep?.height };
		}
	} catch {
		// ignore and return defaults
	}
	return { bitrateKbps: 0, height: undefined };
}

function normalizeError(e: any) {
	return {
		code: e?.error?.code ?? e?.event?.id ?? "DASH_ERROR",
		message: e?.event?.message ?? e?.message ?? String(e),
	};
}
