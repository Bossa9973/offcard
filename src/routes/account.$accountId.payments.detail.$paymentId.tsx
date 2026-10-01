import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/account/$accountId/payments/detail/$paymentId")({ component: () => null });
