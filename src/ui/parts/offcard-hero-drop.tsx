import { useEffect, useRef, useState } from "react";
import { HalftoneField } from "../components/halftone-field";
import { Pinstripe } from "../components/pinstripe";
import { PRODUCT_FACTS } from "../../content/productFacts";

export interface OffcardHeroDropProps {
	onAction?: () => void;
	href?: string;
}

const HEADLINE_WORDS = [
	"Cards",
	"work",
	"at",
	"any",
	"merchant",
	"that",
	"accepts",
	"Mastercard.",
];

export function OffcardHeroDrop({ onAction, href = "/api/auth/login" }: OffcardHeroDropProps) {
	const dropTrackRef = useRef<HTMLDivElement>(null);
	const [scrollProgress, setScrollProgress] = useState(0);

	useEffect(() => {
		const handleScroll = () => {
			if (!dropTrackRef.current) return;
			const rect = dropTrackRef.current.getBoundingClientRect();
			const totalTravel = rect.height - window.innerHeight;
			if (totalTravel <= 0) return;

			// progress: 0 when sticky section pins, 1 when it unpins
			const current = -rect.top;
			const p = Math.max(0, Math.min(1, current / totalTravel));
			setScrollProgress(p);
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		handleScroll();
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const lerp = (start: number, end: number, p: number) => start + (end - start) * p;
	const clampRange = (p: number, min: number, max: number) => {
		if (p <= min) return 0;
		if (p >= max) return 1;
		return (p - min) / (max - min);
	};

	// Hero intro fade out during initial scroll (0.00 -> 0.20)
	const heroIntroP = clampRange(scrollProgress, 0.0, 0.20);
	const heroIntroOpacity = 1 - heroIntroP;
	const heroIntroTranslateY = -heroIntroP * 60;

	// 1. 3D Card Drop & Tilt animation (0.00 -> 0.45)
	const cardDropP = clampRange(scrollProgress, 0.0, 0.45);
	// Front Black Titanium Card starts with top edge at ~54vh in initial viewport,
	// then glides up into center focus
	const frontCardY = lerp(85, -20, cardDropP);
	const frontCardRotX = lerp(16, 20, cardDropP);
	const frontCardRotZ = lerp(0, -3.5, cardDropP);
	const frontCardScale = lerp(0.96, 1.02, cardDropP);

	// Back Platinum Silver Card drops & sits ~85px below front card with clean visible separation
	const backCardY = lerp(95, 68, cardDropP);
	const backCardRotX = lerp(16, 22, cardDropP);
	const backCardRotZ = lerp(0, 2.8, cardDropP);
	const backCardZ = lerp(-40, -150, cardDropP);
	const backCardScale = lerp(0.92, 0.96, cardDropP);

	// 2. Headline & factual strip reveal underneath (0.20 -> 0.48)
	const headlineContainerP = clampRange(scrollProgress, 0.20, 0.48);
	const headlineOpacity = headlineContainerP;
	const headlineTranslateY = lerp(25, 0, headlineContainerP);

	return (
		<div className="w-full">
			{/* Sticky Pin Container for Unified Hero + 3D Card Drop */}
			<div
				ref={dropTrackRef}
				data-band="dark"
				className="relative w-full"
				style={{ height: "230vh" }}
			>
				<div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden px-4 select-none">
					{/* Halftone Texture Overlay */}
					<HalftoneField variant="hero" pitch={24} className="off-hero-halftone pointer-events-none opacity-60" />

					{/* Ambient Radial Spotlight */}
					<div
						className="pointer-events-none absolute inset-0 z-0"
						style={{
							background:
								"radial-gradient(ellipse 70% 60% at 50% 38%, rgba(255, 255, 255, 0.06) 0%, rgba(223, 225, 248, 0.02) 40%, transparent 70%)",
						}}
					/>

					{/* =================================================================
					    1. HERO INTRO HEADLINE BLOCK (Centered at ~20vh on load)
					    ================================================================= */}
					<div
						className="absolute inset-x-0 top-[14vh] sm:top-[16vh] lg:top-[18vh] z-20 flex flex-col items-center text-center px-4 max-w-4xl mx-auto transition-opacity duration-200"
						style={{
							opacity: heroIntroOpacity,
							transform: `translateY(${heroIntroTranslateY}px)`,
							pointerEvents: heroIntroOpacity < 0.2 ? "none" : "auto",
						}}
					>
						{/* Centered H1 in Space Grotesk 500, sentence case, text-wrap: balance */}
						<h1 className="text-4xl sm:text-6xl lg:text-[68px] font-medium text-white tracking-tight leading-[1.08] max-w-3xl mb-3.5 font-display [text-wrap:balance]">
							Spend crypto where cards are accepted
						</h1>

						{/* Lead Paragraph */}
						<p className="text-xs sm:text-sm lg:text-base text-white/60 font-normal max-w-lg leading-relaxed mb-6 font-display [text-wrap:pretty]">
							Fund a virtual or metal card from your crypto balance and pay at any merchant that accepts Mastercard.
						</p>

						{/* Hero CTA Button */}
						<a
							href={onAction ? undefined : href}
							onClick={onAction}
							className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-white text-black font-semibold text-xs sm:text-sm shadow-[0_4px_24px_rgba(255,255,255,0.22)] hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer font-display"
						>
							Get the Card
						</a>

						{/* Quiet compatibility row below CTA */}
						<div className="flex items-center gap-2 mt-3.5 text-xs text-white/40 font-display">
							<span>{PRODUCT_FACTS.claims.applePay}</span>
							<span>•</span>
							<span>Contactless Mastercard</span>
						</div>
					</div>

					{/* =================================================================
					    2. 3D STAGE CONTAINER (Card top edge at ~54vh on load)
					    ================================================================= */}
					<div
						className="relative w-full max-w-[1440px] flex items-center justify-center z-10"
						style={{
							height: "330px",
							perspective: "1200px",
							perspectiveOrigin: "50% 50%",
							marginTop: "4vh",
						}}
					>
						{/* Floor ambient specular shadow under the cards */}
						<div
							className="pointer-events-none absolute -bottom-6 w-[580px] h-[130px] rounded-full blur-3xl opacity-50 will-change-transform"
							style={{
								background:
									"radial-gradient(ellipse at center, rgba(255, 255, 255, 0.22), rgba(60, 60, 70, 0.12) 50%, transparent 75%)",
								transform: `scale(${lerp(0.85, 1.25, cardDropP)})`,
							}}
						/>

						{/* 1. BACK CARD: Platinum Silver OffCard */}
						<div
							className="card-3d-back absolute will-change-transform rounded-2xl lg:rounded-[32px] overflow-hidden"
							style={{
								width: "min(490px, 84vw)",
								aspectRatio: "1.59 / 1",
								transformStyle: "preserve-3d",
								transform: `translateY(${backCardY}px) translateZ(${backCardZ}px) rotateX(${backCardRotX}deg) rotateZ(${backCardRotZ}deg) scale(${backCardScale})`,
								boxShadow: "0 30px 65px -15px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.3)",
								zIndex: 1,
							}}
						>
							<img
								src="/images/cards/offcard-hero-silver.webp"
								alt="OffCard Platinum Silver"
								className="w-full h-full object-cover rounded-2xl lg:rounded-[32px] pointer-events-none select-none brightness-[0.88]"
								loading="eager"
							/>
						</div>

						{/* 2. FRONT CARD: Black Titanium OffCard */}
						<div
							className="card-3d-front absolute will-change-transform rounded-2xl lg:rounded-[32px] overflow-hidden cursor-pointer"
							style={{
								width: "min(520px, 88vw)",
								aspectRatio: "1.59 / 1",
								transformStyle: "preserve-3d",
								transform: `translateY(${frontCardY}px) translateZ(40px) rotateX(${frontCardRotX}deg) rotateZ(${frontCardRotZ}deg) scale(${frontCardScale})`,
								boxShadow:
									"0 35px 80px -20px rgba(0,0,0,0.95), 0 0 45px rgba(255, 255, 255, 0.08)",
								zIndex: 2,
							}}
						>
							<img
								src="/images/cards/offcard-hero-black.webp"
								alt="Off-Card Black Titanium"
								className="w-full h-full object-cover rounded-2xl lg:rounded-[32px] pointer-events-none select-none"
								loading="eager"
							/>

							{/* Moneta Reference Pinstripe treatment */}
							<div className="absolute inset-0 pointer-events-none opacity-40">
								<Pinstripe seed={11} className="w-full h-full" />
							</div>

							{/* Edge specular sheen line */}
							<div
								className="pointer-events-none absolute bottom-0 inset-x-0 h-[1.5px] opacity-75"
								style={{
									background:
										"linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)",
								}}
							/>
						</div>
					</div>

					{/* =============================================================
					    3. HEADLINE REVEAL & GROUNDED 3-COLUMN FACTUAL GRID STRIP
					    ============================================================= */}
					<div
						className="w-full max-w-[1040px] px-4 flex flex-col items-center text-center will-change-transform z-20 mt-4 sm:mt-6"
						style={{
							opacity: headlineOpacity,
							transform: `translateY(${headlineTranslateY}px)`,
							pointerEvents: headlineOpacity < 0.2 ? "none" : "auto",
						}}
					>
						<h2 className="text-xl sm:text-2xl lg:text-[34px] font-medium tracking-tight leading-snug sm:leading-tight lg:leading-[42px] max-w-[830px] mx-auto mb-4 font-display [text-wrap:balance]">
							{HEADLINE_WORDS.map((word, i) => {
								const threshold = 0.2 + (i / HEADLINE_WORDS.length) * 0.2;
								const isLit = scrollProgress >= threshold;
								return (
									<span
										key={i}
										className="inline-block mx-1 transition-all duration-200"
										style={{
											color: isLit ? "#FFFFFF" : "rgba(255, 255, 255, 0.28)",
											textShadow: isLit
												? "0 0 20px rgba(255, 255, 255, 0.4)"
												: "none",
										}}
									>
										{word}
									</span>
								);
							})}
						</h2>

						{/* Aligned 3-column factual grid strip on 12-column grid */}
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 w-full pt-5 border-t border-white/10 mt-1 text-left">
							<div>
								<div className="text-sm sm:text-base font-medium text-white font-display">
									{PRODUCT_FACTS.claims.noAnnualFees}<sup className="text-white/40 text-xs ml-0.5">1</sup>
								</div>
								<div className="text-xs text-white/50 mt-1">
									Zero monthly maintenance fees or account minimums.
								</div>
							</div>
							<div>
								<div className="text-sm sm:text-base font-medium text-white font-display">
									{PRODUCT_FACTS.claims.issuanceTime}<sup className="text-white/40 text-xs ml-0.5">2</sup>
								</div>
								<div className="text-xs text-white/50 mt-1">
									Virtual card credentials generated after verification.
								</div>
							</div>
							<div>
								<div className="text-sm sm:text-base font-medium text-white font-display">
									{PRODUCT_FACTS.claims.refund}<sup className="text-white/40 text-xs ml-0.5">3</sup>
								</div>
								<div className="text-xs text-white/50 mt-1">
									Unspent card balances return to your source wallet.
								</div>
							</div>
						</div>

						{/* Footnote notes */}
						<div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-[12px] text-white/30 mt-4">
							<span>1. Foreign transaction fees apply to non-base currencies.</span>
							<span>2. Applies to virtual cards; physical cards ship via tracked courier.</span>
							<span>3. Subject to blockchain network transaction confirmation times.</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
