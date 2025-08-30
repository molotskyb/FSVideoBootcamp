// src/app/Layout.tsx
import { Outlet } from "react-router-dom";
import Nav from "./Nav";

export default function Layout() {
	return (
		<>
			<img
				src="../assets/logo.png"
				alt="logo"
				style={{
					position: "fixed",
					top: 16,
					left: 16,
					height: 164,
					zIndex: 1000,
				}}
			/>
			<div style={{ padding: 16, maxWidth: 1260, margin: "0 auto" }}>
				<h1>Streaming Demos</h1>
				<Nav />
				<Outlet />
			</div>
		</>
	);
}
