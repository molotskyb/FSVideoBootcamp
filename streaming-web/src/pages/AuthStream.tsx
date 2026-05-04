import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

type CheckState = {
	status: number | null;
	message: string;
};

type CookieBundle = {
	domain: string | null;
	expires: string | null;
	policy: string | null;
	signature: string | null;
	keyPairId: string | null;
};

const manifestPath = "/hls/master.m3u8";
const cookieNames = [
	"CloudFront-Policy",
	"CloudFront-Signature",
	"CloudFront-Key-Pair-Id",
] as const;

function readCookieBundle(search: string): CookieBundle {
	const params = new URLSearchParams(search);

	return {
		domain: params.get("cfDomain"),
		expires: params.get("cfExpires"),
		policy: params.get("cfPolicy"),
		signature: params.get("cfSignature"),
		keyPairId: params.get("cfKeyPairId"),
	};
}

function setCookie(name: string, value: string, maxAge?: number) {
	const secure = window.location.protocol === "https:" ? "; Secure" : "";
	const maxAgePart =
		typeof maxAge === "number" && maxAge > 0 ? `; Max-Age=${maxAge}` : "";

	document.cookie = `${name}=${value}; Path=/; SameSite=Lax${secure}${maxAgePart}`;
}

function clearCookie(name: string) {
	const secure = window.location.protocol === "https:" ? "; Secure" : "";
	document.cookie = `${name}=; Path=/; SameSite=Lax${secure}; Max-Age=0`;
}

export default function AuthStream() {
	const location = useLocation();
	const cookieBundle = useMemo(
		() => readCookieBundle(location.search),
		[location.search]
	);
	const manifestUrl = `${window.location.origin}${manifestPath}`;
	const [check, setCheck] = useState<CheckState>({
		status: null,
		message: "Ready",
	});
	const [cookieState, setCookieState] = useState("No signed cookies set in this browser session.");

	async function checkManifest(label = "Checked manifest access") {
		try {
			const response = await fetch(manifestPath, {
				method: "HEAD",
				cache: "no-store",
			});

			setCheck({
				status: response.status,
				message: `${label}: HTTP ${response.status}`,
			});
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Manifest check failed";

			setCheck({
				status: null,
				message,
			});
		}
	}

	function refreshCookieState() {
		const hasCookies = cookieNames.every((name) =>
			document.cookie.includes(`${name}=`)
		);

		setCookieState(
			hasCookies
				? "Signed cookies are set for this browser session."
				: "No signed cookies set in this browser session."
		);
	}

	function applySignedCookies() {
		if (!cookieBundle.policy || !cookieBundle.signature || !cookieBundle.keyPairId) {
			setCheck({
				status: null,
				message: "Missing signed cookie values in the demo URL.",
			});
			return;
		}

		const expiresAt = Number.parseInt(cookieBundle.expires || "", 10);
		const maxAge =
			Number.isFinite(expiresAt) && expiresAt > 0
				? Math.max(0, expiresAt - Math.floor(Date.now() / 1000))
				: undefined;

		setCookie("CloudFront-Policy", cookieBundle.policy, maxAge);
		setCookie("CloudFront-Signature", cookieBundle.signature, maxAge);
		setCookie("CloudFront-Key-Pair-Id", cookieBundle.keyPairId, maxAge);
		refreshCookieState();
		void checkManifest("Checked manifest access after setting signed cookies");
	}

	function clearSignedCookies() {
		for (const name of cookieNames) {
			clearCookie(name);
		}

		refreshCookieState();
		void checkManifest("Checked manifest access after clearing signed cookies");
	}

	useEffect(() => {
		refreshCookieState();
		void checkManifest("Checked manifest access on page load");
	}, []);

	const hostMismatch =
		cookieBundle.domain && cookieBundle.domain !== window.location.hostname;

	return (
		<>
			<h2>Auth Stream</h2>
			<p style={{ opacity: 0.8 }}>
				This demo checks the same protected manifest URL before and after
				signed cookies are present in the browser session.
			</p>
			<p style={{ wordBreak: "break-all" }}>Manifest: {manifestUrl}</p>
			<p>Session: {cookieState}</p>
			{hostMismatch && (
				<p style={{ color: "crimson" }}>
					Open this page on {cookieBundle.domain} so the browser can send the
					signed cookies to the protected HLS path.
				</p>
			)}
			<div
				style={{
					display: "flex",
					gap: 12,
					justifyContent: "center",
					flexWrap: "wrap",
				}}
			>
				<button onClick={() => void checkManifest()}>Check Manifest</button>
				<button onClick={applySignedCookies}>Set Signed Cookies</button>
				<button onClick={clearSignedCookies}>Clear Signed Cookies</button>
			</div>
			<p>Status: {check.status ?? "n/a"}</p>
			<p>{check.message}</p>
		</>
	);
}
