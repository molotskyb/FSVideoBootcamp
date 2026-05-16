const fs = require("fs");
const path = require("path");

const keysPath = path.resolve(__dirname, "../../..", "ffout/drm/keys.json");

if (!fs.existsSync(keysPath)) {
	console.error("Run yarn drm:keygen first.");
	process.exit(1);
}

console.log(fs.readFileSync(keysPath, "utf8").trimEnd());
