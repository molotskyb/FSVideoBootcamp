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

const HLS_PATH_PATTERN = "/hls/*";
const ALLOWED_METHODS = ["GET", "HEAD"];

function cloneJson(value) {
	return JSON.parse(JSON.stringify(value));
}

function readOutput(name, legacyName = name) {
	const primaryPath = getAwsOutputFilePath(name);
	const legacyPath = getWorkspaceFilePath(legacyName);
	const filePath = resolveExistingFilePath(primaryPath, legacyPath);
	const label = `../ffout/aws/${name} (or legacy ../${legacyName})`;

	return readRequiredFile(filePath, label).trim();
}

function readKeyGroupId() {
	const envKeyGroupId =
		process.env.CF_KEYGROUP_ID || process.env.CF_KEY_GROUP_ID;

	if (envKeyGroupId) {
		return envKeyGroupId.trim();
	}

	return readOutput("ffout_cf_keygroup_id.txt");
}

function normalizeCacheBehaviors(cacheBehaviors) {
	if (!cacheBehaviors || cacheBehaviors.Quantity === 0) {
		return [];
	}

	return Array.isArray(cacheBehaviors.Items) ? cacheBehaviors.Items : [];
}

function buildProtectedBehavior(sourceBehavior, keyGroupId) {
	const behavior = cloneJson(sourceBehavior);

	behavior.PathPattern = HLS_PATH_PATTERN;
	behavior.ViewerProtocolPolicy = "redirect-to-https";
	behavior.AllowedMethods = {
		Quantity: ALLOWED_METHODS.length,
		Items: ALLOWED_METHODS,
		CachedMethods: {
			Quantity: ALLOWED_METHODS.length,
			Items: ALLOWED_METHODS,
		},
	};
	behavior.TrustedKeyGroups = {
		Enabled: true,
		Quantity: 1,
		Items: [keyGroupId],
	};
	behavior.TrustedSigners = {
		Enabled: false,
		Quantity: 0,
	};

	return behavior;
}

function makeBehaviorPublic(behavior) {
	behavior.TrustedKeyGroups = {
		Enabled: false,
		Quantity: 0,
	};
	behavior.TrustedSigners = {
		Enabled: false,
		Quantity: 0,
	};
}

const distributionId = readOutput("ffout_cf_id.txt");
const keyGroupId = readKeyGroupId();
const fetchedConfigPath = getAwsOutputFilePath("ffout_cf_protect_hls_fetched.json");
const updateConfigPath = getAwsOutputFilePath("ffout_cf_protect_hls_update.json");
const updateResponsePath = getAwsOutputFilePath("ffout_cf_protect_hls_result.json");
const etagPath = getAwsOutputFilePath("ffout_cf_etag.txt");

console.log(`Distribution ID: ${distributionId}`);
console.log(`HLS path: ${HLS_PATH_PATTERN}`);
console.log(`Trusted key group: ${keyGroupId}`);
console.log("Fetching current CloudFront config");

const fetchedText = run(
	`aws cloudfront get-distribution-config --id ${distributionId}`,
	{ capture: true, silent: true },
);

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

const nextConfig = cloneJson(currentConfig);
const existingBehaviors = normalizeCacheBehaviors(nextConfig.CacheBehaviors);
const existingIndex = existingBehaviors.findIndex(
	(behavior) => behavior.PathPattern === HLS_PATH_PATTERN,
);
const sourceBehavior =
	existingIndex >= 0
		? existingBehaviors[existingIndex]
		: nextConfig.DefaultCacheBehavior;
const nextBehavior = buildProtectedBehavior(sourceBehavior, keyGroupId);
const nextBehaviors = [...existingBehaviors];
const action = existingIndex >= 0 ? "updated" : "created";

if (existingIndex >= 0) {
	nextBehaviors[existingIndex] = nextBehavior;
} else {
	nextBehaviors.unshift(nextBehavior);
}

nextConfig.CacheBehaviors = {
	...(nextConfig.CacheBehaviors || {}),
	Quantity: nextBehaviors.length,
	Items: nextBehaviors,
};
makeBehaviorPublic(nextConfig.DefaultCacheBehavior);

writeJson(updateConfigPath, nextConfig);

console.log(`Behavior ${action}: ${HLS_PATH_PATTERN}`);
console.log("DefaultCacheBehavior set to public");
console.log("Submitting CloudFront update");

const updateText = run(
	`aws cloudfront update-distribution --id ${distributionId} --if-match ${etag} --distribution-config file://${getAwsOutputProjectRelativePath("ffout_cf_protect_hls_update.json")}`,
	{ capture: true, silent: true },
);

writeText(updateResponsePath, updateText);

console.log(`Update accepted for distribution ${distributionId}`);
console.log("Waiting for deployment");
run("node scripts/aws/cf-wait.cjs", { silent: true });
