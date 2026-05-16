const fs = require("fs");
const path = require("path");

const keysPath = path.resolve(__dirname, "../../..", "ffout/drm/keys.json");
const hex16Bytes = /^[0-9a-f]{32}$/;
const uuidShape =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const base64urlSafe = /^[A-Za-z0-9_-]+$/;

function fail(message) {
	console.error(message);
	process.exit(1);
}

function decodeBase64Url(value) {
	const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
	const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
	return Buffer.from(normalized + padding, "base64");
}

if (!fs.existsSync(keysPath)) {
	fail("Run yarn drm:keygen first.");
}

let keys;
try {
	keys = JSON.parse(fs.readFileSync(keysPath, "utf8"));
} catch {
	fail("keys.json is not valid JSON.");
}

if (!hex16Bytes.test(keys.kid_hex || "")) {
	fail("kid_hex must be 32 lowercase hex chars.");
}

if (!hex16Bytes.test(keys.key_hex || "")) {
	fail("key_hex must be 32 lowercase hex chars.");
}

if (!uuidShape.test(keys.kid_uuid || "")) {
	fail("kid_uuid must match UUID shape.");
}

for (const field of ["kid_base64url", "key_base64url"]) {
	const value = keys[field];
	if (typeof value !== "string" || !base64urlSafe.test(value)) {
		fail(`${field} must be base64url-safe.`);
	}

	const decoded = decodeBase64Url(value);
	if (decoded.length !== 16) {
		fail(`${field} must decode to 16 bytes.`);
	}
}

console.log("OK: DRM key file is valid");
