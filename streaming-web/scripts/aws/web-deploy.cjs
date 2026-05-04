const fs = require("fs");
const path = require("path");
const {
	getAwsOutputFilePath,
	getBucketAndRegion,
	getWorkspaceFilePath,
	projectRoot,
	resolveExistingFilePath,
	run,
} = require("./_common.cjs");

const { bucket } = getBucketAndRegion();
const distDir = path.join(projectRoot, "dist");
const webPrefix = (process.env.WEB_PREFIX || "").replace(/^\/+|\/+$/g, "");
const distributionIdPath = resolveExistingFilePath(
	getAwsOutputFilePath("ffout_cf_id.txt"),
	getWorkspaceFilePath("ffout_cf_id.txt"),
);

if (!webPrefix) {
	throw new Error("WEB_PREFIX env required");
}

run("yarn -s web:build");

if (!fs.existsSync(distDir)) {
	throw new Error("dist/ not found after web:build");
}

console.log(`Syncing dist/ to s3://${bucket}/${webPrefix}/`);
run(`aws s3 sync dist/ s3://${bucket}/${webPrefix}/ --delete --cache-control max-age=60`);

if (fs.existsSync(distributionIdPath)) {
	console.log("Invalidating CloudFront");
	run("yarn -s cf:invalidate");
} else {
	console.log("Skipping CloudFront invalidation (CloudFront id not found)");
}
