import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9334;
const USER_DATA_DIR = "C:\\Users\\User\\.gemini\\antigravity-ide\\brain\\ea1674e8-8790-4611-94c3-06feefb1edec\\scratch\\chrome-scroll-profile";

async function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
	mkdirSync("output", { recursive: true });
	mkdirSync(USER_DATA_DIR, { recursive: true });

	console.log("Launching Headless Chrome for scroll timeline test...");
	const chrome = spawn(
		CHROME_PATH,
		[
			"--headless=new",
			`--remote-debugging-port=${PORT}`,
			`--user-data-dir=${USER_DATA_DIR}`,
			"--disable-gpu",
			"--no-first-run",
			"--no-default-browser-check",
			"--disable-background-networking",
			"--disable-extensions",
			"about:blank",
		],
		{ stdio: "ignore" }
	);

	await sleep(2500);

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

	await send("Emulation.setDeviceMetricsOverride", {
		width: 1440,
		height: 900,
		deviceScaleFactor: 1,
		mobile: false,
	});

	const scrollSteps = [
		{ label: "01_hero", y: 0 },
		{ label: "02_bento_entrance", y: 650 },
		{ label: "03_bento_full", y: 1100 },
		{ label: "04_pricing_entrance", y: 1800 },
		{ label: "05_faq", y: 2600 },
		{ label: "06_closing_cta", y: 3500 },
	];

	for (const step of scrollSteps) {
		console.log(`Scrolling to Y=${step.y} (${step.label})...`);
		await send("Runtime.evaluate", {
			expression: `window.scrollTo({ top: ${step.y}, behavior: 'smooth' })`,
		});
		await sleep(1000);

		const evalStatus = await send("Runtime.evaluate", {
			expression: `
				(() => {
					const revealed = Array.from(document.querySelectorAll(".is-revealed")).map(el => el.className.split(" ")[0]);
					const progress = document.querySelector(".off-nav-scroll-progress")?.style.width || "0%";
					return { revealedCount: revealed.length, progress };
				})()
			`,
			returnByValue: true,
		});

		console.log(`Status at Y=${step.y}:`, evalStatus.result?.value);

		const { data } = await send("Page.captureScreenshot", { format: "png" });
		const buffer = Buffer.from(data, "base64");
		writeFileSync(`output/scroll_${step.label}.png`, buffer);
		console.log(`Saved output/scroll_${step.label}.png`);
	}

	ws.close();
	chrome.kill();
	console.log("\nScroll capture complete! All frames captured successfully.");
}

run().catch((err) => {
	console.error("Scroll demo capture error:", err);
	process.exit(1);
});
