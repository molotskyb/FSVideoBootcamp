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
const invalidationPath = resolveExistingFilePath(
	getAwsOutputFilePath("ffout_cf_last_invalidation_id.txt"),
	getWorkspaceFilePath("ffout_cf_last_invalidation_id.txt"),
);
const distributionId = readRequiredFile(
	idPath,
	"../ffout/aws/ffout_cf_id.txt (or legacy ../ffout_cf_id.txt)",
).trim();
const invalidationId = readRequiredFile(
	invalidationPath,
	"../ffout/aws/ffout_cf_last_invalidation_id.txt (or legacy ../ffout_cf_last_invalidation_id.txt)",
).trim();
const responseText = run(
	`aws cloudfront get-invalidation --distribution-id ${distributionId} --id ${invalidationId}`,
	{ capture: true, silent: true },
);
const response = JSON.parse(responseText);

process.stdout.write(`${response.Invalidation.Status}\n`);
