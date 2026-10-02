import { SPEND_LIMIT_DEMO } from "../../content/demoData";

/**
 * SpendMeter: Recessed well spend limit indicator (Pass 5, Section 2.1)
 * - Pinned in left-middle of Tile 1
 * - Label: "Marketing team card"
 * - Amount: "$1,240 of $5,000 this month"
 * - Progress bar with --gradient-lumen fill at ~25%
 */
export function SpendMeter() {
	return (
		<div className="off-well off-spend-meter" data-keep-clear="spend-meter">
			<div className="off-spend-meter__top">
				<span className="off-spend-meter__label">{SPEND_LIMIT_DEMO.label}</span>
				<span className="off-spend-meter__spent">{SPEND_LIMIT_DEMO.copy}</span>
			</div>
			<div className="off-spend-meter__track" role="progressbar" aria-valuenow={25} aria-valuemin={0} aria-valuemax={100}>
				<div
					className="off-spend-meter__fill"
					style={{ width: `${SPEND_LIMIT_DEMO.percentage}%` }}
				/>
			</div>
		</div>
	);
}
