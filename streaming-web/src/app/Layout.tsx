// src/app/Layout.tsx
import { Outlet } from "react-router-dom";
import Nav from "./Nav";

export default function Layout() {
	return (
		<div style={{ padding: 16, maxWidth: 1260, margin: "0 auto" }}>
			<h1>Streaming Demos</h1>
			<Nav /> {/* ✅ inside router context */}
			<Outlet /> {/* where child routes render */}
		</div>
	);
}
