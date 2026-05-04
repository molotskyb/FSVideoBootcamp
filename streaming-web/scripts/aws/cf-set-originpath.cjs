const {
	getAwsOutputFilePath,
	readRequiredFile,
	writeJson,
} = require("./_common.cjs");

const originPath = process.argv[2];

if (typeof originPath !== "string" || (originPath !== "" && !originPath.startsWith("/"))) {
	console.error('Usage: node scripts/aws/cf-set-originpath.cjs "/v1"');
	process.exit(1);
}

const configPath = getAwsOutputFilePath("ffout_cf_cfg.json");
const updatePath = getAwsOutputFilePath("ffout_cf_update.json");
const config = JSON.parse(
	readRequiredFile(configPath, "../ffout/aws/ffout_cf_cfg.json"),
);
const origin = config?.Origins?.Items?.find(
	(item) => item && item.Id === "s3-website-origin",
);

if (!origin) {
	throw new Error('Origin with Id "s3-website-origin" not found');
}

origin.OriginPath = originPath;

writeJson(updatePath, config);

console.log(`OriginPath -> ${originPath === "" ? "<empty>" : originPath}`);
