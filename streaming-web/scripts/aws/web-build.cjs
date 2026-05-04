const fs = require("fs");
const path = require("path");
const { projectRoot, run } = require("./_common.cjs");

const publicDir = path.join(projectRoot, "public");
const publicIndexPath = path.join(publicDir, "index.html");
const publicIndexBackupPath = path.join(publicDir, ".index.vite-build-backup.html");

let movedPublicIndex = false;

try {
	if (fs.existsSync(publicIndexPath)) {
		if (fs.existsSync(publicIndexBackupPath)) {
			throw new Error(`Refusing to overwrite existing temp file: ${publicIndexBackupPath}`);
		}

		console.log("Ignoring public/index.html during Vite build");
		fs.renameSync(publicIndexPath, publicIndexBackupPath);
		movedPublicIndex = true;
	}

	console.log("Building Vite app");
	run("node ./node_modules/vite/bin/vite.js build");
} finally {
	if (movedPublicIndex && fs.existsSync(publicIndexBackupPath)) {
		fs.renameSync(publicIndexBackupPath, publicIndexPath);
	}
}
