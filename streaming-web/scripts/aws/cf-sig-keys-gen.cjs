const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const {
	ensureDir,
	getAwsOutputFilePath,
} = require("./_common.cjs");

const privateKeyPath = getAwsOutputFilePath("ffout_cf_private_key.pem");
const publicKeyPath = getAwsOutputFilePath("ffout_cf_public_key.pem");

function runOpenSsl(args, options = {}) {
	const result = spawnSync("openssl", args, {
		stdio: options.stdio ?? "inherit",
	});

	if (result.error) {
		if (result.error.code === "ENOENT") {
			console.error(
				"openssl is required for cf:sig:keys:gen but was not found in PATH.",
			);
			process.exit(1);
		}

		throw result.error;
	}

	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
}

runOpenSsl(["version"], { stdio: "ignore" });
ensureDir(path.dirname(privateKeyPath));

console.log(`Generating CloudFront private key at ${privateKeyPath}`);
runOpenSsl(["genrsa", "-out", privateKeyPath, "2048"]);
fs.chmodSync(privateKeyPath, 0o600);

console.log(`Generating CloudFront public key at ${publicKeyPath}`);
runOpenSsl(["rsa", "-pubout", "-in", privateKeyPath, "-out", publicKeyPath]);

console.log(`Created ${privateKeyPath}`);
console.log(`Created ${publicKeyPath}`);
