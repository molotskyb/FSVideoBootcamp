// src/app/Nav.tsx
import { NavLink } from "react-router-dom";

const base = {
	padding: "6px 10px",
	borderRadius: 6,
	textDecoration: "none",
	color: "inherit",
} as const;
const active = { background: "rgba(255,255,255,.1)" } as const;

export default function Nav() {
	const tabs = [
		["/dash-clear", "DASH (clear)"],
		["/dash-drm", "DASH (DRM)"],
		["/hls-clear", "HLS (clear)"],
		["/hls-drm", "HLS DRM (FPS)"],
		["/mp4", "MP4"],
		["/captions-dash", "DASH Captions"],
		["/metrics", "Metrics"],
		["/errors", "Errors"],
	] as const;

	return (
		<nav
			style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0" }}
		>
			{tabs.map(([to, label]) => (
				<NavLink
					key={to}
					to={to}
					style={({ isActive }) => ({ ...base, ...(isActive ? active : {}) })}
				>
					{label}
				</NavLink>
			))}
		</nav>
	);
}
