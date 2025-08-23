export const fmtKbps = (n?: number) =>
	n ? Math.round(n).toLocaleString() : "—";
