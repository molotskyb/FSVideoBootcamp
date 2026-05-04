const { getBucketAndRegion } = require("./_common.cjs");

const { bucket, region } = getBucketAndRegion();
const url =
	region === "us-east-1"
		? `http://${bucket}.s3-website-us-east-1.amazonaws.com/`
		: `http://${bucket}.s3-website-${region}.amazonaws.com/`;

process.stdout.write(url);
