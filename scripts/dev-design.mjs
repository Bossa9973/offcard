import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const monorepo = process.env.WHOP_MONOREPO_PATH ?? resolve(root, "../whop-monorepo");
const web = resolve(monorepo, "frontend/apps/web");
const children = new Set();
let stopping = false;
function stop(code = 0) {
	if (stopping) return;
	stopping = true;
	for (const child of children) {
		try { process.kill(-child.pid, "SIGTERM"); } catch {}
	}
	process.exit(code);
}
function start(command, args, cwd, env = process.env) {
	const child = spawn(command, args, { cwd, env, stdio: "inherit", detached: true });
	children.add(child);
	child.on("error", (error) => { console.error(error.message); stop(1); });
	child.on("exit", (code) => { children.delete(child); if (!stopping) stop(code ?? 1); });
	return child;
}
for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(signal, () => stop());
async function available(url) {
	try { return (await fetch(url, { signal: AbortSignal.timeout(1500) })).ok; } catch { return false; }
}

try {
	const { activeTrain } = JSON.parse(await readFile(resolve(web, "elements.trains.json"), "utf8"));
	const sdk = `http://localhost:8788/elements/${activeTrain}/elements.demo.js`;
	if (!await available(sdk)) {
		console.log("Starting local Elements with sample data. The first build can take a few minutes.");
		start("mise", ["exec", "node@22", "pnpm@10.12.4", "--", "pnpm", "elements:dev", "--port", "8788"], web);
		const deadline = Date.now() + 300000;
		while (!await available(sdk)) {
			if (Date.now() > deadline) throw new Error("Elements did not start within five minutes. Check the build output above.");
			await new Promise((done) => setTimeout(done, 1000));
		}
	} else console.log("Using local Elements on :8788.");
	console.log("Neobank design preview → http://localhost:5180 — Sign up opens the sample account.");
	start("pnpm", ["exec", "vite", "--mode", "design", "--host", "127.0.0.1", "--port", "5180", "--strictPort"], root, {
		...process.env, NEOBANK_ELEMENTS_URL: `/__elements/elements/${activeTrain}/elements.demo.js`,
	});
} catch (error) {
	console.error(error.message);
	stop(1);
}
