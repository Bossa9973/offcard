import { createFileRoute } from "@tanstack/react-router";

// Readiness loads independently so account API latency does not block navigation.
export const Route = createFileRoute("/account/$accountId/settings")({
	component: () => null,
});
