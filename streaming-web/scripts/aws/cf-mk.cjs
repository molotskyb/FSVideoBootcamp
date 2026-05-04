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

const configPath = getAwsOutputFilePath("ffout_cf_dist.json");
const createPath = getAwsOutputFilePath("ffout_cf_create.json");
const idPath = getAwsOutputFilePath("ffout_cf_id.txt");
const domainPath = getAwsOutputFilePath("ffout_cf_domain.txt");
const configCliPath = getAwsOutputProjectRelativePath("ffout_cf_dist.json");
const legacyConfigPath = getWorkspaceFilePath("ffout_cf_dist.json");

const configSourcePath = resolveExistingFilePath(configPath, legacyConfigPath);
const configText = readRequiredFile(
	configSourcePath,
	`${configCliPath} (or legacy ../ffout_cf_dist.json)`,
);
const configJson = JSON.parse(configText);
const distributionConfig =
	configJson.DistributionConfig ?? configJson;
let normalized = configSourcePath !== configPath || Boolean(configJson.DistributionConfig);

for (const origin of distributionConfig.Origins?.Items ?? []) {
	const customOrigin = origin.CustomOriginConfig;

	if (customOrigin?.OriginSSLProtocols && !customOrigin.OriginSslProtocols) {
		customOrigin.OriginSslProtocols = customOrigin.OriginSSLProtocols;
		delete customOrigin.OriginSSLProtocols;
		normalized = true;
	}
}

for (const errorResponse of distributionConfig.CustomErrorResponses?.Items ?? []) {
	if (
		errorResponse.ResponseCode !== undefined &&
		typeof errorResponse.ResponseCode !== "string"
	) {
		errorResponse.ResponseCode = String(errorResponse.ResponseCode);
		normalized = true;
	}
}

if (normalized) {
	console.log(`Normalizing CloudFront config at ${configPath}`);
	writeJson(configPath, distributionConfig);
}

console.log(`Creating CloudFront distribution from ${configPath}`);
const responseText = run(
	`aws cloudfront create-distribution --distribution-config file://${configCliPath}`,
	{ capture: true },
);

console.log(`Writing raw create response to ${createPath}`);
writeText(createPath, responseText);

const response = JSON.parse(responseText);
const distributionId = response.Distribution.Id;
const domainName = response.Distribution.DomainName;

writeText(idPath, `${distributionId}\n`);
writeText(domainPath, `${domainName}\n`);

console.log(`Created distribution ID ${distributionId}`);
console.log(`Created distribution domain ${domainName}`);
