// src/player/dash/createDashPlayer.ts
import * as dashjs from "dashjs";
import type { PlayerAdapter, DrmConfig } from "../adapter";
import { buildProtectionData } from "./drm";
import { ev } from "./events";

type InitOptions = { lowLatency?: boolean };

export function createDashPlayer(): PlayerAdapter & {
	getNative?: () => dashjs.MediaPlayerClass | null;
} {
	let p: dashjs.MediaPlayerClass | undefined;
	let v: HTMLVideoElement | undefined;
	const listeners: Record<string, Array<(d: any) => void>> = {};
	const emit = (name: string, data: any) =>
		(listeners[name] || []).forEach((cb) => cb(data));

	const handleQualityEvent = () => {
		if (!p) return;
		const dm = p.getDashMetrics?.();
		const da = p.getDashAdapter?.();
		const si = (p as any).getActiveStream?.()?.getStreamInfo?.();
		const period = si?.index ?? 0;
		const rs = dm?.getCurrentRepresentationSwitch?.("video");
		const rep =
			rs && da?.getRepresentationFor
				? da.getRepresentationFor("video", rs.to, period)
				: undefined;
		const kbps = rep?.bandwidth ? Math.round(rep.bandwidth / 1000) : 0;
		emit("bitrateChanged", { bitrateKbps: kbps, height: rep?.height });
	};
	const handlePaused = () => emit("paused", {});
	const handlePlaying = () => emit("playing", {});
	const handleError = (e: any) => emit("error", normalizeError(e));

	return {
		async init(video: HTMLVideoElement, drm?: DrmConfig, opt?: InitOptions) {
			v = video;
			p = dashjs.MediaPlayer().create();
			p.updateSettings({
				streaming: {
					abr: {
						autoSwitchBitrate: { video: true },
						initialBitrate: { video: 600 },
					},
					lowLatencyEnabled: !!opt?.lowLatency,
				},
				debug: { logLevel: dashjs.Debug.LOG_LEVEL_NONE },
			});
			p.initialize(video, undefined, false);
			// Enable text by default for DASH captions lesson
			(p as any).setTextDefaultEnabled?.(true);

			const pd = buildProtectionData(drm);
			if (pd) p.setProtectionData(pd);

			p.on(ev.STREAM_INITIALIZED, handlePlaying);
			p.on(ev.PLAYBACK_STARTED, handleQualityEvent);
			p.on(ev.QUALITY_CHANGE_RENDERED, handleQualityEvent);
			p.on(ev.PLAYBACK_PAUSED, handlePaused);
			p.on(ev.ERROR, handleError);
		},

		async load(url: string) {
			if (!p || !v) throw new Error("init() first");
			if (/\.mp4($|\?)/i.test(url)) {
				try {
					p.reset();
				} catch {}
				v.src = url;
				return;
			}
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
			const a = listeners[event];
			if (!a) return;
			const i = a.indexOf(cb);
			if (i >= 0) a.splice(i, 1);
		},
		getNative() {
			return p ?? null;
		},
	};
}

function normalizeError(e: any) {
	return {
		code: e?.error?.code ?? e?.event?.id ?? "DASH_ERROR",
		message: e?.event?.message ?? e?.message ?? String(e),
	};
}
