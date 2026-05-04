const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(projectRoot, "..");

function readCloudFrontDomain() {
	const primary = path.join(workspaceRoot, "ffout", "aws", "ffout_cf_domain.txt");
	const fallback = path.join(workspaceRoot, "ffout_cf_domain.txt");
	const filePath = fs.existsSync(primary) ? primary : fallback;

	if (!fs.existsSync(filePath)) {
		throw new Error(
			"CloudFront domain file not found: ../ffout/aws/ffout_cf_domain.txt (or legacy ../ffout_cf_domain.txt)",
		);
	}

	return fs.readFileSync(filePath, "utf8").trim();
}

function getS3WebsiteUrl(bucket, region) {
	return region === "us-east-1"
		? `http://${bucket}.s3-website-us-east-1.amazonaws.com/index.html`
		: `http://${bucket}.s3-website-${region}.amazonaws.com/index.html`;
}

function headRequest(url) {
	const output = execFileSync("curl", ["-sI", url], {
		cwd: projectRoot,
		encoding: "utf8",
	});
	const lines = output.split(/\r?\n/).filter(Boolean);
	const statusLine = lines.find((line) => /^HTTP\//i.test(line)) || "";
	const contentTypeLine =
		lines.find((line) => /^content-type:/i.test(line)) || "";
	const status = Number.parseInt(statusLine.split(/\s+/)[1] || "", 10);
	const contentType = contentTypeLine
		.split(":")
		.slice(1)
		.join(":")
		.trim()
		.split(";")[0];

	return {
		status: Number.isFinite(status) ? status : 0,
		contentType: contentType || "unknown",
	};
}

function printResult(label, result, ok, detail) {
	const suffix = detail ? ` ${detail}` : "";
	const line = `${label}: ${result.status || "ERR"} (${result.contentType})${suffix}`;

	if (ok) {
		console.log(line);
		return;
	}

	console.error(`FAIL ${line}`);
}

function main() {
	const region = process.env.AWS_REGION || "us-east-1";
	const bucket = process.env.S3_BUCKET;
	const cfDomain = readCloudFrontDomain();
	const checks = [];

	if (!bucket) {
		console.warn("WARN S3_BUCKET not set");
		checks.push({
			label: "S3 index",
			result: { status: 0, contentType: "missing bucket" },
			ok: false,
			detail: "S3_BUCKET missing",
		});
	} else {
		const s3Result = headRequest(getS3WebsiteUrl(bucket, region));
		checks.push({
			label: "S3 index",
			result: s3Result,
			ok: s3Result.status === 200,
		});
	}

	const cfBase = `https://${cfDomain}`;
	const cfIndex = headRequest(`${cfBase}/index.html`);
	const hlsCanary = headRequest(`${cfBase}/media/canary/hls/master.m3u8`);
	const dashCanary = headRequest(`${cfBase}/media/canary/dash/stream.mpd`);
	const qoeAppShell = headRequest(`${cfBase}/`);

	checks.push(
		{ label: "CloudFront index", result: cfIndex, ok: cfIndex.status === 200 },
		{ label: "HLS canary", result: hlsCanary, ok: hlsCanary.status === 200 },
		{ label: "DASH canary", result: dashCanary, ok: dashCanary.status === 200 },
		{
			label: "QoE app shell",
			result: qoeAppShell,
			ok:
				qoeAppShell.status === 200 &&
				qoeAppShell.contentType.toLowerCase().includes("text/html"),
		},
	);

	let failed = false;
	for (const check of checks) {
		printResult(check.label, check.result, check.ok, check.detail);
		if (!check.ok) {
			failed = true;
		}
	}

	if (failed) {
		process.exit(1);
	}
}

main();
