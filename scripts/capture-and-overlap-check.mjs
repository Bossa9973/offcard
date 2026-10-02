import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9222;
const WIDTHS = [1920, 1440, 1024, 768, 390];

async function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
	mkdirSync("output", { recursive: true });

	console.log("Launching Headless Chrome...");
	const chrome = spawn(
		CHROME_PATH,
		[
			"--headless=new",
			`--remote-debugging-port=${PORT}`,
			"--disable-gpu",
			"--no-first-run",
			"--no-default-browser-check",
			"--disable-background-networking",
			"--disable-extensions",
			"about:blank",
		],
		{ stdio: "ignore" }
	);

	await sleep(2000);

	let wsUrl;
	for (let i = 0; i < 10; i++) {
		try {
			const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
			const list = await res.json();
			if (list && list.length > 0 && list[0].webSocketDebuggerUrl) {
				wsUrl = list[0].webSocketDebuggerUrl;
				break;
			}
		} catch (e) {
			await sleep(500);
		}
	}

	if (!wsUrl) {
		console.error("Could not obtain Chrome WebSocket URL");
		chrome.kill();
		process.exit(1);
	}

	const ws = new WebSocket(wsUrl);
	await new Promise((resolve) => ws.addEventListener("open", resolve, { once: true }));

	let msgId = 1;
	const pending = new Map();

	ws.addEventListener("message", (event) => {
		const data = JSON.parse(event.data);
		if (data.id && pending.has(data.id)) {
			const { resolve, reject } = pending.get(data.id);
			pending.delete(data.id);
			if (data.error) reject(new Error(data.error.message));
			else resolve(data.result);
		}
	});

	function send(method, params = {}) {
		const id = msgId++;
		return new Promise((resolve, reject) => {
			pending.set(id, { resolve, reject });
			ws.send(JSON.stringify({ id, method, params }));
		});
	}

	await send("Page.enable");
	await send("DOM.enable");

	console.log("Navigating to http://localhost:5173/...");
	await send("Page.navigate", { url: "http://localhost:5173/" });
	await sleep(2500);

	let allPassed = true;

	for (const width of WIDTHS) {
		const height = width <= 768 ? 900 : 1080;
		console.log(`\nTesting viewport ${width}x${height}...`);

		await send("Emulation.setDeviceMetricsOverride", {
			width,
			height,
			deviceScaleFactor: 1,
			mobile: width <= 768,
		});

		await sleep(1500);

		// Capture screenshot
		const { data } = await send("Page.captureScreenshot", { format: "png" });
		const buffer = Buffer.from(data, "base64");
		writeFileSync(`output/screenshot_${width}.png`, buffer);
		writeFileSync(`hero_${width}.png`, buffer);
		console.log(`Saved screenshot to output/screenshot_${width}.png and hero_${width}.png`);

		// Overlap check (Pass 5, Section 2.3)
		const evalRes = await send("Runtime.evaluate", {
			expression: `
				(() => {
					const floats = Array.from(document.querySelectorAll("[data-floating]"));
					const keeps = Array.from(document.querySelectorAll("[data-keep-clear]"));
					const collisions = [];

					for (const f of floats) {
						const fb = f.getBoundingClientRect();
						if (fb.width === 0 || fb.height === 0) continue;
						const floatName = f.getAttribute("data-floating") || "unnamed-float";

						for (const k of keeps) {
							const kb = k.getBoundingClientRect();
							if (kb.width === 0 || kb.height === 0) continue;
							const keepName = k.getAttribute("data-keep-clear") || k.textContent?.slice(0, 20);

							// Check AABB intersection
							const hit = fb.left < kb.right &&
										fb.right > kb.left &&
										fb.top < kb.bottom &&
										fb.bottom > kb.top;

							if (hit) {
								collisions.push({ float: floatName, keep: keepName });
							}
						}
					}
					return {
						floatsCount: floats.length,
						keepsCount: keeps.length,
						collisions
					};
				})()
			`,
			returnByValue: true,
		});

		const check = evalRes.result.value;
		console.log(`Elements checked: ${check.floatsCount} floating, ${check.keepsCount} keep-clear`);

		if (check.collisions.length > 0) {
			allPassed = false;
			console.error(`COLLISION DETECTED at ${width}px:`);
			for (const c of check.collisions) {
				console.error(`  - Floating element "${c.float}" overlaps Keep-Clear element "${c.keep}"`);
			}
		} else {
			console.log(`PASS: Zero collisions at ${width}px.`);
		}
	}

	ws.close();
	chrome.kill();

	if (!allPassed) {
		console.error("\nSome viewports failed overlap check!");
		process.exit(1);
	} else {
		console.log("\nALL VIEWPORTS PASSED NO-OVERLAP TEST! (1920, 1440, 1024, 768, 390)");
	}
}

run().catch((err) => {
	console.error("Error during execution:", err);
	process.exit(1);
});
