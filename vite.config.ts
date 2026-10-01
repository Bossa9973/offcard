import { assetDemoPlugin } from "./dev/asset-demo.ts";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { whop } from "@whop/cli/vite";
import { defineConfig } from "vite";
import { designApiPlugin } from "./dev/design-api.ts";

export default defineConfig(({ command, mode }) => {
	const design = command === "serve" && mode === "design";
	const elementsUrl = process.env.NEOBANK_ELEMENTS_URL ?? "/__elements/elements/amber/elements.demo.js";
	if (design) {
		if (!/^\/__elements\/elements\/[a-z]+\/elements\.demo\.js$/.test(elementsUrl))
			throw new Error("Design mode requires a local elements.demo.js URL.");
	}
	return {
		...(design ? { cacheDir: "node_modules/.vite-design" } : {}),
		define: {
			__NEOBANK_DESIGN__: JSON.stringify(design),
			__NEOBANK_ELEMENTS_URL__: JSON.stringify(design ? elementsUrl : ""),
		},
		plugins: [
			...(design ? [designApiPlugin(), assetDemoPlugin()] : []),
			cloudflare({ viteEnvironment: { name: "ssr" } }),
			tailwindcss(),
			tanstackStart(),
			viteReact(),
			...(!design ? [whop()] : []),
		],
		ssr: {
			noExternal: ["@frosted-ui/icons"],
		},
		server: {
			...(design ? { proxy: {
				"/__elements-dev__/events": { target: "http://127.0.0.1:8788" },
				"/__elements/": { target: "http://127.0.0.1:8788", rewrite: (path: string) => path.replace(/^\/__elements/, "") },
			} } : {}),
			// Vite rejects Host headers it does not recognise, so a tunnelled preview 403s without
			// these. Dev only — `vite build` never reads this.
			allowedHosts: [".trycloudflare.com", ".ngrok-free.app", ".ngrok.io", ".ngrok.app"],
		},
	};
});
