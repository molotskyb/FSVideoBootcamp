const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "../..");
const ffoutDir = path.resolve(repoRoot, "..", "ffout");
const ckDir = path.join(ffoutDir, "ck");
const publicCkDir = path.join(repoRoot, "public/media/ck");
const keysPath = path.join(ckDir, "keys.json");
const mpdPath = path.join(ckDir, "stream.mpd");
const publicMpdPath = path.join(publicCkDir, "stream.mpd");

function fail(message) {
	console.error(message);
	process.exit(1);
}

function assertFile(filePath, label) {
	if (!fs.existsSync(filePath)) {
		fail(`${label} missing: ${filePath}`);
	}
}

assertFile(keysPath, "ClearKey keys");
assertFile(mpdPath, "DASH MPD");
assertFile(publicMpdPath, "Published DASH MPD");

const keys = JSON.parse(fs.readFileSync(keysPath, "utf8"));
for (const field of ["kid_hex", "key_hex", "kid_base64url", "key_base64url"]) {
	if (!keys[field]) {
		fail(`keys.json missing ${field}`);
	}
}

const encryptedFiles = fs
	.readdirSync(ckDir)
	.filter((name) => /\.(mp4|m4s)$/i.test(name));
if (encryptedFiles.length === 0) {
	fail(`Encrypted media files or segments missing: ${ckDir}`);
}

const publishedFiles = fs
	.readdirSync(publicCkDir)
	.filter((name) => /\.(mp4|m4s)$/i.test(name));
if (publishedFiles.length === 0) {
	fail(`Published encrypted media files or segments missing: ${publicCkDir}`);
}

const mpd = fs.readFileSync(mpdPath, "utf8");
const hasProtectionMarkers =
	/ContentProtection|cenc:default_KID|mp4protection|urn:mpeg:dash:mp4protection/i.test(
		mpd
	);
if (!hasProtectionMarkers) {
	fail("DASH MPD missing ContentProtection or encryption-related markers.");
}

if (/type="dynamic"|availabilityStartTime|minimumUpdatePeriod|timeShiftBufferDepth/i.test(mpd)) {
	fail("DASH MPD is dynamic. ClearKey demo must publish a static VOD MPD.");
}

console.log("ClearKey keys: OK");
console.log("DASH MPD: OK");
console.log("Published media: OK");
console.log("Demo-only keys: OK");
