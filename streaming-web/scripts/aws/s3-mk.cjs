const { getBucketAndRegion, run } = require("./_common.cjs");

const { bucket, region } = getBucketAndRegion();

const createBucketCommand =
	region === "us-east-1"
		? `aws s3api create-bucket --bucket ${bucket}`
		: `aws s3api create-bucket --bucket ${bucket} --create-bucket-configuration LocationConstraint=${region}`;

console.log(`Creating bucket ${bucket} in ${region}`);
run(createBucketCommand);

console.log(`Applying BucketOwnerEnforced ownership controls to ${bucket}`);
run(
	`aws s3api put-bucket-ownership-controls --bucket ${bucket} --ownership-controls Rules=[{ObjectOwnership=BucketOwnerEnforced}]`,
);

console.log(`Setting public access block for website hosting on ${bucket}`);
run(
	`aws s3api put-public-access-block --bucket ${bucket} --public-access-block-configuration BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false`,
);
