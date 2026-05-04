const { getBucketAndRegion, run } = require("./_common.cjs");

const { bucket } = getBucketAndRegion();

console.log(`Configuring static website hosting for ${bucket}`);
run(
	`aws s3api put-bucket-website --bucket ${bucket} --website-configuration IndexDocument={Suffix=index.html},ErrorDocument={Key=error.html}`,
);
