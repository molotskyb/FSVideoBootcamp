const fs = require("fs");
const path = require("path");

const tag = process.argv[2];
const keysPath = path.resolve(__dirname, "../../..", "ffout/drm/keys.json");

if (!tag || !/^[A-Za-z0-9_-]+$/.test(tag)) {
	console.error("Usage: yarn drm:keytag sample");
	console.error("Tag must use only letters, numbers, dash, and underscore.");
	process.exit(1);
}

if (!fs.existsSync(keysPath)) {
	console.error("Run yarn drm:keygen first.");
	process.exit(1);
}

const targetPath = path.resolve(
	__dirname,
	"../../..",
	`ffout/drm/${tag}.keys.json`
);

fs.copyFileSync(keysPath, targetPath);
console.log(`Wrote ../ffout/drm/${tag}.keys.json`);
