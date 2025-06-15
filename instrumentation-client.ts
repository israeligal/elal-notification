import posthog from "posthog-js"

// Initialize PostHog client for the browser
posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: "/ingest",
  ui_host: "https://eu.posthog.com",
  capture_pageview: 'history_change',       // Enable single-page-app pageviews
  capture_pageleave: true,                  // Enable pageleave capture
  capture_exceptions: true,                 // Capture unhandled exceptions
  debug: process.env.NODE_ENV === "development",
});
