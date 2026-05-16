const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const outDir = path.resolve(__dirname, "../../..", "ffout/ck");
const keysPath = path.join(outDir, "keys.json");

function toBase64Url(buffer) {
	return buffer
		.toString("base64")
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/g, "");
}

fs.mkdirSync(outDir, { recursive: true });

const kid = crypto.randomBytes(16);
const key = crypto.randomBytes(16);

const keys = {
	kid_hex: kid.toString("hex"),
	key_hex: key.toString("hex"),
	kid_base64url: toBase64Url(kid),
	key_base64url: toBase64Url(key),
};

fs.writeFileSync(keysPath, `${JSON.stringify(keys, null, 2)}\n`);

console.log("DEMO ONLY ClearKey values generated.");
console.log(`keys: ${keysPath}`);
console.log(`kid_hex: ${keys.kid_hex}`);
console.log(`key_hex: ${keys.key_hex}`);
console.log(`kid_base64url: ${keys.kid_base64url}`);
console.log(`key_base64url: ${keys.key_base64url}`);
console.log("DEMO ONLY: never expose production keys in app code or public media.");
