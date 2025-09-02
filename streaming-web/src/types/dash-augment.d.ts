// src/types/dash-augment.d.ts
import "dashjs";

declare module "dashjs" {
	interface DashMetrics {
		/** Optional in some builds/typings */
		getCurrentLiveLatency?: () => number | undefined;
	}
}
