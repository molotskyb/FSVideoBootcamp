import { describe, it, expect } from "vitest";
import { buildProtectionData } from "./drm";

describe("buildProtectionData", () => {
	it("builds WV and PR with headers", () => {
		const pd = buildProtectionData({
			widevine: "https://wv",
			playready: "https://pr",
			headers: { Authorization: "Bearer X" },
		});
		expect(pd["com.widevine.alpha"].serverURL).toBe("https://wv");
		expect(pd["com.widevine.alpha"].httpRequestHeaders.Authorization).toBe(
			"Bearer X"
		);
		expect(pd["com.microsoft.playready"].serverURL).toBe("https://pr");
	});
});
