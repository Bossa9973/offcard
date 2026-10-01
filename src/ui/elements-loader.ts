import { preloadHints, SDK_URL } from "@whop/elements";
import { DESIGN_MODE } from "../design-mode";

export const elementsScriptUrl = DESIGN_MODE && __NEOBANK_ELEMENTS_URL__ ? __NEOBANK_ELEMENTS_URL__ :
	import.meta.env.VITE_ELEMENTS_SRC ||
	import.meta.env.VITE_WHOP_ELEMENTS_SCRIPT_URL ||
	SDK_URL;

/** Public demo runtime: renders built-in fixtures and never talks to live account APIs. */
export const demoElementsScriptUrl = SDK_URL.replace(/elements\.js$/, "elements.demo.js");

export const elementsResourceHints =
	elementsScriptUrl === SDK_URL
		? preloadHints()
		: [{ rel: "preload", href: elementsScriptUrl, as: "script" }];
