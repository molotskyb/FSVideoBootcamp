const { execFileSync } = require("child_process");
const {
	getAwsOutputFilePath,
	getWorkspaceFilePath,
	projectRoot,
	readRequiredFile,
	resolveExistingFilePath,
	writeJson,
	writeText,
} = require("./_common.cjs");

function readOutput(name, legacyName = name) {
	const primaryPath = getAwsOutputFilePath(name);
	const legacyPath = getWorkspaceFilePath(legacyName);
	const filePath = resolveExistingFilePath(primaryPath, legacyPath);
	const label = `../ffout/aws/${name} (or legacy ../${legacyName})`;

	return readRequiredFile(filePath, label).trim();
}

const distributionId = readOutput("ffout_cf_id.txt");
const responseText = execFileSync(
	"aws",
	["cloudfront", "get-distribution-config", "--id", distributionId],
	{
		cwd: projectRoot,
		encoding: "utf8",
	},
);
const response = JSON.parse(responseText);
const etag = response.ETag;
const distributionConfig = response.DistributionConfig;

if (!etag) {
	throw new Error("ETag missing from get-distribution-config response");
}

if (!distributionConfig) {
	throw new Error("DistributionConfig missing from get-distribution-config response");
}

writeText(getAwsOutputFilePath("ffout_cf_etag.txt"), `${etag}\n`);
writeJson(getAwsOutputFilePath("ffout_cf_cfg.json"), distributionConfig);

console.log(`Fetched config for distribution ${distributionId}`);
