import type { CSSProperties } from "react";

export interface WordmarkProps {
	variant?: "light" | "dark" | "foil";
	size?: "sm" | "md" | "lg";
	className?: string;
	style?: CSSProperties;
	showMarkOnly?: boolean;
}

/**
 * Official Off-Card Wordmark Component (Pass 2, Section 1.1)
 * Clean, inline transparent vector SVG mark with currentColor text.
 * Zero background rectangle, zero compression artifacts, perfect at all zoom levels.
 */
export function Wordmark({
	variant = "dark",
	size = "md",
	className = "",
	style,
	showMarkOnly = false,
}: WordmarkProps) {
	// Size dimensions
	const markSizes = {
		sm: 20,
		md: 24,
		lg: 32,
	};
	const markH = markSizes[size] || 24;

	return (
		<div
			className={`off-wordmark-wrap off-wordmark-wrap--${variant} off-wordmark-wrap--${size} ${className}`}
			style={{
				display: "inline-flex",
				alignItems: "center",
				gap: "8px",
				background: "transparent",
				textDecoration: "none",
				color: variant === "light" ? "var(--ink, #111111)" : "#ffffff",
				...style,
			}}
		>
			{/* Segmented Circle Emblem (SVG) */}
			<svg
				width={markH}
				height={markH}
				viewBox="0 0 48 48"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
				style={{ flexShrink: 0, display: "block" }}
			>
				<defs>
					<linearGradient id={`off-mark-grad-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
						{variant === "foil" ? (
							<>
								<stop offset="0%" stopColor="var(--lumen, #f2f2c6)" />
								<stop offset="100%" stopColor="var(--primary, #dfe1f8)" />
							</>
						) : variant === "light" ? (
							<>
								<stop offset="0%" stopColor="#111111" />
								<stop offset="100%" stopColor="#1a1a1c" />
							</>
						) : (
							<>
								<stop offset="0%" stopColor="var(--lumen, #f2f2c6)" />
								<stop offset="50%" stopColor="#ffffff" />
								<stop offset="100%" stopColor="var(--primary, #dfe1f8)" />
							</>
						)}
					</linearGradient>
				</defs>
				{/* 8 vertical rounded pill bars forming the segmented emblem */}
				<g fill={`url(#off-mark-grad-${variant})`}>
					<rect x="8" y="18" width="4" height="12" rx="2" />
					<rect x="14" y="12" width="4" height="24" rx="2" />
					<rect x="20" y="8" width="4" height="20" rx="2" />
					<rect x="26" y="8" width="4" height="14" rx="2" />
					<rect x="20" y="28" width="4" height="12" rx="2" />
					<rect x="26" y="24" width="4" height="16" rx="2" />
					<rect x="32" y="12" width="4" height="24" rx="2" />
					<rect x="38" y="18" width="4" height="12" rx="2" />
				</g>
			</svg>

			{/* Wordmark Typography */}
			{!showMarkOnly && (
				<span
					className="off-wordmark-text"
					style={{
						fontFamily: "var(--font-display, 'Space Grotesk', sans-serif)",
						fontSize: size === "sm" ? "16px" : size === "lg" ? "24px" : "19px",
						fontWeight: 500,
						letterSpacing: "-0.025em",
						lineHeight: 1,
						color: "currentColor",
					}}
				>
					off-card
				</span>
			)}
		</div>
	);
}
