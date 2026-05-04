const crypto = require("crypto");
const {
	getAwsOutputFilePath,
	getWorkspaceFilePath,
	readRequiredFile,
	resolveExistingFilePath,
} = require("./_common.cjs");

function readOutput(name, legacyName = name) {
	const primaryPath = getAwsOutputFilePath(name);
	const legacyPath = getWorkspaceFilePath(legacyName);
	const filePath = resolveExistingFilePath(primaryPath, legacyPath);
	const label = `../ffout/aws/${name} (or legacy ../${legacyName})`;

	return readRequiredFile(filePath, label).trim();
}

function toCloudFrontBase64(value) {
	return Buffer.from(value)
		.toString("base64")
		.replace(/\+/g, "-")
		.replace(/=/g, "_")
		.replace(/\//g, "~");
}

const domain = readOutput("ffout_cf_domain.txt");
const keyPairId = readOutput("ffout_cf_pubkey_id.txt");
const privateKeyPath = resolveExistingFilePath(
	getAwsOutputFilePath("ffout_cf_private_key.pem"),
	getWorkspaceFilePath("ffout_cf_private_key.pem"),
);
const privateKey = readRequiredFile(
	privateKeyPath,
	"../ffout/aws/ffout_cf_private_key.pem (or legacy ../ffout_cf_private_key.pem)",
);

const rawPath = process.env.CF_PATH || "/index.html";
const ttlSeconds = Number.parseInt(process.env.CF_TTL || "300", 10);

if (!Number.isInteger(ttlSeconds) || ttlSeconds <= 0) {
	throw new Error("CF_TTL must be a positive integer number of seconds");
}

const normalizedPath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
const resourceUrl = new URL(normalizedPath, `https://${domain}`);
const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
const policy = JSON.stringify({
	Statement: [
		{
			Resource: resourceUrl.toString(),
			Condition: {
				DateLessThan: {
					"AWS:EpochTime": expires,
				},
			},
		},
	],
});

const signer = crypto.createSign("RSA-SHA1");
signer.update(policy);
signer.end();

resourceUrl.searchParams.set("Expires", String(expires));
resourceUrl.searchParams.set(
	"Signature",
	toCloudFrontBase64(signer.sign(privateKey)),
);
resourceUrl.searchParams.set("Key-Pair-Id", keyPairId);

process.stdout.write(`${resourceUrl.toString()}\n`);
