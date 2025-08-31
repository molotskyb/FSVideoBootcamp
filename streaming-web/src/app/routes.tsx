// src/app/routes.ts
import React, { Suspense } from "react";
import { createHashRouter, type RouteObject } from "react-router-dom";
import Layout from "./Layout";

const DashClear = React.lazy(() => import("../pages/DashClear"));
const DashDrm = React.lazy(() => import("../pages/DashDrm"));
const HlsClear = React.lazy(() => import("../pages/HlsClear"));
const HlsDrm = React.lazy(() => import("../pages/HlsDrm"));
const Mp4 = React.lazy(() => import("../pages/Mp4"));
const CaptionsDash = React.lazy(() => import("../pages/CaptionsDash"));
const LowLatencyHls = React.lazy(() => import("../pages/LowLatencyHls"));
const LowLatencyDash = React.lazy(() => import("../pages/LowLatencyDash"));

const routes: RouteObject[] = [
	{
		element: React.createElement(
			Suspense,
			{ fallback: React.createElement("p", null, "Loading…") },
			React.createElement(Layout)
		),
		children: [
			{ index: true, element: React.createElement(DashClear) },
			{ path: "dash-clear", element: React.createElement(DashClear) },
			{ path: "dash-drm", element: React.createElement(DashDrm) },
			{ path: "hls-clear", element: React.createElement(HlsClear) },
			{ path: "hls-drm", element: React.createElement(HlsDrm) },
			{ path: "mp4", element: React.createElement(Mp4) },
			{ path: "captions-dash", element: React.createElement(CaptionsDash) },
			{ path: "ll-hls", element: React.createElement(LowLatencyHls) },
			{ path: "ll-dash", element: React.createElement(LowLatencyDash) },
		],
	},
];

export const router = createHashRouter(routes);
