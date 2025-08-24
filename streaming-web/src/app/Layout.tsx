// src/app/Layout.tsx
import { Outlet, NavLink } from "react-router-dom";

const link: React.CSSProperties = {
	padding: "6px 10px",
	borderRadius: 6,
	textDecoration: "none",
	color: "inherit",
};
const active: React.CSSProperties = { background: "rgba(255,255,255,.1)" };

function Nav() {
	const tabs = [
		["dash-clear", "DASH (clear)"],
		["dash-drm", "DASH (DRM)"],
		["hls-clear", "HLS (clear)"],
		["mp4", "MP4"],
		["captions", "Captions"],
		["metrics", "Metrics"],
		["errors", "Errors"],
	] as const;

	return (
		<nav
			style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0" }}
		>
			{tabs.map(([to, label]) => (
				<NavLink
					key={to}
					to={to}
					style={({ isActive }) => ({ ...link, ...(isActive ? active : {}) })}
				>
					{label}
				</NavLink>
			))}
		</nav>
	);
}

export default function Layout() {
	return (
		<div style={{ padding: 16, maxWidth: 1260, margin: "0 auto" }}>
			<img
				src="/assets/logo.png"
				alt="Logo"
				style={{ display: "block", margin: "24px 0", maxWidth: 180 }}
			/>
			<h1>Streaming Demos</h1>
			<Nav />
			<Outlet />
		</div>
	);
}
