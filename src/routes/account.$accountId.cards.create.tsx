import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/account/$accountId/cards/create")({
	component: () => null,
});
