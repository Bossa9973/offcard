import { createFileRoute } from "@tanstack/react-router";
import { createApiProxy } from "@whop/template-kit/server";

import { NEOBANK_ELEMENTS_MANIFEST } from "../api-manifest";

export const Route = createFileRoute("/api/$")({
	server: {
		handlers: createApiProxy(NEOBANK_ELEMENTS_MANIFEST),
	},
});
