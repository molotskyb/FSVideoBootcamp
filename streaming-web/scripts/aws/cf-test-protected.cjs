const https = require("https");
const {
	getAwsOutputFilePath,
	getWorkspaceFilePath,
	readRequiredFile,
	resolveExistingFilePath,
} = require("./_common.cjs");

function readOutput(name, legacyName = name) {
	const primaryPath = getAwsOutputFilePath(name);
	const legacyPath = getWorkspaceFilePath(legacyName);
	const filePath = resolveExistingFilePath(primaryPath, legacyPath);
	const label = `../ffout/aws/${name} (or legacy ../${legacyName})`;

	return readRequiredFile(filePath, label).trim();
}

const domain = readOutput("ffout_cf_domain.txt");
const rawPath = process.env.CF_TEST_PATH || "/hls/master.m3u8";
const pathName = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
const url = new URL(pathName, `https://${domain}`);

console.log(`Checking unsigned access: ${url.toString()}`);

const request = https.request(
	url,
	{
		method: "HEAD",
	},
	(response) => {
		response.resume();

		console.log(response.statusCode);

		if (response.statusCode === 403) {
			console.log("PASS: HLS path is protected");
			process.exit(0);
		}

		console.error("FAIL: expected 403 for protected HLS path");
		process.exit(1);
	},
);

request.on("error", (error) => {
	console.error(`Request failed: ${error.message}`);
	process.exit(1);
});

request.end();
