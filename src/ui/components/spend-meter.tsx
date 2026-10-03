import { useState } from "react";
import { SPEND_LIMIT_DEMO } from "../../content/demoData";

/**
 * SpendMeter: Interactive recessed well spend limit indicator (Scroll-Craft Enhanced)
 * - Pinned in left-middle of Tile 1
 * - Interactive limit presets ($2.5k, $5k, $10k)
 * - Dynamic percentage calculation with spring transition
 */
export function SpendMeter() {
	const spent = 1240;
	const [limit, setLimit] = useState(5000);

	const percentage = Math.min(100, Math.max(5, Math.round((spent / limit) * 100)));

	return (
		<div className="off-well off-spend-meter" data-keep-clear="spend-meter">
			<div className="off-spend-meter__top">
				<span className="off-spend-meter__label">{SPEND_LIMIT_DEMO.label}</span>
				<span className="off-spend-meter__spent">
					${spent.toLocaleString()} of ${limit.toLocaleString()} this month
				</span>
			</div>
			<div
				className="off-spend-meter__track"
				role="progressbar"
				aria-valuenow={percentage}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-label="Monthly spend limit progress"
			>
				<div
					className="off-spend-meter__fill"
					style={{
						width: `${percentage}%`,
						transition: "width 0.28s cubic-bezier(0.22, 0.8, 0.24, 1)",
					}}
				/>
			</div>

			{/* Interactive Preset Controls */}
			<div className="off-spend-meter__presets">
				<span className="off-spend-meter__tag">Cap:</span>
				<div className="off-spend-presets-row" role="group" aria-label="Spend limit presets">
					{[2500, 5000, 10000].map((val) => (
						<button
							key={val}
							type="button"
							className={`off-spend-pill ${limit === val ? "off-spend-pill--active" : ""}`}
							onClick={() => setLimit(val)}
							aria-label={`Set cap to $${val.toLocaleString()}`}
						>
							${val >= 1000 ? `${val / 1000}k` : val}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}

