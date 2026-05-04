// src/app/Layout.tsx
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import Nav from "./Nav";
import "./Layout.css";

const logoSrc = `${import.meta.env.BASE_URL}assets/logo.png`;

export default function Layout() {
	const [showMetrics, setShowMetrics] = useState(true);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key.toLowerCase() === "m") setShowMetrics((v) => !v);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	return (
		<>
			<img
				src={logoSrc}
				alt="logo"
				style={{
					position: "fixed",
					top: 16,
					left: 16,
					height: 164,
					zIndex: 1000,
				}}
			/>
			<div
				style={{
					minHeight: "100vh",
					width: "100%",
					display: "flex",
					flexDirection: "column",
				}}
			>
				<div
					style={{
						padding: "196px 16px 16px",
						maxWidth: 1320,
						margin: "0 auto",
						boxSizing: "border-box",
						display: "flex",
						flexDirection: "column",
						gap: 16,
					}}
				>
					<div className="layout-header">
						<h1 className="layout-title">Streaming Demos</h1>
						<Nav />
					</div>
					<Outlet context={{ showMetrics }} />
				</div>
			</div>
		</>
	);
}
