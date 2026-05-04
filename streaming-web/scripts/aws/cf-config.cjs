const {
	getAwsOutputFilePath,
	getBucketAndRegion,
	getWebsiteOriginDomain,
	writeJson,
} = require("./_common.cjs");

const { bucket, region } = getBucketAndRegion();
const originDomain = getWebsiteOriginDomain(bucket, region);
const callerReference = String(Date.now());
const managedCachingOptimized = "658327ea-f89d-4fab-a63d-7e88639e58f6";
const outputPath = getAwsOutputFilePath("ffout_cf_dist.json");

const distributionConfig = {
	CallerReference: callerReference,
	Comment: `bootcamp default distro for ${bucket} (${callerReference})`,
	Enabled: true,
	Origins: {
		Quantity: 1,
		Items: [
			{
				Id: "s3-website-origin",
				DomainName: originDomain,
				CustomOriginConfig: {
					HTTPPort: 80,
					HTTPSPort: 443,
					OriginProtocolPolicy: "http-only",
					OriginSslProtocols: {
						Quantity: 3,
						Items: ["TLSv1", "TLSv1.1", "TLSv1.2"],
					},
				},
			},
		],
	},
	DefaultCacheBehavior: {
		TargetOriginId: "s3-website-origin",
		ViewerProtocolPolicy: "redirect-to-https",
		AllowedMethods: {
			Quantity: 2,
			Items: ["GET", "HEAD"],
		},
		Compress: true,
		CachePolicyId: managedCachingOptimized,
	},
	Aliases: {
		Quantity: 0,
	},
	PriceClass: "PriceClass_100",
	HttpVersion: "http2",
	IsIPV6Enabled: true,
	DefaultRootObject: "index.html",
	CustomErrorResponses: {
		Quantity: 1,
		Items: [
			{
				ErrorCode: 404,
				ResponseCode: "404",
				ResponsePagePath: "/error.html",
			},
		],
	},
};

console.log(`Building CloudFront config for website origin ${originDomain}`);
writeJson(outputPath, distributionConfig);
console.log(`Wrote CloudFront distribution config to ${outputPath}`);
