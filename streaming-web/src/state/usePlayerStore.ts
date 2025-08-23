import { useContext } from "react";
import { Ctx } from "./playerStore";

export function usePlayerStore() {
	const v = useContext(Ctx);
	if (!v) throw new Error("usePlayerStore outside provider");
	return v;
}
