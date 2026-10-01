import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/account/$accountId/report")({ beforeLoad: ({ params, location }) => { throw redirect({ to: "/account/$accountId/reports", params, search: Object.fromEntries(new URLSearchParams(location.searchStr)), replace: true }); } });
