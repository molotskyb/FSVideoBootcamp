const path = require("path");
const { getBucketAndRegion, projectRoot, run } = require("./_common.cjs");

const { bucket } = getBucketAndRegion();
const publicDir = path.join(projectRoot, "public");

console.log(`Syncing ${publicDir} to s3://${bucket}/`);
run(`aws s3 sync public/ s3://${bucket}/ --delete --cache-control max-age=60`);
