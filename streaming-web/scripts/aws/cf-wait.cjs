const {
	getAwsOutputFilePath,
	getWorkspaceFilePath,
	readRequiredFile,
	resolveExistingFilePath,
	run,
	sleep,
} = require("./_common.cjs");

const pollMs = 15000;
const idPath = resolveExistingFilePath(
	getAwsOutputFilePath("ffout_cf_id.txt"),
	getWorkspaceFilePath("ffout_cf_id.txt"),
);
const distributionId = readRequiredFile(
	idPath,
	"../ffout/aws/ffout_cf_id.txt (or legacy ../ffout_cf_id.txt)",
).trim();

for (;;) {
	console.log(`Checking CloudFront distribution ${distributionId}`);
	const responseText = run(
		`aws cloudfront get-distribution --id ${distributionId}`,
		{ capture: true, silent: true },
	);
	const response = JSON.parse(responseText);
	const status = response.Distribution.Status;

	if (status === "Deployed") {
		console.log(`Distribution ${distributionId} is Deployed`);
		process.exit(0);
	}

	console.log(`Current status: ${status}. Waiting ${pollMs / 1000}s before retrying.`);
	sleep(pollMs);
}
