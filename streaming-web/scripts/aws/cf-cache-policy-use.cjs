const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "..", "..");
const workspaceRoot = path.resolve(projectRoot, "..");

function readRequiredFile(filePath, label = filePath) {
	if (!fs.existsSync(filePath)) {
		throw new Error(`Required file not found: ${label}`);
	}

	return fs.readFileSync(filePath, "utf8");
}

const distributionIdPath = fs.existsSync(
	path.join(workspaceRoot, "ffout", "aws", "ffout_cf_id.txt"),
)
	? path.join(workspaceRoot, "ffout", "aws", "ffout_cf_id.txt")
	: path.join(workspaceRoot, "ffout_cf_id.txt");
const cachePolicyIdPath = fs.existsSync(
	path.join(workspaceRoot, "ffout", "aws", "ffout_cf_cache_policy_id.txt"),
)
	? path.join(workspaceRoot, "ffout", "aws", "ffout_cf_cache_policy_id.txt")
	: path.join(workspaceRoot, "ffout_cf_cache_policy_id.txt");

const distributionId = readRequiredFile(
	distributionIdPath,
	"../ffout/aws/ffout_cf_id.txt (or legacy ../ffout_cf_id.txt)",
).trim();
const cachePolicyId = readRequiredFile(
	cachePolicyIdPath,
	"../ffout/aws/ffout_cf_cache_policy_id.txt (or legacy ../ffout_cf_cache_policy_id.txt)",
).trim();

console.log(`Fetching current config for distribution ${distributionId}`);
const fetched = JSON.parse(
	execFileSync(
		"aws",
		["cloudfront", "get-distribution-config", "--id", distributionId],
		{
			cwd: projectRoot,
			encoding: "utf8",
		},
	),
);

const etag = fetched.ETag;
const distributionConfig = fetched.DistributionConfig;

if (!etag) {
	throw new Error("ETag missing from get-distribution-config response");
}

if (!distributionConfig?.DefaultCacheBehavior) {
	throw new Error("DefaultCacheBehavior missing from distribution config");
}

distributionConfig.DefaultCacheBehavior.CachePolicyId = cachePolicyId;
delete distributionConfig.DefaultCacheBehavior.ForwardedValues;

const update = JSON.parse(
	execFileSync(
	"aws",
	[
		"cloudfront",
		"update-distribution",
		"--id",
		distributionId,
		"--if-match",
		etag,
		"--distribution-config",
		JSON.stringify(distributionConfig),
	],
	{
		cwd: projectRoot,
		encoding: "utf8",
	},
	),
);

console.log(
	JSON.stringify(
		{
			Id: update.Distribution?.Id,
			Status: update.Distribution?.Status,
			DomainName: update.Distribution?.DomainName,
		},
		null,
		2,
	),
);
