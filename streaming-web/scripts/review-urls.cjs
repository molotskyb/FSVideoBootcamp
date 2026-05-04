const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(projectRoot, "..");

function readCloudFrontDomain() {
	const primary = path.join(workspaceRoot, "ffout", "aws", "ffout_cf_domain.txt");
	const fallback = path.join(workspaceRoot, "ffout_cf_domain.txt");
	const filePath = fs.existsSync(primary) ? primary : fallback;

	if (!fs.existsSync(filePath)) {
		return "<CF_DOMAIN_MISSING>";
	}

	return fs.readFileSync(filePath, "utf8").trim() || "<CF_DOMAIN_MISSING>";
}

function getS3WebsiteUrl(bucket, region) {
	return region === "us-east-1"
		? `http://${bucket}.s3-website-us-east-1.amazonaws.com/`
		: `http://${bucket}.s3-website-${region}.amazonaws.com/`;
}

const region = process.env.AWS_REGION || "us-east-1";
const bucket = process.env.S3_BUCKET || "unset";
const cfDomain = readCloudFrontDomain();
const cfRoot = `https://${cfDomain}/`;

const urls = {
	s3_root: getS3WebsiteUrl(bucket, region),
	cf_root: cfRoot,
	hls_canary: `${cfRoot}media/canary/hls/master.m3u8`,
	dash_canary: `${cfRoot}media/canary/dash/stream.mpd`,
	qoe: `${cfRoot}qoe`,
};

console.log(JSON.stringify(urls, null, 2));
