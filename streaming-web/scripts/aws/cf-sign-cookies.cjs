const crypto = require("crypto");
const {
	getAwsOutputFilePath,
	getWorkspaceFilePath,
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

function toCloudFrontBase64(value) {
	return Buffer.from(value)
		.toString("base64")
		.replace(/\+/g, "-")
		.replace(/=/g, "_")
		.replace(/\//g, "~");
}

function getDomain() {
	return (process.env.CF_DOMAIN || readOutput("ffout_cf_domain.txt")).trim();
}

function getKeyPairId() {
	return (
		process.env.CF_KEY_PAIR_ID ||
		process.env.CF_PUBKEY_ID ||
		readOutput("ffout_cf_pubkey_id.txt")
	).trim();
}

function getPrivateKey() {
	const privateKeyPath = resolveExistingFilePath(
		process.env.CF_PRIVATE_KEY_PATH ||
			getAwsOutputFilePath("ffout_cf_private_key.pem"),
		getWorkspaceFilePath("ffout_cf_private_key.pem"),
	);

	return {
		path: privateKeyPath,
		value: readRequiredFile(
			privateKeyPath,
			process.env.CF_PRIVATE_KEY_PATH ||
				"../ffout/aws/ffout_cf_private_key.pem (or legacy ../ffout_cf_private_key.pem)",
		),
	};
}

const domain = getDomain();
const keyPairId = getKeyPairId();
const privateKey = getPrivateKey();
const ttlSeconds = Number.parseInt(process.env.CF_TTL || "300", 10);
const scopePath = process.env.CF_COOKIE_PATH || "/hls/*";
const manifestPath = process.env.CF_TEST_PATH || "/hls/master.m3u8";

if (!Number.isInteger(ttlSeconds) || ttlSeconds <= 0) {
	throw new Error("CF_TTL must be a positive integer number of seconds");
}

const resourcePath = scopePath.startsWith("/") ? scopePath : `/${scopePath}`;
const resourceUrl = `https://${domain}${resourcePath}`;
const manifestUrl = `https://${domain}${manifestPath.startsWith("/") ? manifestPath : `/${manifestPath}`}`;
const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
const policy = JSON.stringify({
	Statement: [
		{
			Resource: resourceUrl,
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

const cookies = {
	"CloudFront-Policy": toCloudFrontBase64(policy),
	"CloudFront-Signature": toCloudFrontBase64(signer.sign(privateKey.value)),
	"CloudFront-Key-Pair-Id": keyPairId,
};

const bundle = {
	domain,
	manifestUrl,
	resourceUrl,
	expires,
	privateKeyPath: privateKey.path,
	cookies,
	demoUrl: `https://${domain}/app/#/auth/stream?cfDomain=${encodeURIComponent(domain)}&cfExpires=${encodeURIComponent(String(expires))}&cfPolicy=${encodeURIComponent(cookies["CloudFront-Policy"])}&cfSignature=${encodeURIComponent(cookies["CloudFront-Signature"])}&cfKeyPairId=${encodeURIComponent(cookies["CloudFront-Key-Pair-Id"])}`,
};

const jsonPath = getAwsOutputFilePath("ffout_cf_signed_cookies.json");
const urlPath = getAwsOutputFilePath("ffout_cf_auth_stream_url.txt");

writeJson(jsonPath, bundle);
writeText(urlPath, `${bundle.demoUrl}\n`);

console.log(`CloudFront domain: ${domain}`);
console.log(`Manifest URL: ${manifestUrl}`);
console.log(`Cookie scope: ${resourceUrl}`);
console.log(`Expires: ${expires}`);
console.log(`Wrote ${jsonPath}`);
console.log(`Wrote ${urlPath}`);
console.log(bundle.demoUrl);
