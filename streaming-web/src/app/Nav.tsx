// src/app/Nav.tsx
import { NavLink } from "react-router-dom";

const base = {
	padding: "6px 10px",
	borderRadius: 6,
	textDecoration: "none",
	color: "black",
	border: "1px solid transparent",
} as const;
const active = { border: "1px solid red" } as const;

export default function Nav() {
	const tabs = [
		["/dash-clear", "DASH (clear)"],
		["/dash-drm", "DASH (DRM)"],
		["/ll-dash", "LL-DASH"],
		["/captions-dash", "DASH Captions"],
		["/hls-clear", "HLS (clear)"],
		["/hls-drm", "HLS DRM (FPS)"],
		["/ll-hls", "LL-HLS"],
		["/mp4", "MP4"],
	] as const;

	return (
		<nav
			className="app-nav"
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
