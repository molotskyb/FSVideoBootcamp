const {
	getAwsOutputFilePath,
	getWorkspaceFilePath,
	readRequiredFile,
	resolveExistingFilePath,
	run,
} = require("./_common.cjs");

const idPath = resolveExistingFilePath(
	getAwsOutputFilePath("ffout_cf_id.txt"),
	getWorkspaceFilePath("ffout_cf_id.txt"),
);
const distributionId = readRequiredFile(
	idPath,
	"../ffout/aws/ffout_cf_id.txt (or legacy ../ffout_cf_id.txt)",
).trim();
const responseText = run(
	`aws cloudfront get-distribution --id ${distributionId}`,
	{ capture: true, silent: true },
);
const response = JSON.parse(responseText);

process.stdout.write(`${response.Distribution.Status}\n`);
