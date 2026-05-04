const fs = require("fs");
const path = require("path");
const { ensureDir, projectRoot } = require("./_common.cjs");

const publicDir = path.join(projectRoot, "public");
const versionDir = path.join(publicDir, "v1");
const versionIndexPath = path.join(versionDir, "index.html");
const errorPath = path.join(publicDir, "error.html");

ensureDir(versionDir);

fs.writeFileSync(
	versionIndexPath,
	`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Version v1</title>
  </head>
  <body>
    <h1>Version v1</h1>
  </body>
</html>
`,
);

fs.writeFileSync(
	errorPath,
	`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Not found</title>
  </head>
  <body>
    <h1>Not found</h1>
  </body>
</html>
`,
);

console.log("staged v1");
