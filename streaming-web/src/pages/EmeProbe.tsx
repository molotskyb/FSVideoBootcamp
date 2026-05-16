import { useEffect, useState } from "react";

type ProbeStatus = "checking" | "supported" | "not-supported";

type ProbeResult = {
	keySystem: string;
	label: string;
	status: ProbeStatus;
};

const KEY_SYSTEMS = [
	{ keySystem: "com.widevine.alpha", label: "Widevine" },
	{ keySystem: "com.microsoft.playready", label: "PlayReady" },
	{ keySystem: "com.apple.fps.1_0", label: "FairPlay Streaming" },
] as const;

const PROBE_CONFIG: MediaKeySystemConfiguration = {
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

const PROBE_TIMEOUT_MS = 5000;

function labelForStatus(status: ProbeStatus) {
	if (status === "checking") return "checking";
	if (status === "supported") return "supported";
	return "not supported";
}

function probeKeySystem(
	requestAccess: typeof navigator.requestMediaKeySystemAccess,
	keySystem: string
) {
	return Promise.race([
		requestAccess.call(navigator, keySystem, [PROBE_CONFIG]).then(() => true),
		new Promise<false>((resolve) => {
			window.setTimeout(() => resolve(false), PROBE_TIMEOUT_MS);
		}),
	]).catch(() => false);
}

export default function EmeProbe() {
	const [results, setResults] = useState<ProbeResult[]>(
		KEY_SYSTEMS.map(({ keySystem, label }) => ({
			keySystem,
			label,
			status: "checking",
		}))
	);
	const [emeMissing, setEmeMissing] = useState(false);

	useEffect(() => {
		const requestAccess = navigator.requestMediaKeySystemAccess;
		if (typeof requestAccess !== "function") {
			setEmeMissing(true);
			setResults((current) =>
				current.map((result) => ({ ...result, status: "not-supported" }))
			);
			return;
		}

		let active = true;

		for (const { keySystem } of KEY_SYSTEMS) {
			probeKeySystem(requestAccess, keySystem).then((supported) => {
				if (!active) {
					return;
				}

				console.log(
					JSON.stringify({
						type: "eme.probe",
						keySystem,
						supported,
					})
				);

				setResults((current) =>
					current.map((result) =>
						result.keySystem === keySystem
							? {
									...result,
									status: supported ? "supported" : "not-supported",
								}
							: result
					)
				);
			});
		}

		return () => {
			active = false;
		};
	}, []);

	return (
		<section>
			<h2>EME Capability Probe</h2>
			{emeMissing ? (
				<p style={{ color: "#b00020" }}>
					This browser does not expose navigator.requestMediaKeySystemAccess, so
					EME capability probing is unavailable.
				</p>
			) : null}
			<ul style={{ paddingLeft: 20 }}>
				{results.map((result) => (
					<li key={result.keySystem}>
						<strong>{result.label}</strong> ({result.keySystem}):{" "}
						{labelForStatus(result.status)}
					</li>
				))}
			</ul>
			<p style={{ opacity: 0.7 }}>
				These results are browser and device capability hints, not guaranteed
				playback results.
			</p>
		</section>
	);
}
