const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const outDir = path.resolve(__dirname, "../../..", "ffout/drm");
const keysPath = path.join(outDir, "keys.json");

function toBase64Url(buffer) {
	return buffer
		.toString("base64")
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/g, "");
}

function toUuid(hex) {
	return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(
		12,
		16
	)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

fs.mkdirSync(outDir, { recursive: true });

const kid = crypto.randomBytes(16);
const key = crypto.randomBytes(16);
const kidHex = kid.toString("hex");

const keys = {
	kid_hex: kidHex,
	key_hex: key.toString("hex"),
	kid_uuid: toUuid(kidHex),
	kid_base64url: toBase64Url(kid),
	key_base64url: toBase64Url(key),
	created_at: new Date().toISOString(),
	warning: "DEMO ONLY - do not use in production",
};

fs.writeFileSync(keysPath, `${JSON.stringify(keys, null, 2)}\n`);

console.log("Wrote ../ffout/drm/keys.json");
console.log(`KID ${keys.kid_uuid}`);
console.log("DEMO ONLY");
