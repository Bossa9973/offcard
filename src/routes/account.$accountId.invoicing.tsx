import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/account/$accountId/invoicing")({ beforeLoad: ({ params, location }) => { throw redirect({ to: "/account/$accountId/payments", params, search: Object.fromEntries(new URLSearchParams(location.searchStr)), replace: true }); } });
