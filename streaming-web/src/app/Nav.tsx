import { NavLink } from "react-router-dom";

const link = {
	padding: "6px 10px",
	borderRadius: 6,
	textDecoration: "none",
	color: "inherit",
};
const active = { background: "rgba(255,255,255,.1)" };

export default function Nav() {
	const tabs = [
		["/dash-clear", "DASH (clear)"],
		["/dash-drm", "DASH (DRM)"],
		["/hls-clear", "HLS (clear)"],
		["/mp4", "MP4"],
		["/captions", "Captions"],
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
					style={({ isActive }) => ({ ...link, ...(isActive ? active : {}) })}
				>
					{label}
				</NavLink>
			))}
		</nav>
	);
}
