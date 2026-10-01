import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/account/$accountId/invoices")({ beforeLoad: ({ params, location }) => { throw redirect({ to: "/account/$accountId/payments/invoices", params, search: Object.fromEntries(new URLSearchParams(location.searchStr)), replace: true }); } });
