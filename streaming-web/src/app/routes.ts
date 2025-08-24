// src/app/routes.ts
import React from "react";
import { createHashRouter, type RouteObject } from "react-router-dom";
import Layout from "./Layout";

// lazy pages
const DashClear = React.lazy(() => import("../pages/DashClear"));
const DashDrm = React.lazy(() => import("../pages/DashDrm"));
const HlsClear = React.lazy(() => import("../pages/HlsClear"));
const Mp4 = React.lazy(() => import("../pages/Mp4"));
const Captions = React.lazy(() => import("../pages/Captions"));
const Metrics = React.lazy(() => import("../pages/Metrics"));
const Errors = React.lazy(() => import("../pages/Errors"));

const routes: RouteObject[] = [
	{
		element: React.createElement(
			React.Suspense,
			{ fallback: React.createElement("p", null, "Loading…") },
			React.createElement(Layout)
		),
		children: [
			{ index: true, element: React.createElement(DashClear) }, // default = /#/
			{ path: "dash-clear", element: React.createElement(DashClear) },
			{ path: "dash-drm", element: React.createElement(DashDrm) },
			{ path: "hls-clear", element: React.createElement(HlsClear) },
			{ path: "mp4", element: React.createElement(Mp4) },
			{ path: "captions", element: React.createElement(Captions) },
			{ path: "metrics", element: React.createElement(Metrics) },
			{ path: "errors", element: React.createElement(Errors) },
		],
	},
];

export const router = createHashRouter(routes);
