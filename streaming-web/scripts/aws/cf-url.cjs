const {
	getAwsOutputFilePath,
	getWorkspaceFilePath,
	readRequiredFile,
	resolveExistingFilePath,
} = require("./_common.cjs");

const domainPath = resolveExistingFilePath(
	getAwsOutputFilePath("ffout_cf_domain.txt"),
	getWorkspaceFilePath("ffout_cf_domain.txt"),
);
const domain = readRequiredFile(
	domainPath,
	"../ffout/aws/ffout_cf_domain.txt (or legacy ../ffout_cf_domain.txt)",
).trim();

process.stdout.write(`https://${domain}/\n`);
