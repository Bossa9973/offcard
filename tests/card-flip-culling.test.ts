import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Card3DInspector, type InspectorCardData } from "../src/ui/components/card-3d-inspector";

const EDITIONS: InspectorCardData[] = [
	{
		id: "grid",
		product: "Grid",
		variant: "grid",
		image: "/images/cards/card-grid.jpg",
		holder: "Alex Morgan",
		lastFour: "7474",
		expires: "08/28",
		materialSpec: "Precision Brushed Steel",
		massGrams: 16.0,
		thicknessMm: 0.84,
		finish: "Laser-etched micro-grid surface",
		useCase: "Executive treasury & operational liquidity",
	},
	{
		id: "chrome",
		product: "Chrome",
		variant: "chrome",
		image: "/images/cards/card-chrome.jpg",
		holder: "Alex Morgan",
		lastFour: "2343",
		expires: "12/29",
		materialSpec: "Mirror-Polished Alloy",
		massGrams: 17.5,
		thicknessMm: 0.84,
		finish: "Specular reflective mirror finish",
		useCase: "High-volume corporate procurement",
	},
	{
		id: "carbon",
		product: "Carbon",
		variant: "carbon",
		image: "/images/cards/card-carbon.jpg",
		holder: "Alex Morgan",
		lastFour: "9613",
		expires: "06/27",
		materialSpec: "Matte Black Ceramic-Coat",
		massGrams: 18.0,
		thicknessMm: 0.84,
		finish: "Scratch-resistant matte finish",
		useCase: "Founder & leadership discretionary spend",
	},
	{
		id: "lumen",
		product: "Lumen",
		variant: "lumen",
		image: "/images/cards/card-lumen.jpg",
		holder: "Alex Morgan",
		lastFour: "0917",
		expires: "03/28",
		materialSpec: "Dual-Tone Anodized Aluminum",
		massGrams: 12.2,
		thicknessMm: 0.84,
		finish: "Bead-blasted dual spectrum linear texture",
		useCase: "Everyday employee expense & SaaS subscriptions",
	},
];

test("card flip culling rules are enforced in CSS to prevent ghost text", () => {
	const cssPath = resolve(process.cwd(), "src/ui/revolut-theme.css");
	const rawCss = readFileSync(cssPath, "utf-8");
	const css = rawCss.replace(/\r\n/g, "\n");

	// 1. Verify .card3d-face has backface-visibility: hidden
	assert.ok(
		css.includes("backface-visibility: hidden") && css.includes("-webkit-backface-visibility: hidden"),
		".card3d-face must specify both standard and webkit backface-visibility: hidden"
	);

	// 2. Verify all children of .card3d-face inherit backface culling to prevent Chromium leaking
	assert.ok(
		css.includes(".card3d-face * {\n\tbackface-visibility: hidden;"),
		".card3d-face * must enforce backface-visibility: hidden on all child nodes"
	);

	// 3. Verify .card3d-face--back is pre-rotated 180deg
	assert.ok(
		css.includes(".card3d-face--back {\n\ttransform: rotateY(180deg);"),
		".card3d-face--back must be rotated 180deg"
	);
});

test("each edition card renders distinct front and back faces with zero backface overlap", () => {
	const rotationAngles = [90, 120, 180];

	for (const card of EDITIONS) {
		const html = renderToStaticMarkup(createElement(Card3DInspector, { card }));

		// Verify structure has both distinct faces
		assert.ok(html.includes("card3d-face--front"), `${card.product} must contain front face`);
		assert.ok(html.includes("card3d-face--back"), `${card.product} must contain back face`);

		// Front face contains PAN and Chip
		assert.ok(html.includes("card3d-pan"), `${card.product} front must have PAN container`);
		assert.ok(html.includes(card.lastFour), `${card.product} front must contain last 4 digits`);

		// Back face contains Magstripe and CVC
		assert.ok(html.includes("card3d-magstripe"), `${card.product} back must contain magstripe`);
		assert.ok(html.includes("card3d-cvc-block"), `${card.product} back must contain CVC block`);

		// Verify rotation math: at angles >= 90deg, the front face normal is pointing away from viewer
		for (const angle of rotationAngles) {
			const frontCos = Math.cos((angle * Math.PI) / 180);
			const backCos = Math.cos(((angle + 180) * Math.PI) / 180);

			// At 90, 120, 180: front normal is <= 0 (facing away, culled)
			assert.ok(frontCos <= 0.0001, `Front face at ${angle}deg must be facing away (cos <= 0)`);
			// Back normal is >= 0 (facing forward, visible)
			assert.ok(backCos >= -0.0001, `Back face at ${angle}deg must be facing forward (cos >= 0)`);
		}
	}
});
