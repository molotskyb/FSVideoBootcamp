import { useEffect, useRef, useState } from "react";
import * as dashjs from "dashjs";

type KeysJson = {
	kid_base64url: string;
	key_base64url: string;
};

const MPD_URL = "/media/ck/stream.mpd";
const KEYS_URL = "/media/ck/keys.json";
const CLEARKEY_PROBE_TIMEOUT_MS = 3000;
const CLEARKEY_UNSUPPORTED_MESSAGE =
	"ClearKey is not supported in this browser. Use Chrome, Edge, or Firefox for this demo. Safari uses FairPlay, not ClearKey.";
const CLEARKEY_ERROR_HUNT_WARNING =
	"Error-hunt mode: using an intentionally wrong ClearKey value.";
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

function logDemo(status: "loading" | "playing") {
	console.log(JSON.stringify({ type: "clearkey.demo", status }));
}

function logError(message: string) {
	console.log(JSON.stringify({ type: "clearkey.error", message }));
}

function logErrorHunt() {
	console.log(
		JSON.stringify({ type: "drm.errorhunt", mode: "clearkey-bad-key" }),
	);
}

function getErrorMessage(error: unknown) {
	if (error instanceof Error) return error.message;
	if (typeof error === "string") return error;
	return "ClearKey demo failed";
}

function getHashSearchParam(name: string) {
	const hash = window.location.hash;
	const queryStart = hash.indexOf("?");
	if (queryStart === -1) return null;
	return new URLSearchParams(hash.slice(queryStart + 1)).get(name);
}

function getBreakMode() {
	return getHashSearchParam("break");
}

function corruptClearKeyValue(key: string) {
	const first = key.at(0);
	const replacement = first === "A" ? "B" : "A";
	return `${replacement}${key.slice(1)}`;
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
		const supported = await Promise.race([
			requestAccess
				.call(navigator, "org.w3.clearkey", [CLEARKEY_PROBE_CONFIG])
				.then(() => true),
			new Promise<false>((resolve) => {
				window.setTimeout(() => resolve(false), CLEARKEY_PROBE_TIMEOUT_MS);
			}),
		]);
		return supported;
	} catch {
		return false;
	}
}

export default function ClearKeyDemo() {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const [breakMode, setBreakMode] = useState(getBreakMode);
	const isBadKeyMode = breakMode === "key";
	const [status, setStatus] = useState("Idle");
	const [logs, setLogs] = useState<string[]>([]);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const onHashChange = () => setBreakMode(getBreakMode());
		window.addEventListener("hashchange", onHashChange);
		return () => window.removeEventListener("hashchange", onHashChange);
	}, []);

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

		const addLog = (message: string) => {
			if (!active) return;
			setLogs((current) => [...current, message]);
		};

		const onPlaying = () => {
			if (!active) return;
			setStatus("Playing");
			addLog("ClearKey DASH playing");
			logDemo("playing");
		};

		const onDashError = (event: any) => {
			const message =
				event?.error?.message ?? event?.event?.message ?? "dash.js error";
			if (!active) return;
			setError(message);
			setStatus("Error");
			addLog(message);
			logError(message);
		};

		async function load() {
			try {
				setError(null);
				setStatus("Loading");
				setLogs([
					`Error-hunt mode changed: ${isBadKeyMode ? "break=key" : "normal"}`,
				]);
				if (isBadKeyMode) {
					addLog(CLEARKEY_ERROR_HUNT_WARNING);
					logErrorHunt();
				}
				logDemo("loading");

				const clearKeySupported = await supportsClearKey();
				if (!clearKeySupported) {
					if (!active) return;
					setError(CLEARKEY_UNSUPPORTED_MESSAGE);
					setStatus("Unsupported");
					logError(CLEARKEY_UNSUPPORTED_MESSAGE);
					return;
				}

				player = dashjs.MediaPlayer().create();

				const response = await fetch(KEYS_URL);
				if (!response.ok) {
					throw new Error(`Failed to load ${KEYS_URL}: ${response.status}`);
				}

				const keys = (await response.json()) as KeysJson;
				if (!keys.kid_base64url || !keys.key_base64url) {
					throw new Error("ClearKey keys.json is missing browser key values.");
				}
				const clearKeyValue = isBadKeyMode
					? corruptClearKeyValue(keys.key_base64url)
					: keys.key_base64url;

				if (!active) {
					return;
				}

				player.updateSettings({
					debug: { logLevel: dashjs.Debug.LOG_LEVEL_NONE },
				} as any);
				player.initialize(media, undefined, false);
				initialized = true;
				player.setProtectionData({
					"org.w3.clearkey": {
						clearkeys: {
							[keys.kid_base64url]: clearKeyValue,
						},
					},
				});
				player.on(dashjs.MediaPlayer.events.ERROR, onDashError);
				media.addEventListener("playing", onPlaying);
				eventsAttached = true;
				addLog("Loading ClearKey encrypted DASH");
				player.attachSource(MPD_URL);
				setStatus("Waiting for playback");
			} catch (caught) {
				const message = getErrorMessage(caught);
				if (!active) return;
				setError(message);
				setStatus("Error");
				addLog(message);
				logError(message);
			}
		}

		load();

		return () => {
			active = false;
			if (eventsAttached && player) {
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
	}, [isBadKeyMode]);

	return (
		<section>
			<h2>ClearKey Demo</h2>
			<p style={{ color: "#b00020" }}>
				Demo only. Never expose real keys in production.
			</p>
			{isBadKeyMode ? (
				<p style={{ color: "#b00020" }}>{CLEARKEY_ERROR_HUNT_WARNING}</p>
			) : null}
			<div
				style={{
					background: "#fff4e5",
					border: "1px solid #f59e0b",
					borderRadius: 8,
					margin: "16px 0",
					marginBottom: 20,
					padding: 16,
					maxWidth: 600,
				}}
			>
				<h3 style={{ marginTop: 0 }}>Error-hunt mode</h3>
				<p>Switch between normal playback and an intentionally wrong key.</p>
				<button
					type="button"
					onClick={() => {
						window.location.hash = isBadKeyMode
							? "/clearkey"
							: "/clearkey?break=key";
					}}
					style={
						isBadKeyMode
							? {
									background: "white",
									border: "1px solid #92400e",
									borderRadius: 6,
									color: "#111827",
									cursor: "pointer",
									fontWeight: 700,
									padding: "10px 14px",
								}
							: {
									background: "#c2410c",
									border: "1px solid #9a3412",
									borderRadius: 6,
									color: "white",
									cursor: "pointer",
									fontWeight: 700,
									padding: "10px 14px",
								}
					}
				>
					{isBadKeyMode ? "Back to normal ClearKey" : "Run with broken key"}
				</button>
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
				<h3>Log</h3>
				{logs.length === 0 ? (
					<p style={{ opacity: 0.7 }}>No events yet.</p>
				) : (
					<ol>
						{logs.map((entry, index) => (
							<li key={`${entry}-${index}`}>{entry}</li>
						))}
					</ol>
				)}
			</div>
		</section>
	);
}
