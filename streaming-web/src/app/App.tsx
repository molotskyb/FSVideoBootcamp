// src/app/App.tsx
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { PlayerProvider } from "../state/playerStore";

export default function App() {
	return (
		<PlayerProvider>
			<RouterProvider router={router} />
		</PlayerProvider>
	);
}
