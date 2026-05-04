const fs = require("fs");
const path = require("path");
const { ensureDir, projectRoot } = require("./_common.cjs");

const versionDir = path.join(projectRoot, "public", "v2");
const versionIndexPath = path.join(versionDir, "index.html");

ensureDir(versionDir);

fs.writeFileSync(
	versionIndexPath,
	`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Version v2</title>
  </head>
  <body>
    <h1>Version v2</h1>
  </body>
</html>
`,
);

console.log("staged v2");
