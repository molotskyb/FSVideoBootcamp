const path = require("path");
const { getBucketAndRegion, run, writeJson } = require("./_common.cjs");

const { bucket } = getBucketAndRegion();
const policyPath = path.join(__dirname, "ffout_s3_policy.json");
const policyPathForCli = "scripts/aws/ffout_s3_policy.json";

const policy = {
	Version: "2012-10-17",
	Statement: [
		{
			Sid: "PublicReadGetObjectRoot",
			Effect: "Allow",
			Principal: "*",
			Action: ["s3:GetObject"],
			Resource: [`arn:aws:s3:::${bucket}/*`],
		},
	],
};

console.log(`Writing bucket policy to ${policyPath}`);
writeJson(policyPath, policy);

console.log(`Applying bucket policy to ${bucket}`);
run(`aws s3api put-bucket-policy --bucket ${bucket} --policy file://${policyPathForCli}`);
