import React, { createContext, useMemo, useState } from "react";

type BitrateEvent = { bitrateKbps?: number; height?: number };
type ErrorEvent = { code: string; message: string };

type PlayerState = {
	bitrateKbps?: number;
	height?: number;
	lastError?: ErrorEvent;
	onBitrate: (e: BitrateEvent) => void;
	onError: (e: ErrorEvent) => void;
};

const Ctx = createContext<PlayerState | null>(null);
export { Ctx };

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [bitrateKbps, setBr] = useState<number | undefined>();
	const [height, setH] = useState<number | undefined>();
	const [lastError, setErr] = useState<ErrorEvent | undefined>();

	const value = useMemo<PlayerState>(
		() => ({
			bitrateKbps,
			height,
			lastError,
			onBitrate: (e) => {
				setBr(e.bitrateKbps);
				setH(e.height);
			},
			onError: (e) => setErr(e),
		}),
		[bitrateKbps, height, lastError]
	);

	return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};
