import { useEffect, useRef, useState } from "react";
import * as dashjs from "dashjs";
import { WIDEVINE_DEMO } from "../config/widevineDemo";
import { buildProtectionData } from "../player/dash/drm";

const WIDEVINE_KEY_SYSTEM = "com.widevine.alpha";
const INVALID_WIDEVINE_LICENSE_URL =
	"https://invalid-license.example.com/widevine";
const WIDEVINE_ERROR_HUNT_WARNING =
	"Error-hunt mode: using an intentionally invalid Widevine license URL.";
const WIDEVINE_PROBE_TIMEOUT_MS = 3000;
const WIDEVINE_PROBE_CONFIG: MediaKeySystemConfiguration = {
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

function logDemo(status: "loading" | "license-request" | "loaded") {
	console.log(JSON.stringify({ type: "widevine.demo", status }));
}

function logError(code: string | number, message: string) {
	console.log(JSON.stringify({ type: "widevine.error", code, message }));
}

function logErrorHunt() {
	console.log(
		JSON.stringify({ type: "drm.errorhunt", mode: "widevine-bad-license" }),
	);
}

function isPlaceholder(value: string) {
	return !value || value.includes("<MATCHED-WIDEVINE-");
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

function getErrorMessage(error: unknown) {
	if (error instanceof Error) return error.message;
	if (typeof error === "string") return error;
	return "Widevine playback failed";
}

async function supportsWidevine() {
	const requestAccess = navigator.requestMediaKeySystemAccess;
	if (typeof requestAccess !== "function") {
		return false;
	}

	try {
		return await Promise.race([
			requestAccess
				.call(navigator, WIDEVINE_KEY_SYSTEM, [WIDEVINE_PROBE_CONFIG])
				.then(() => true),
			new Promise<false>((resolve) => {
				window.setTimeout(() => resolve(false), WIDEVINE_PROBE_TIMEOUT_MS);
			}),
		]);
	} catch {
		return false;
	}
}

export default function WidevineDemo() {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const [breakMode, setBreakMode] = useState(getBreakMode);
	const isBadLicenseMode = breakMode === "license";
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
		let player: dashjs.MediaPlayerClass | null = null;
		let eventsAttached = false;
		let onLicenseRequest: (() => void) | null = null;
		let onLoaded: (() => void) | null = null;
		let onDashError: ((event: any) => void) | null = null;

		const addLog = (message: string) => {
			if (!active) return;
			setLogs((current) => [...current, message]);
		};

		const failWith = (code: string | number, message: string) => {
			if (!active) return;
			setError(message);
			setStatus("Error");
			addLog(message);
			logError(code, message);
		};

		async function load() {
			try {
				setError(null);
				setStatus("Loading");
				setLogs([
					`Error-hunt mode changed: ${
						isBadLicenseMode ? "break=license" : "normal"
					}`,
				]);
				addLog("Checking Widevine demo configuration");
				if (isBadLicenseMode) {
					addLog(WIDEVINE_ERROR_HUNT_WARNING);
					logErrorHunt();
				}

				const licenseUrl = isBadLicenseMode
					? INVALID_WIDEVINE_LICENSE_URL
					: WIDEVINE_DEMO.licenseUrl;

				if (isPlaceholder(WIDEVINE_DEMO.mpdUrl) || isPlaceholder(licenseUrl)) {
					failWith(
						"CONFIG_PLACEHOLDER",
						"Add a matched MPD URL and Widevine dev license URL before running this demo.",
					);
					return;
				}

				const widevineSupported = await supportsWidevine();
				if (!widevineSupported) {
					failWith(
						"WIDEVINE_UNSUPPORTED",
						"Widevine is not supported in this browser. Use Chrome or Edge on a device with Widevine support.",
					);
					return;
				}

				if (!active) return;

				if (!dashjs.MediaPlayer) {
					failWith("DASHJS_UNSUPPORTED", "dash.js failed to load.");
					return;
				}

				const events = dashjs.MediaPlayer.events;
				onLicenseRequest = () => {
					addLog("Widevine license request");
					logDemo("license-request");
				};
				onLoaded = () => {
					if (!active) return;
					setStatus("Loaded");
					addLog("Widevine DASH loaded");
					logDemo("loaded");
				};
				onDashError = (event: any) => {
					failWith(
						event?.error?.code ?? event?.event?.id ?? "DASH_ERROR",
						event?.error?.message ??
							event?.event?.message ??
							event?.message ??
							"dash.js error",
					);
				};

				player = dashjs.MediaPlayer().create();
				player.updateSettings({
					debug: { logLevel: dashjs.Debug.LOG_LEVEL_NONE },
				} as any);
				player.initialize(media, undefined, false);
				player.setProtectionData(
					buildProtectionData({
						widevine: licenseUrl,
						headers: WIDEVINE_DEMO.headers,
					}) as any,
				);
				player.on(events.LICENSE_REQUEST_SENDING, onLicenseRequest);
				player.on(events.STREAM_INITIALIZED, onLoaded);
				player.on(events.ERROR, onDashError);
				eventsAttached = true;

				addLog("Loading provider-matched encrypted DASH");
				logDemo("loading");
				player.attachSource(WIDEVINE_DEMO.mpdUrl);
			} catch (caught) {
				failWith("LOAD_FAILED", getErrorMessage(caught));
			}
		}

		load();

		return () => {
			active = false;
			if (player) {
				if (eventsAttached) {
					try {
						if (onLicenseRequest) {
							player.off(
								dashjs.MediaPlayer.events.LICENSE_REQUEST_SENDING,
								onLicenseRequest,
							);
						}
						if (onLoaded) {
							player.off(
								dashjs.MediaPlayer.events.STREAM_INITIALIZED,
								onLoaded,
							);
						}
						if (onDashError) {
							player.off(dashjs.MediaPlayer.events.ERROR, onDashError);
						}
					} catch {
						// ignore dash.js cleanup errors from partially torn-down instances
					}
				}
				try {
					player.reset();
				} catch {
					// ignore dash.js cleanup errors from partially torn-down instances
				}
			}
			media.removeAttribute("src");
			media.load();
		};
	}, [isBadLicenseMode]);

	return (
		<section>
			<h2>Widevine Dev Playback Test</h2>
			<p style={{ color: "#b00020" }}>
				Use provider-matched encrypted DASH content and a matching dev Widevine
				license URL. Random local keys will not work with an unrelated license
				server.
			</p>
			{isBadLicenseMode ? (
				<p style={{ color: "#b00020" }}>{WIDEVINE_ERROR_HUNT_WARNING}</p>
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
				<p>
					Switch between normal playback and an intentionally bad license URL.
				</p>
				<button
					type="button"
					onClick={() => {
						window.location.hash = isBadLicenseMode
							? "/widevine-dev"
							: "/widevine-dev?break=license";
					}}
					style={
						isBadLicenseMode
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
					{isBadLicenseMode
						? "Back to normal Widevine Dev"
						: "Run with bad license URL"}
				</button>
			</div>
			<video
				ref={videoRef}
				controls
				style={{ width: "100%", maxWidth: 960, background: "black" }}
			/>
			<div style={{ marginTop: 12 }}>
				<p>Status: {status}</p>
				<p style={{ opacity: 0.7, wordBreak: "break-all" }}>
					MPD: {WIDEVINE_DEMO.mpdUrl}
				</p>
				{error ? <p style={{ color: "#b00020" }}>{error}</p> : null}
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
