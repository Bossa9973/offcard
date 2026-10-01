import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/account/$accountId/deposit")({
	component: () => null,
});
