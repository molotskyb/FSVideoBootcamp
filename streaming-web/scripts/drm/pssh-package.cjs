const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "../..");
const ffoutDir = path.resolve(repoRoot, "..", "ffout");
const keysPath = path.join(ffoutDir, "drm/keys.json");
const psshDir = path.join(ffoutDir, "pssh");
const videoInput = path.join(ffoutDir, "output.mp4");
const audioInput = path.join(ffoutDir, "audio/sample_aac128.m4a");
const mpdOutput = path.join(psshDir, "stream.mpd");

function fail(message) {
	console.error(message);
	process.exit(1);
}

function requireFile(filePath, message) {
	if (!fs.existsSync(filePath)) {
		fail(message);
	}
}

requireFile(keysPath, "Run yarn drm:keygen first.");
requireFile(videoInput, `Missing input: ${videoInput}`);
requireFile(audioInput, `Missing input: ${audioInput}`);

const keys = JSON.parse(fs.readFileSync(keysPath, "utf8"));
if (!keys.kid_hex || !keys.key_hex) {
	fail("Run yarn drm:keygen first.");
}

fs.mkdirSync(path.join(psshDir, "audio"), { recursive: true });
fs.mkdirSync(path.join(psshDir, "video"), { recursive: true });

const args = [
	`input=${videoInput},stream=video,init_segment=${path.join(
		psshDir,
		"video/init.mp4"
	)},segment_template=${path.join(psshDir, "video/chunk-$Number$.m4s")}`,
	`input=${audioInput},stream=audio,init_segment=${path.join(
		psshDir,
		"audio/init.mp4"
	)},segment_template=${path.join(psshDir, "audio/chunk-$Number$.m4s")}`,
	"--enable_raw_key_encryption",
	"--keys",
	`label=:key_id=${keys.kid_hex}:key=${keys.key_hex}`,
	"--protection_scheme",
	"cenc",
	"--protection_systems",
	"Widevine,PlayReady",
	"--segment_duration",
	"2",
	"--fragment_duration",
	"2",
	"--generate_static_live_mpd",
	"--mpd_output",
	mpdOutput,
];

const result = spawnSync("packager", args, {
	cwd: repoRoot,
	stdio: "inherit",
});

if (result.error) {
	fail(result.error.message);
}

if (result.status !== 0) {
	process.exit(result.status ?? 1);
}

requireFile(mpdOutput, "Missing MPD: ../ffout/pssh/stream.mpd");

let mpd = fs.readFileSync(mpdOutput, "utf8");
mpd = mpd
	.replace(/type="dynamic"/, 'type="static"')
	.replace(/\s+publishTime="[^"]*"/g, "")
	.replace(/\s+availabilityStartTime="[^"]*"/g, "")
	.replace(/\s+minimumUpdatePeriod="[^"]*"/g, "")
	.replace(/\s+timeShiftBufferDepth="[^"]*"/g, "");
fs.writeFileSync(mpdOutput, mpd);

if (
	/type="dynamic"|minimumUpdatePeriod|timeShiftBufferDepth|availabilityStartTime/.test(
		mpd
	)
) {
	fail("Expected static MPD, but dynamic fields were found.");
}

console.log("Packaged encrypted DASH with PSSH");
console.log("MPD: ../ffout/pssh/stream.mpd");
