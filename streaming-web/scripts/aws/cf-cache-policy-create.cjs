const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "..", "..");
const workspaceRoot = path.resolve(projectRoot, "..");
const cachePolicyIdPath = path.join(
	workspaceRoot,
	"ffout",
	"aws",
	"ffout_cf_cache_policy_id.txt",
);
const cachePolicyConfigPath = path.join(
	workspaceRoot,
	"ffout",
	"aws",
	"ffout_cf_cache_policy.json",
);

function writeJson(filePath, value) {
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(filePath, value) {
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	fs.writeFileSync(filePath, value);
}

const cachePolicyConfig = {
	Name: `streaming-web-query-v-${Date.now()}`,
	MinTTL: 0,
	DefaultTTL: 86400,
	MaxTTL: 31536000,
	ParametersInCacheKeyAndForwardedToOrigin: {
		EnableAcceptEncodingGzip: true,
		EnableAcceptEncodingBrotli: true,
		HeadersConfig: {
			HeaderBehavior: "none",
		},
		CookiesConfig: {
			CookieBehavior: "none",
		},
		QueryStringsConfig: {
			QueryStringBehavior: "whitelist",
			QueryStrings: {
				Quantity: 1,
				Items: ["v"],
			},
		},
	},
};

console.log(`Writing cache policy config to ${cachePolicyConfigPath}`);
writeJson(cachePolicyConfigPath, cachePolicyConfig);

console.log("Creating CloudFront cache policy");
const responseText = execFileSync(
	"aws",
	[
		"cloudfront",
		"create-cache-policy",
		"--cache-policy-config",
		`file://${cachePolicyConfigPath}`,
	],
	{
		cwd: projectRoot,
		encoding: "utf8",
	},
);

const response = JSON.parse(responseText);
const cachePolicyId = response.CachePolicy?.Id;

if (!cachePolicyId) {
	throw new Error("CachePolicy.Id missing from create-cache-policy response");
}

writeText(cachePolicyIdPath, `${cachePolicyId}\n`);

console.log(`Created cache policy ${cachePolicyId}`);
process.stdout.write(`${cachePolicyId}\n`);
