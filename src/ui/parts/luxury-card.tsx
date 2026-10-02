import React, { useState, useRef, useCallback } from "react";

export interface LuxuryCardProps {
	cardholderName?: string;
	cardNumber?: string;
	cardName?: string;
	expiry?: string;
	className?: string;
	interactive?: boolean;
}

export function LuxuryCard({
	cardholderName = "VLADISLAV MLADENOV",
	cardNumber = "4532 •••• •••• 7474",
	cardName = "BLACK TITANIUM",
	expiry = "10/31",
	className = "",
	interactive = true,
}: LuxuryCardProps) {
	const [flipped, setFlipped] = useState(false);
	const cardRef = useRef<HTMLDivElement>(null);
	const [transform, setTransform] = useState("perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
	const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

	const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		if (!interactive || !cardRef.current) return;
		const rect = cardRef.current.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const xPct = (x / rect.width) * 100;
		const yPct = (y / rect.height) * 100;

		const rotateY = ((x / rect.width) - 0.5) * 20; // -10 to +10 deg
		const rotateX = (0.5 - (y / rect.height)) * 20; // -10 to +10 deg

		setTransform(`perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
		setGlarePos({ x: xPct, y: yPct, opacity: 0.35 });
	}, [interactive]);

	const handleMouseLeave = useCallback(() => {
		setTransform("perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
		setGlarePos(prev => ({ ...prev, opacity: 0 }));
	}, []);

	return (
		<div className={`titanium-card-container ${className}`}>
			{/* Subtle Soft Ambient Glow */}
			<div className="titanium-ambient-shadow" />

			{/* Physical Titanium Card */}
			<div
				ref={cardRef}
				className={`titanium-card ${flipped ? "titanium-card--flipped" : ""}`}
				style={{
					transform,
					"--glare-x": `${glarePos.x}%`,
					"--glare-y": `${glarePos.y}%`,
					"--glare-opacity": glarePos.opacity,
				} as React.CSSProperties}
				onMouseMove={handleMouseMove}
				onMouseLeave={handleMouseLeave}
				onClick={() => interactive && setFlipped(f => !f)}
				title="Click to flip"
			>
				{/* Specular Light Reflection Sweep */}
				<div className="titanium-card__glare" />
				<div className="titanium-card__rim" />

				{/* FRONT FACE */}
				<div className="titanium-card__face titanium-card__face--front">
					{/* Header: Offcard Monogram & Contactless */}
					<div className="titanium-card__header">
						<div className="titanium-card__brand">
							<svg width="32" height="32" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="titanium-card__symbol">
								<defs>
									<linearGradient id="tc-sym-grad" x1="0%" y1="0%" x2="100%" y2="100%">
										<stop offset="0%" stopColor="#ffffff" />
										<stop offset="50%" stopColor="#c8cdd8" />
										<stop offset="100%" stopColor="#6e7280" />
									</linearGradient>
								</defs>
								<path d="M40 8 L70 25 L70 55 L40 72 L10 55 L10 25 Z" stroke="url(#tc-sym-grad)" strokeWidth="3.5" fill="none" />
								<polygon points="40,24 54,40 40,56 26,40" fill="url(#tc-sym-grad)" />
							</svg>
							<div className="titanium-card__logotype">
								<span className="titanium-card__brand-name">OFFCARD</span>
								<span className="titanium-card__brand-sub">BLACK</span>
							</div>
						</div>

						<div className="titanium-card__contactless" aria-label="NFC Contactless">
							<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
								<path d="M7 16a6 6 0 0 1 0-8" />
								<path d="M10.5 19a10 10 0 0 0 0-14" />
								<path d="M14 21.5a14 14 0 0 0 0-19" />
							</svg>
						</div>
					</div>

					{/* ISO 7816 Smart EMV Chip */}
					<div className="titanium-card__chip-row">
						<div className="titanium-card__chip" aria-label="EMV Chip">
							<div className="titanium-card__chip-grid">
								<div className="titanium-card__chip-line titanium-card__chip-line--h" />
								<div className="titanium-card__chip-line titanium-card__chip-line--v1" />
								<div className="titanium-card__chip-line titanium-card__chip-line--v2" />
								<div className="titanium-card__chip-core" />
							</div>
						</div>
						<span className="titanium-card__edition">{cardName}</span>
					</div>

					{/* Card Digits & Embossed Metadata */}
					<div className="titanium-card__footer">
						<div className="titanium-card__number">
							<span>{cardNumber}</span>
						</div>

						<div className="titanium-card__meta">
							<div className="titanium-card__holder">
								<span className="titanium-card__meta-label">CARDMEMBER</span>
								<strong className="titanium-card__meta-val">{cardholderName}</strong>
							</div>

							<div className="titanium-card__exp">
								<span className="titanium-card__meta-label">EXPIRES</span>
								<strong className="titanium-card__meta-val">{expiry}</strong>
							</div>

							<div className="titanium-card__visa">
								<span>VISA</span>
								<small>INFINITE</small>
							</div>
						</div>
					</div>
				</div>

				{/* BACK FACE */}
				<div className="titanium-card__face titanium-card__face--back">
					<div className="titanium-card__mag-stripe" />
					<div className="titanium-card__back-body">
						<div className="titanium-card__signature-row">
							<div className="titanium-card__signature-strip">
								<span>Authorized Signature &bull; Not Valid Unless Signed</span>
							</div>
							<div className="titanium-card__cvv">839</div>
						</div>
						<div className="titanium-card__disclaimer">
							<p>Issued by OFFCARD Global Liquidity under license from Visa International. For concierge services and immediate assistance, visit offcard.whop.site or call +1 (800) OFFCARD.</p>
							<div className="titanium-card__hologram" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export function OrbitalBackground() {
	return (
		<div className="lithic-orbits" aria-hidden="true">
			<svg className="lithic-orbits__svg" viewBox="0 0 1000 700" fill="none" xmlns="http://www.w3.org/2000/svg">
				<ellipse cx="500" cy="350" rx="460" ry="190" stroke="rgba(255,255,255,0.04)" strokeWidth="1" transform="rotate(-16 500 350)" />
				<ellipse cx="500" cy="350" rx="400" ry="160" stroke="rgba(255,255,255,0.055)" strokeWidth="1" transform="rotate(-16 500 350)" />
				<ellipse cx="500" cy="350" rx="340" ry="135" stroke="rgba(255,255,255,0.07)" strokeWidth="1" transform="rotate(-16 500 350)" />
				<ellipse cx="500" cy="350" rx="280" ry="110" stroke="rgba(255,255,255,0.085)" strokeWidth="1" transform="rotate(-16 500 350)" />
				<ellipse cx="500" cy="350" rx="220" ry="85" stroke="rgba(255,255,255,0.1)" strokeWidth="1" transform="rotate(-16 500 350)" />
				<ellipse cx="500" cy="350" rx="160" ry="60" stroke="rgba(255,255,255,0.12)" strokeWidth="1" transform="rotate(-16 500 350)" />
			</svg>
		</div>
	);
}
