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

const publicKeyPath = resolveExistingFilePath(
	getAwsOutputFilePath("ffout_cf_public_key.pem"),
	getWorkspaceFilePath("ffout_cf_public_key.pem"),
);
const publicKeyPem = readRequiredFile(
	publicKeyPath,
	"../ffout/aws/ffout_cf_public_key.pem (or legacy ../ffout_cf_public_key.pem)",
).trim();

const stamp = String(Date.now());
const configPath = getAwsOutputFilePath("ffout_cf_public_key_config.json");
const responsePath = getAwsOutputFilePath("ffout_cf_public_key_create.json");
const publicKeyIdPath = getAwsOutputFilePath("ffout_cf_pubkey_id.txt");

const publicKeyConfig = {
	CallerReference: stamp,
	Name: `bootcamp-cf-pub-${stamp}`,
	EncodedKey: publicKeyPem,
	Comment: "bootcamp CloudFront public key",
};

console.log(`Writing CloudFront public key config to ${configPath}`);
writeJson(configPath, publicKeyConfig);

const responseText = run(
	`aws cloudfront create-public-key --public-key-config file://${getAwsOutputProjectRelativePath("ffout_cf_public_key_config.json")}`,
	{ capture: true },
);

console.log(`Writing raw create response to ${responsePath}`);
writeText(responsePath, responseText);

const response = JSON.parse(responseText);
const publicKeyId = response.PublicKey?.Id;

if (!publicKeyId) {
	throw new Error("CloudFront public key ID missing from create-public-key response");
}

writeText(publicKeyIdPath, `${publicKeyId}\n`);

console.log(`Created CloudFront public key ${publicKeyId}`);
