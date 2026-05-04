const {
	getAwsOutputFilePath,
	getAwsOutputProjectRelativePath,
	getWorkspaceFilePath,
	readRequiredFile,
	resolveExistingFilePath,
	run,
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
const fetchedConfigPath = getAwsOutputFilePath("ffout_cf_restrict_off_fetched.json");
const updateConfigPath = getAwsOutputFilePath("ffout_cf_restrict_off_update.json");
const updateResponsePath = getAwsOutputFilePath("ffout_cf_restrict_off_result.json");
const etagPath = getAwsOutputFilePath("ffout_cf_etag.txt");

console.log(`Fetching current config for distribution ${distributionId}`);
const fetchedText = run(
	`aws cloudfront get-distribution-config --id ${distributionId}`,
	{ capture: true, silent: true },
);

console.log(`Writing fetched config to ${fetchedConfigPath}`);
writeText(fetchedConfigPath, fetchedText);

const fetched = JSON.parse(fetchedText);
const etag = fetched.ETag;
const currentConfig = fetched.DistributionConfig;

if (!etag) {
	throw new Error("ETag missing from get-distribution-config response");
}

if (!currentConfig?.DefaultCacheBehavior) {
	throw new Error("DefaultCacheBehavior missing from distribution config");
}

writeText(etagPath, `${etag}\n`);

const nextConfig = JSON.parse(JSON.stringify(currentConfig));
nextConfig.DefaultCacheBehavior.TrustedKeyGroups = {
	Enabled: false,
	Quantity: 0,
};
nextConfig.DefaultCacheBehavior.TrustedSigners = {
	Enabled: false,
	Quantity: 0,
};

console.log(`Writing update config to ${updateConfigPath}`);
writeJson(updateConfigPath, nextConfig);

const updateText = run(
	`aws cloudfront update-distribution --id ${distributionId} --if-match ${etag} --distribution-config file://${getAwsOutputProjectRelativePath("ffout_cf_restrict_off_update.json")}`,
	{ capture: true },
);

console.log(`Writing raw update response to ${updateResponsePath}`);
writeText(updateResponsePath, updateText);

console.log(
	`Updated distribution ${distributionId}; DefaultCacheBehavior no longer requires trusted key groups.`,
);
