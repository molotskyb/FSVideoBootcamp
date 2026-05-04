const { getBucketAndRegion, run } = require("./_common.cjs");

const { bucket } = getBucketAndRegion();

console.log(`Deleting all objects from s3://${bucket}/`);
run(`aws s3 rm s3://${bucket} --recursive`);

console.log(`Deleting bucket ${bucket}`);
run(`aws s3api delete-bucket --bucket ${bucket}`);
