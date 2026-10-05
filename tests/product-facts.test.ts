import assert from "node:assert/strict";
import { test } from "node:test";
import { PRODUCT_FACTS } from "../src/content/productFacts";

test("PRODUCT_FACTS serves as single source of truth for assets, claims, and brand standards", () => {
	// Brand name assertions
	assert.equal(PRODUCT_FACTS.brand.name, "Off-Card");
	assert.equal(PRODUCT_FACTS.brand.lockup, "off-card");

	// Supported assets assertions
	assert.deepEqual(PRODUCT_FACTS.supportedAssets, ["SOL", "USDC", "ETH", "BTC"]);
	assert.deepEqual(PRODUCT_FACTS.navTickerAssets, ["SOL", "USDC", "ETH"]);

	// Verified claims assertions
	assert.equal(PRODUCT_FACTS.claims.issuanceTime, "Issued in under 30 seconds");
	assert.equal(PRODUCT_FACTS.claims.applePay, "Works with Apple Pay");
	assert.equal(PRODUCT_FACTS.claims.noAnnualFees, "No annual fees");
	assert.equal(PRODUCT_FACTS.claims.refund, "Card balance refundable to source wallet");
	assert.equal(PRODUCT_FACTS.claims.merchantAcceptance, "Cards work at any merchant that accepts Mastercard");
});
