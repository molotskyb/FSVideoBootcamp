const fs = require("fs");
const path = require("path");
const { execFileSync, spawnSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(projectRoot, "..");

function readCloudFrontDomain() {
	const primary = path.join(workspaceRoot, "ffout", "aws", "ffout_cf_domain.txt");
	const fallback = path.join(workspaceRoot, "ffout_cf_domain.txt");
	const filePath = fs.existsSync(primary) ? primary : fallback;

	if (!fs.existsSync(filePath)) {
		return "unknown";
	}

	return fs.readFileSync(filePath, "utf8").trim() || "unknown";
}

function timestamp() {
	const now = new Date();
	const pad = (value) => String(value).padStart(2, "0");

	return [
		now.getFullYear(),
		pad(now.getMonth() + 1),
		pad(now.getDate()),
		"-",
		pad(now.getHours()),
		pad(now.getMinutes()),
	].join("");
}

function main() {
	try {
		execFileSync("git", ["add", "-A"], {
			cwd: projectRoot,
			stdio: "ignore",
		});

		const diff = spawnSync("git", ["diff", "--cached", "--quiet"], {
			cwd: projectRoot,
			stdio: "ignore",
		});

		if (diff.status === 0) {
			console.log("No changes to commit");
			return;
		}

		const stamp = timestamp();
		const domain = readCloudFrontDomain();
		const message = `chore(review): snapshot ${stamp} cf=${domain}`;

		execFileSync("git", ["commit", "-m", message], {
			cwd: projectRoot,
			stdio: "inherit",
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.log(`Commit skipped: ${message}`);
	}
}

main();
