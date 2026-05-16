const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "../..");
const ffoutDir = path.resolve(repoRoot, "..", "ffout");
const ckDir = path.join(ffoutDir, "ck");
const keysPath = path.join(ckDir, "keys.json");
const videoInput = path.join(ffoutDir, "output.mp4");
const audioInput = path.join(ffoutDir, "audio/sample_aac128.m4a");
const mpdOutput = path.join(ckDir, "stream.mpd");

function requireFile(filePath, label) {
	if (!fs.existsSync(filePath)) {
		console.error(`${label} missing: ${filePath}`);
		process.exit(1);
	}
}

requireFile(keysPath, "ClearKey keys");
requireFile(videoInput, "Video input");
requireFile(audioInput, "Audio input");

fs.mkdirSync(ckDir, { recursive: true });

const keys = JSON.parse(fs.readFileSync(keysPath, "utf8"));
if (!keys.kid_hex || !keys.key_hex) {
	console.error("keys.json must include kid_hex and key_hex.");
	process.exit(1);
}

const args = [
	`input=${videoInput},stream=video,init_segment=${path.join(
		ckDir,
		"init-video.mp4"
	)},segment_template=${path.join(ckDir, "chunk-video-$Number$.m4s")}`,
	`input=${audioInput},stream=audio,init_segment=${path.join(
		ckDir,
		"init-audio.mp4"
	)},segment_template=${path.join(ckDir, "chunk-audio-$Number$.m4s")}`,
	"--enable_raw_key_encryption",
	"--protection_scheme",
	"cenc",
	"--keys",
	`key_id=${keys.kid_hex}:key=${keys.key_hex}`,
	"--clear_lead",
	"0",
	"--segment_duration",
	"2",
	"--fragment_duration",
	"2",
	"--generate_static_live_mpd",
	"--mpd_output",
	mpdOutput,
];

console.log("DEMO ONLY: packaging ClearKey-encrypted DASH with raw demo keys.");

const result = spawnSync("packager", args, {
	cwd: repoRoot,
	stdio: "inherit",
});

if (result.error) {
	console.error(result.error.message);
	process.exit(1);
}

process.exit(result.status ?? 0);
