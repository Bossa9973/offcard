import { createFileRoute } from "@tanstack/react-router";
import { samplePaymentPage } from "../lib/design-api";
// Public, static sample page used by preview-mode invoice links. It reads no account data.
export const Route = createFileRoute("/api/design/payment-preview")({ server: { handlers: { GET: () => samplePaymentPage() } } });
