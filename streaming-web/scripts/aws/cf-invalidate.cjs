const {
	getAwsOutputFilePath,
	getWorkspaceFilePath,
	readRequiredFile,
	resolveExistingFilePath,
	run,
	writeText,
} = require("./_common.cjs");

const idPath = resolveExistingFilePath(
	getAwsOutputFilePath("ffout_cf_id.txt"),
	getWorkspaceFilePath("ffout_cf_id.txt"),
);
const lastInvalidationPath = getAwsOutputFilePath("ffout_cf_last_invalidation_id.txt");
const distributionId = readRequiredFile(
	idPath,
	"../ffout/aws/ffout_cf_id.txt (or legacy ../ffout_cf_id.txt)",
).trim();
const responseText = run(
	`aws cloudfront create-invalidation --distribution-id ${distributionId} --paths '/*'`,
	{ capture: true, silent: true },
);
const response = JSON.parse(responseText);
const invalidationId = response.Invalidation.Id;

writeText(lastInvalidationPath, `${invalidationId}\n`);
process.stdout.write(`${invalidationId}\n`);
