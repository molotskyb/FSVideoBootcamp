const fs = require("fs");
const path = require("path");
const { ensureDir, projectRoot } = require("./_common.cjs");

const publicDir = path.join(projectRoot, "public");
const indexPath = path.join(publicDir, "index.html");
const errorPath = path.join(publicDir, "error.html");

const indexHtml =
	'<!doctype html><html><head><meta charset="utf-8"><title>S3 website up</title></head><body><h1>S3 website up</h1></body></html>\n';
const errorHtml =
	'<!doctype html><html><head><meta charset="utf-8"><title>Not found</title></head><body><h1>Not found</h1></body></html>\n';

console.log(`Ensuring ${publicDir} exists`);
ensureDir(publicDir);

console.log(`Writing ${indexPath}`);
fs.writeFileSync(indexPath, indexHtml);

console.log(`Writing ${errorPath}`);
fs.writeFileSync(errorPath, errorHtml);
