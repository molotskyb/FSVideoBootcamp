const { execFileSync } = require("child_process");
const {
	getAwsOutputFilePath,
	getWorkspaceFilePath,
	projectRoot,
	readRequiredFile,
	resolveExistingFilePath,
	writeText,
} = require("./_common.cjs");

const paths = process.argv.slice(2);

if (paths.length === 0) {
	console.error('Usage: node scripts/aws/cf-invalidate-path.cjs "/index.html" "/assets/*"');
	process.exit(1);
}

const idPath = resolveExistingFilePath(
	getAwsOutputFilePath("ffout_cf_id.txt"),
	getWorkspaceFilePath("ffout_cf_id.txt"),
);
const lastInvalidationPath = getAwsOutputFilePath("ffout_cf_last_invalidation_id.txt");
const distributionId = readRequiredFile(
	idPath,
	"../ffout/aws/ffout_cf_id.txt (or legacy ../ffout_cf_id.txt)",
).trim();
const responseText = execFileSync(
	"aws",
	[
		"cloudfront",
		"create-invalidation",
		"--distribution-id",
		distributionId,
		"--paths",
		...paths,
	],
	{
		cwd: projectRoot,
		encoding: "utf8",
	},
);
const response = JSON.parse(responseText);
const invalidationId = response.Invalidation.Id;

writeText(lastInvalidationPath, `${invalidationId}\n`);
process.stdout.write(`${invalidationId}\n`);
