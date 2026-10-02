import { useEffect, useState } from "react";
import { SAMPLE_CRYPTO_ASSETS, type CryptoAssetItem } from "../../content/demoData";
import { CurrencyIcon } from "./currency-icons";

/**
 * AssetsTicker: Renders crypto assets with real vector SVG currency badges
 * and subtle live tick demo fluctuation (Pass 5, Section 4.5 & User Request)
 */
export function AssetsTicker() {
	const [assets, setAssets] = useState<CryptoAssetItem[]>(() => [...SAMPLE_CRYPTO_ASSETS]);
	const [tickingCode, setTickingCode] = useState<string | null>(null);

	useEffect(() => {
		const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (reduce) return;

		// Every 7.5 seconds, randomly fluctuate one row by a tiny amount ($10 - $40)
		const timer = setInterval(() => {
			if (document.hidden) return;

			setAssets((prev) => {
				const targetIdx = Math.floor(Math.random() * prev.length);
				const target = prev[targetIdx];
				if (!target) return prev;

				const delta = (Math.random() > 0.5 ? 1 : -1) * (15 + Math.floor(Math.random() * 25));
				const newNum = Math.max(1000, target.numericValue + delta);
				const formatted = `$${newNum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

				setTickingCode(target.code);
				setTimeout(() => setTickingCode(null), 300);

				return prev.map((item, idx) => (idx === targetIdx ? { ...item, amount: formatted, numericValue: newNum } : item));
			});
		}, 7500);

		return () => clearInterval(timer);
	}, []);

	return (
		<div className="off-currency-rows" data-keep-clear="currency-rows">
			{assets.map((item) => {
				const isTicking = tickingCode === item.code;
				return (
					<div
						key={item.code}
						className={`off-well off-currency-row ${isTicking ? "off-currency-row--ticking" : ""}`}
					>
						<div className="off-currency-left">
							{/* Real SVG vector currency badge */}
							<CurrencyIcon code={item.code} size={28} />
							<div className="off-currency-names">
								<span className="off-currency-name">{item.code}</span>
								<span className="off-currency-subname">{item.name}</span>
							</div>
						</div>
						<strong className="off-currency-val" aria-label={`${item.code} balance: ${item.amount}`}>
							<span aria-hidden="true" className={isTicking ? "off-digit-roll" : ""}>
								{item.amount}
							</span>
						</strong>
					</div>
				);
			})}
		</div>
	);
}
