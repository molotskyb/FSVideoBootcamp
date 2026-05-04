const { execFileSync } = require("child_process");
const {
	getAwsOutputFilePath,
	getWorkspaceFilePath,
	projectRoot,
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

const distributionId = readOutput("ffout_cf_id.txt");
const etag = readRequiredFile(
	getAwsOutputFilePath("ffout_cf_etag.txt"),
	"../ffout/aws/ffout_cf_etag.txt",
).trim();
const updateConfigPath = getAwsOutputFilePath("ffout_cf_update.json");

readRequiredFile(updateConfigPath, "../ffout/aws/ffout_cf_update.json");

const responseText = execFileSync(
	"aws",
	[
		"cloudfront",
		"update-distribution",
		"--id",
		distributionId,
		"--if-match",
		etag,
		"--distribution-config",
		`file://${updateConfigPath}`,
	],
	{
		cwd: projectRoot,
		encoding: "utf8",
	},
);
const response = JSON.parse(responseText);
const distribution = response.Distribution;

if (!distribution) {
	throw new Error("Distribution missing from update-distribution response");
}

console.log(
	JSON.stringify(
		{
			Id: distribution.Id,
			Status: distribution.Status,
			DomainName: distribution.DomainName,
		},
		null,
		2,
	),
);
