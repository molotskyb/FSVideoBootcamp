import * as dashjs from "dashjs";
export const ev = dashjs.MediaPlayer.events;
// convenience guards
export const isQualityChange = (e: { type?: string }) =>
	e?.type === ev.QUALITY_CHANGE_RENDERED;
export const isError = (e: { type?: string }) => e?.type === ev.ERROR;
