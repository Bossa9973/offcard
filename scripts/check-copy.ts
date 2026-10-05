import fs from "node:fs";
import path from "node:path";

// Pass 7 Copy Blocklist (Section 5)
const BLOCKLIST: { pattern: RegExp; name: string }[] = [
	{ pattern: /\bseamlessly?\b/i, name: "seamless / seamlessly" },
	{ pattern: /\bhassle-free\b/i, name: "hassle-free" },
	{ pattern: /\beffortless\b/i, name: "effortless" },
	{ pattern: /\bunlock\b/i, name: "unlock" },
	{ pattern: /\bsupercharge\b/i, name: "supercharge" },
	{ pattern: /\belevate\b(?!\w)/i, name: "elevate (verb)" },
	{ pattern: /\brevolutionize\b/i, name: "revolutionize" },
	{ pattern: /\bnext-gen(?:eration)?\b/i, name: "next-gen / next-generation" },
	{ pattern: /\bcutting-edge\b/i, name: "cutting-edge" },
	{ pattern: /\bgame-changing\b/i, name: "game-changing" },
	{ pattern: /\bempower\b/i, name: "empower" },
	{ pattern: /\ball-in-one\b/i, name: "all-in-one" },
	{ pattern: /\bleverage\b/i, name: "leverage" },
	{ pattern: /\brobust\b/i, name: "robust" },
	{ pattern: /\bworld-class\b/i, name: "world-class" },
	{ pattern: /\bbest-in-class\b/i, name: "best-in-class" },
	{ pattern: /\bstate-of-the-art\b/i, name: "state-of-the-art" },
	{ pattern: /\b(?:in the )?blink of an eye\b/i, name: "blink of an eye" },
	{ pattern: /\bIRL\b/, name: "IRL" },
	{ pattern: /\bWeb3\b/, name: "Web3" },
	{ pattern: /your shopping experience/i, name: "your shopping experience" },
	{ pattern: /high approval rates/i, name: "high approval rates" },
	{ pattern: /most retailers/i, name: "most retailers" },
];

const SCAN_DIRS = [
	path.resolve(process.cwd(), "src/content"),
	path.resolve(process.cwd(), "src/ui"),
];

interface Violation {
	file: string;
	line: number;
	term: string;
	content: string;
}

const violations: Violation[] = [];

function scanFile(filePath: string) {
	// Skip CSS / style files where classnames or properties might match (e.g. --surface-elevated)
	if (filePath.endsWith(".css")) return;

	const content = fs.readFileSync(filePath, "utf-8");
	const lines = content.split("\n");

	lines.forEach((line, index) => {
		// Ignore comment lines that document blocklist itself
		if (line.includes("BLOCKLIST") || line.includes("check-copy") || line.trim().startsWith("//") || line.trim().startsWith("/*")) {
			return;
		}

		for (const rule of BLOCKLIST) {
			if (rule.pattern.test(line)) {
				violations.push({
					file: path.relative(process.cwd(), filePath),
					line: index + 1,
					term: rule.name,
					content: line.trim(),
				});
			}
		}
	});
}

function walkDir(dir: string) {
	if (!fs.existsSync(dir)) return;
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			walkDir(fullPath);
		} else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
			scanFile(fullPath);
		}
	}
}

for (const dir of SCAN_DIRS) {
	walkDir(dir);
}

if (violations.length > 0) {
	console.error(`\n❌ Found ${violations.length} copy blocklist violation(s):\n`);
	for (const v of violations) {
		console.error(`  ${v.file}:${v.line} -> Found "${v.term}"\n    "${v.content}"\n`);
	}
	process.exit(1);
} else {
	console.log("✅ Copy check passed: 0 blocklisted words found in src/content and src/ui.");
}
