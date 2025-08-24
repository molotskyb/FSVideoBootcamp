export const SOURCES = {
	bbb: {
		title: "Big Buck Bunny — clear",
		mpd: "https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd",
	},
	angelOne: {
		title: "Angel One — clear",
		mpd: "https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd",
	},
};
export type SourceKey = keyof typeof SOURCES;
