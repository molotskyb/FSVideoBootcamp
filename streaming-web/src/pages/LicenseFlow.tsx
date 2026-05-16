import { useEffect, useRef, useState } from "react";
import * as dashjs from "dashjs";

type KeysJson = {
	kid_base64url?: string;
	key_base64url?: string;
	kid_hex?: string;
	key_hex?: string;
};

const MPD_URL = "/media/ck/stream.mpd";
const KEYS_URL = "/media/ck/keys.json";
const CLEARKEY_UNSUPPORTED_MESSAGE =
	"ClearKey is not supported in this browser. Use Chrome, Edge, or Firefox for this demo. Safari uses FairPlay.";
const CLEARKEY_PROBE_TIMEOUT_MS = 3000;
const CLEARKEY_PROBE_CONFIG: MediaKeySystemConfiguration = {
	initDataTypes: ["cenc"],
	audioCapabilities: [
		{
			contentType: 'audio/mp4; codecs="mp4a.40.2"',
		},
	],
	videoCapabilities: [
		{
			contentType: 'video/mp4; codecs="avc1.640028"',
		},
	],
	persistentState: "optional",
	distinctiveIdentifier: "optional",
};
const FLOW_STEPS = [
	"init data",
	"challenge",
	"response",
	"update",
	"playback",
] as const;

function logEvent(step: string) {
	console.log(JSON.stringify({ type: "license-flow.event", step }));
}

function logError(message: string) {
	console.log(JSON.stringify({ type: "license-flow.error", message }));
}

function getErrorMessage(error: unknown) {
	if (error instanceof Error) return error.message;
	if (typeof error === "string") return error;
	return "License flow failed";
}

function isSafari() {
	const ua = navigator.userAgent;
	return /^((?!chrome|android|crios|fxios|edg).)*safari/i.test(ua);
}

async function supportsClearKey() {
	if (isSafari()) {
		return false;
	}

	const requestAccess = navigator.requestMediaKeySystemAccess;
	if (typeof requestAccess !== "function") {
		return false;
	}

	try {
		return await Promise.race([
			requestAccess
				.call(navigator, "org.w3.clearkey", [CLEARKEY_PROBE_CONFIG])
				.then(() => true),
			new Promise<false>((resolve) => {
				window.setTimeout(() => resolve(false), CLEARKEY_PROBE_TIMEOUT_MS);
			}),
		]);
	} catch {
		return false;
	}
}

function hexToBase64Url(hex: string) {
	const bytes = hex.match(/.{1,2}/g)?.map((byte) => Number.parseInt(byte, 16));
	if (!bytes || bytes.some((byte) => Number.isNaN(byte))) {
		return null;
	}

	let binary = "";
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}

	return window
		.btoa(binary)
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/g, "");
}

function getClearKeys(keys: KeysJson) {
	const kid = keys.kid_base64url || (keys.kid_hex ? hexToBase64Url(keys.kid_hex) : null);
	const key = keys.key_base64url || (keys.key_hex ? hexToBase64Url(keys.key_hex) : null);
	if (!kid || !key) {
		throw new Error("ClearKey keys.json is missing compatible key values.");
	}
	return { kid, key };
}

export default function LicenseFlow() {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const [events, setEvents] = useState<string[]>([]);
	const [status, setStatus] = useState("Idle");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) {
			return;
		}

		const media = video;
		let active = true;
		let initialized = false;
		let eventsAttached = false;
		let player: dashjs.MediaPlayerClass | null = null;

		const addEvent = (step: string) => {
			if (!active) return;
			setEvents((current) => [...current, step]);
			logEvent(step);
		};

		const failWith = (message: string) => {
			if (!active) return;
			setError(message);
			setStatus("Error");
			logError(message);
		};

		const onEncrypted = () => {
			addEvent("init data / encrypted content detected");
		};

		const onPlaying = () => {
			if (!active) return;
			setStatus("Playing");
			addEvent("playback started");
		};

		const onDashError = (event: any) => {
			failWith(event?.error?.message ?? event?.event?.message ?? "dash.js error");
		};

		async function load() {
			try {
				setError(null);
				setStatus("Loading");
				setEvents([]);

				const clearKeySupported = await supportsClearKey();
				if (!clearKeySupported) {
					if (!active) return;
					setError(CLEARKEY_UNSUPPORTED_MESSAGE);
					setStatus("Unsupported");
					logError(CLEARKEY_UNSUPPORTED_MESSAGE);
					return;
				}

				const response = await fetch(KEYS_URL);
				if (!response.ok) {
					throw new Error(`Failed to load ${KEYS_URL}: ${response.status}`);
				}

				const { kid, key } = getClearKeys((await response.json()) as KeysJson);
				if (!active) {
					return;
				}

				player = dashjs.MediaPlayer().create();
				player.updateSettings({
					debug: { logLevel: dashjs.Debug.LOG_LEVEL_NONE },
				} as any);
				player.initialize(media, undefined, false);
				initialized = true;

				addEvent("init data / encrypted content detected");
				addEvent("challenge / message created");
				addEvent("local license response prepared");
				player.setProtectionData({
					"org.w3.clearkey": {
						clearkeys: {
							[kid]: key,
						},
					},
				});
				addEvent("license update applied");

				player.on(dashjs.MediaPlayer.events.ERROR, onDashError);
				media.addEventListener("encrypted", onEncrypted);
				media.addEventListener("playing", onPlaying);
				eventsAttached = true;
				player.attachSource(MPD_URL);
				setStatus("Ready");
			} catch (caught) {
				failWith(getErrorMessage(caught));
			}
		}

		load();

		return () => {
			active = false;
			if (eventsAttached && player) {
				media.removeEventListener("encrypted", onEncrypted);
				media.removeEventListener("playing", onPlaying);
				try {
					player.off(dashjs.MediaPlayer.events.ERROR, onDashError);
				} catch {
					// dash.js can throw during React dev StrictMode cleanup.
				}
			}
			if (initialized && player) {
				try {
					player.reset();
				} catch {
					// ignore cleanup errors from a partially torn-down dash.js instance
				}
			}
			media.removeAttribute("src");
			media.load();
		};
	}, []);

	return (
		<section>
			<h2>License Flow Storyboard</h2>
			<p style={{ color: "#b00020" }}>
				ClearKey local responder. Demo only. Real DRM uses a license server.
			</p>
			<div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0" }}>
				{FLOW_STEPS.map((step, index) => (
					<span key={step}>
						{index > 0 ? "-> " : ""}
						{step}
					</span>
				))}
			</div>
			{status === "Unsupported" && error ? (
				<p style={{ color: "#b00020" }}>{error}</p>
			) : (
				<video
					ref={videoRef}
					controls
					style={{ width: "100%", maxWidth: 960, background: "black" }}
				/>
			)}
			<div style={{ marginTop: 12 }}>
				<p>Status: {status}</p>
				<p style={{ opacity: 0.7, wordBreak: "break-all" }}>
					Source: {MPD_URL}
				</p>
				{error && status !== "Unsupported" ? (
					<p style={{ color: "#b00020" }}>{error}</p>
				) : null}
			</div>
			<div style={{ marginTop: 16 }}>
				<h3>Event Log</h3>
				{events.length === 0 ? (
					<p style={{ opacity: 0.7 }}>No events yet.</p>
				) : (
					<ol>
						{events.map((event, index) => (
							<li key={`${event}-${index}`}>{event}</li>
						))}
					</ol>
				)}
			</div>
		</section>
	);
}
