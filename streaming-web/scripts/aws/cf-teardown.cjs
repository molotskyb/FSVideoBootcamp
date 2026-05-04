const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const {
	getAwsOutputFilePath,
	getWorkspaceFilePath,
	projectRoot,
	writeText,
} = require("./_common.cjs");

function run(command, options = {}) {
	if (!options.silent) {
		console.log(`$ ${command}`);
	}

	return execSync(command, {
		cwd: projectRoot,
		encoding: options.capture ? "utf8" : undefined,
		stdio: options.capture ? ["inherit", "pipe", "pipe"] : "inherit",
	});
}

function findOutputPath(name) {
	const primaryPath = getAwsOutputFilePath(name);
	const legacyPath = getWorkspaceFilePath(name);

	if (fs.existsSync(primaryPath)) {
		return primaryPath;
	}

	return fs.existsSync(legacyPath) ? legacyPath : null;
}

function readOptionalOutput(name) {
	const filePath = findOutputPath(name);

	if (!filePath) {
		return null;
	}

	return {
		filePath,
		value: fs.readFileSync(filePath, "utf8").trim(),
	};
}

function getErrorText(error) {
	return [error.stdout, error.stderr, error.message]
		.filter(Boolean)
		.join("\n");
}

function isMissingResourceError(error) {
	return /(NoSuch|not found|does not exist|404)/i.test(getErrorText(error));
}

function safeDeleteFile(filePath, deletedFiles) {
	if (!fs.existsSync(filePath)) {
		return false;
	}

	fs.rmSync(filePath, { force: true });
	deletedFiles.push(path.relative(projectRoot, filePath));
	return true;
}

function deleteKeyGroup(keyGroupId, removed, skipped) {
	const getPath = getAwsOutputFilePath("ffout_cf_keygroup_get.json");

	try {
		console.log(`Fetching key group ${keyGroupId}`);
		const responseText = run(
			`aws cloudfront get-key-group --id ${keyGroupId}`,
			{ capture: true, silent: true },
		);
		writeText(getPath, responseText);

		const response = JSON.parse(responseText);
		const etag = response.ETag;

		if (!etag) {
			throw new Error("ETag missing from get-key-group response");
		}

		console.log(`Deleting key group ${keyGroupId}`);
		run(`aws cloudfront delete-key-group --id ${keyGroupId} --if-match ${etag}`);
		removed.push(`key group ${keyGroupId}`);
	} catch (error) {
		if (isMissingResourceError(error)) {
			console.log(`Skipping key group ${keyGroupId}; it was already absent.`);
			skipped.push(`key group ${keyGroupId}`);
			return;
		}

		throw error;
	}
}

function deletePublicKey(publicKeyId, removed, skipped) {
	const getPath = getAwsOutputFilePath("ffout_cf_public_key_get.json");

	try {
		console.log(`Fetching public key ${publicKeyId}`);
		const responseText = run(
			`aws cloudfront get-public-key --id ${publicKeyId}`,
			{ capture: true, silent: true },
		);
		writeText(getPath, responseText);

		const response = JSON.parse(responseText);
		const etag = response.ETag;

		if (!etag) {
			throw new Error("ETag missing from get-public-key response");
		}

		console.log(`Deleting public key ${publicKeyId}`);
		run(`aws cloudfront delete-public-key --id ${publicKeyId} --if-match ${etag}`);
		removed.push(`public key ${publicKeyId}`);
	} catch (error) {
		if (isMissingResourceError(error)) {
			console.log(`Skipping public key ${publicKeyId}; it was already absent.`);
			skipped.push(`public key ${publicKeyId}`);
			return;
		}

		throw error;
	}
}

const removed = [];
const skipped = [];
const deletedFiles = [];

try {
	console.log("Starting CloudFront signed-URL teardown");

	const distribution = readOptionalOutput("ffout_cf_id.txt");

	if (!distribution?.value) {
		console.log("Skipping distribution update; distribution ID file not found.");
		skipped.push("distribution restrict-off/wait");
	} else {
		try {
			run(`aws cloudfront get-distribution --id ${distribution.value}`, {
				capture: true,
				silent: true,
			});
			console.log(`Disabling signed-URL enforcement on distribution ${distribution.value}`);
			run("yarn -s cf:restrict:off");
			console.log(`Waiting for distribution ${distribution.value} to deploy`);
			run("yarn -s cf:wait");
			removed.push(`distribution trust on ${distribution.value}`);
		} catch (error) {
			if (isMissingResourceError(error)) {
				console.log(
					`Skipping distribution ${distribution.value}; it was already absent.`,
				);
				skipped.push(`distribution ${distribution.value}`);
			} else {
				throw error;
			}
		}
	}

	const keyGroup = readOptionalOutput("ffout_cf_keygroup_id.txt");

	if (!keyGroup?.value) {
		console.log("Skipping key group deletion; key group ID file not found.");
		skipped.push("key group deletion");
	} else {
		deleteKeyGroup(keyGroup.value, removed, skipped);
	}

	const publicKey = readOptionalOutput("ffout_cf_pubkey_id.txt");

	if (!publicKey?.value) {
		console.log("Skipping public key deletion; public key ID file not found.");
		skipped.push("public key deletion");
	} else {
		deletePublicKey(publicKey.value, removed, skipped);
	}

	for (const filePath of [
		getAwsOutputFilePath("ffout_cf_private_key.pem"),
		getAwsOutputFilePath("ffout_cf_public_key.pem"),
		getAwsOutputFilePath("ffout_cf_pubkey_id.txt"),
		getAwsOutputFilePath("ffout_cf_keygroup_id.txt"),
		getAwsOutputFilePath("ffout_cf_public_key_config.json"),
		getAwsOutputFilePath("ffout_cf_public_key_create.json"),
		getAwsOutputFilePath("ffout_cf_keygroup_config.json"),
		getAwsOutputFilePath("ffout_cf_keygroup_create.json"),
		getAwsOutputFilePath("ffout_cf_restrict_on_fetched.json"),
		getAwsOutputFilePath("ffout_cf_restrict_on_update.json"),
		getAwsOutputFilePath("ffout_cf_restrict_on_result.json"),
		getAwsOutputFilePath("ffout_cf_restrict_off_fetched.json"),
		getAwsOutputFilePath("ffout_cf_restrict_off_update.json"),
		getAwsOutputFilePath("ffout_cf_restrict_off_result.json"),
		getAwsOutputFilePath("ffout_cf_etag.txt"),
		getWorkspaceFilePath("ffout_cf_private_key.pem"),
		getWorkspaceFilePath("ffout_cf_public_key.pem"),
		getWorkspaceFilePath("ffout_cf_pubkey_id.txt"),
		getWorkspaceFilePath("ffout_cf_keygroup_id.txt"),
	]) {
		safeDeleteFile(filePath, deletedFiles);
	}

	console.log("CloudFront teardown complete");
	console.log(`Removed: ${removed.length ? removed.join(", ") : "none"}`);
	console.log(`Skipped: ${skipped.length ? skipped.join(", ") : "none"}`);
	console.log(`Deleted local files: ${deletedFiles.length ? deletedFiles.join(", ") : "none"}`);
} catch (error) {
	const details = getErrorText(error);
	if (details) {
		console.error(details);
	}
	process.exit(error.status || 1);
}
