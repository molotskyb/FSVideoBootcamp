const fs = require("fs");
const path = require("path");

const mpdPath = path.resolve(__dirname, "../../..", "ffout/pssh/stream.mpd");
const knownSystemIds = {
	"edef8ba9-79d6-4ace-a3c8-27dcd51d21ed": "Widevine",
	"9a04f079-9840-4286-ab92-e65be0885f95": "PlayReady",
};

function fail(message) {
	console.error(message);
	process.exit(1);
}

function toUuid(buffer) {
	const hex = buffer.toString("hex");
	return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(
		12,
		16
	)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function parsePssh(base64, index) {
	const box = Buffer.from(base64.replace(/\s+/g, ""), "base64");
	if (box.length < 28) {
		fail(`PSSH[${index}] is too short.`);
	}

	const size = box.readUInt32BE(0);
	const type = box.toString("ascii", 4, 8);
	if (type !== "pssh") {
		fail(`PSSH[${index}] box type is ${type}, expected pssh.`);
	}

	if (size !== 0 && size > box.length) {
		fail(`PSSH[${index}] box size is invalid.`);
	}

	const systemId = toUuid(box.subarray(12, 28));
	return systemId;
}

if (!fs.existsSync(mpdPath)) {
	fail("Missing MPD: ../ffout/pssh/stream.mpd");
}

const mpd = fs.readFileSync(mpdPath, "utf8");
const psshValues = [...mpd.matchAll(/<cenc:pssh[^>]*>([\s\S]*?)<\/cenc:pssh>/g)].map(
	(match) => match[1].trim()
);

if (psshValues.length === 0) {
	fail("No PSSH found in ../ffout/pssh/stream.mpd");
}

let foundKnownSystem = false;

psshValues.forEach((value, index) => {
	const systemId = parsePssh(value, index);
	const label = knownSystemIds[systemId] || "Unknown";
	if (label !== "Unknown") {
		foundKnownSystem = true;
	}
	console.log(`PSSH[${index}] ${label} ${systemId}`);
});

if (!foundKnownSystem) {
	fail("No Widevine or PlayReady PSSH found.");
}
