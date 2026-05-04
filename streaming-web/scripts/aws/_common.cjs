const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "..", "..");
const workspaceRoot = path.resolve(projectRoot, "..");
const awsOutputRoot = path.join(workspaceRoot, "ffout", "aws");

function getBucketAndRegion() {
	const bucket = process.env.S3_BUCKET;
	const region = process.env.AWS_REGION || "us-east-1";

	if (!bucket) {
		throw new Error("S3_BUCKET env required");
	}

	if (!bucket.startsWith("fs-video-")) {
		throw new Error("Refusing to run. S3_BUCKET must start with fs-video-");
	}

	return { bucket, region };
}

function run(command, options = {}) {
	if (!options.silent) {
		console.log(`$ ${command}`);
	}

	return execSync(command, {
		stdio: options.capture ? ["inherit", "pipe", "inherit"] : "inherit",
		cwd: projectRoot,
		encoding: options.capture ? "utf8" : undefined,
	});
}

function ensureDir(dirPath) {
	fs.mkdirSync(dirPath, { recursive: true });
}

function getWebsiteOriginDomain(bucket, region) {
	return region === "us-east-1"
		? `${bucket}.s3-website-us-east-1.amazonaws.com`
		: `${bucket}.s3-website-${region}.amazonaws.com`;
}

function getWorkspaceFilePath(name) {
	return path.join(workspaceRoot, name);
}

function getAwsOutputFilePath(name) {
	return path.join(awsOutputRoot, name);
}

function getAwsOutputProjectRelativePath(name) {
	return path.posix.join("..", "ffout", "aws", name);
}

function resolveExistingFilePath(primaryPath, fallbackPath = primaryPath) {
	if (fs.existsSync(primaryPath) || primaryPath === fallbackPath) {
		return primaryPath;
	}

	return fs.existsSync(fallbackPath) ? fallbackPath : primaryPath;
}

function readRequiredFile(filePath, label = filePath) {
	if (!fs.existsSync(filePath)) {
		throw new Error(`Required file not found: ${label}`);
	}

	return fs.readFileSync(filePath, "utf8");
}

function writeText(filePath, value) {
	ensureDir(path.dirname(filePath));
	fs.writeFileSync(filePath, value);
}

function writeJson(filePath, value) {
	ensureDir(path.dirname(filePath));
	fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function sleep(ms) {
	Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

module.exports = {
	ensureDir,
	getAwsOutputFilePath,
	getAwsOutputProjectRelativePath,
	getBucketAndRegion,
	getWebsiteOriginDomain,
	getWorkspaceFilePath,
	projectRoot,
	readRequiredFile,
	resolveExistingFilePath,
	run,
	sleep,
	writeText,
	writeJson,
	awsOutputRoot,
	workspaceRoot,
};
