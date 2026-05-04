const { execFileSync, spawnSync } = require("child_process");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");

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
		const tag = `v-review-${timestamp()}`;
		const existing = spawnSync("git", ["rev-parse", "-q", "--verify", `refs/tags/${tag}`], {
			cwd: projectRoot,
			stdio: "ignore",
		});

		if (existing.status === 0) {
			console.log(`Tag already exists: ${tag}`);
			return;
		}

		execFileSync("git", ["tag", tag], {
			cwd: projectRoot,
			stdio: "inherit",
		});
		console.log(`Created tag ${tag}`);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.log(`Tag skipped: ${message}`);
	}
}

main();
