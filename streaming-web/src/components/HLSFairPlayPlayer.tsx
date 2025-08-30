// src/components/HLSFairPlayPlayer.tsx
import { useEffect, useRef } from "react";
import MetricsOverlay from "./MetricsOverlay";
import { useHtml5Metrics } from "../hooks/useHtml5Metrics";
import "./videoFrame.css";

type FPSConfig = {
	certUrl: string;
	licenseUrl: string;
	headers?: Record<string, string>;
	useBase64?: boolean; // set true if your server expects base64 SPC/returns base64 CKC
};

function isSafari() {
	const ua = navigator.userAgent;
	return /Safari/i.test(ua) && !/Chrome|CriOS|Android/i.test(ua);
}

function abToB64(buf: ArrayBuffer) {
	const bytes = new Uint8Array(buf);
	let bin = "";
	for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
	return btoa(bin);
}
function b64ToAb(b64: string) {
	const bin = atob(b64);
	const bytes = new Uint8Array(bin.length);
	for (let i = 0; i < bytes.length; i++) bytes[i] = bin.charCodeAt(i);
	return bytes.buffer;
}

type Props = { src: string; fps: FPSConfig };

export default function HLSFairPlayPlayer({ src, fps }: Props) {
	const ref = useRef<HTMLVideoElement | null>(null);
	const metrics = useHtml5Metrics(ref, true);

	useEffect(() => {
		const video = ref.current!;
		if (!video) return;

		if (!isSafari()) {
			console.warn("FairPlay requires Safari.");
			video.src = src;
			return;
		}

		let mediaKeys: MediaKeys | null = null;
		let session: MediaKeySession | null = null;

		const onEncrypted = async (ev: MediaEncryptedEvent) => {
			if (!mediaKeys || !ev.initData) return;
			session = mediaKeys.createSession("temporary");
			session.addEventListener("message", async (mev) => {
				let body: BodyInit = mev.message;
				let headers: HeadersInit = {
					"Content-Type": "application/octet-stream",
					...(fps.headers || {}),
				};
				if (fps.useBase64) {
					body = abToB64(mev.message);
					headers = { "Content-Type": "text/plain", ...(fps.headers || {}) };
				}
				const res = await fetch(fps.licenseUrl, {
					method: "POST",
					headers,
					body,
				});
				const ckc = fps.useBase64
					? b64ToAb(await res.text())
					: await res.arrayBuffer();
				await session!.update(new Uint8Array(ckc));
			});
			await session.generateRequest(ev.initDataType, ev.initData);
		};

		(async () => {
			const access = await navigator.requestMediaKeySystemAccess(
				"com.apple.fps.1_0",
				[
					{
						initDataTypes: ["skd"],
						videoCapabilities: [
							{ contentType: "video/mp4" },
							{ contentType: 'video/mp4; codecs="avc1.42E01E"' },
							{ contentType: 'video/mp4; codecs="avc1.4d401e"' },
						],
						distinctiveIdentifier: "optional",
						persistentState: "optional",
						sessionTypes: ["temporary"],
					},
				]
			);
			mediaKeys = await access.createMediaKeys();
			await video.setMediaKeys(mediaKeys);
			const certRes = await fetch(fps.certUrl, { headers: fps.headers });
			const cert = new Uint8Array(await certRes.arrayBuffer());
			await mediaKeys.setServerCertificate(cert);

			// Important: attach encrypted listener BEFORE setting src
			video.addEventListener("encrypted", onEncrypted);
			video.src = src;
		})().catch(console.error);

		return () => {
			video.removeEventListener("encrypted", onEncrypted);
			try {
				session?.close();
			} catch {
				// Ignore errors when closing the session
			}
		};
	}, [src, fps]);

	return (
		<div className="vf-frame">
			<video ref={ref} className="vf-video" controls playsInline />
			<MetricsOverlay metrics={metrics} info={{ url: src }} />
		</div>
	);
}
