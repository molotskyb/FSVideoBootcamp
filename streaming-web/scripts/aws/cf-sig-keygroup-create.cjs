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

const publicKeyIdPath = resolveExistingFilePath(
	getAwsOutputFilePath("ffout_cf_pubkey_id.txt"),
	getWorkspaceFilePath("ffout_cf_pubkey_id.txt"),
);
const publicKeyId = readRequiredFile(
	publicKeyIdPath,
	"../ffout/aws/ffout_cf_pubkey_id.txt (or legacy ../ffout_cf_pubkey_id.txt)",
).trim();

const stamp = String(Date.now());
const configPath = getAwsOutputFilePath("ffout_cf_keygroup_config.json");
const responsePath = getAwsOutputFilePath("ffout_cf_keygroup_create.json");
const keyGroupIdPath = getAwsOutputFilePath("ffout_cf_keygroup_id.txt");

const keyGroupConfig = {
	Name: `bootcamp-cf-keygroup-${stamp}`,
	Items: [publicKeyId],
	Comment: "bootcamp CloudFront trusted key group",
};

console.log(`Writing CloudFront key group config to ${configPath}`);
writeJson(configPath, keyGroupConfig);

const responseText = run(
	`aws cloudfront create-key-group --key-group-config file://${getAwsOutputProjectRelativePath("ffout_cf_keygroup_config.json")}`,
	{ capture: true },
);

console.log(`Writing raw create response to ${responsePath}`);
writeText(responsePath, responseText);

const response = JSON.parse(responseText);
const keyGroupId = response.KeyGroup?.Id;

if (!keyGroupId) {
	throw new Error("CloudFront key group ID missing from create-key-group response");
}

writeText(keyGroupIdPath, `${keyGroupId}\n`);

console.log(`Created CloudFront key group ${keyGroupId}`);
