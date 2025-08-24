// src/app/App.tsx
import { RouterProvider } from "react-router-dom";
import { PlayerProvider } from "../state/playerStore";
import { router } from "./routes";

export default function App() {
	return (
		<PlayerProvider>
			<RouterProvider router={router} />
		</PlayerProvider>
	);
}
