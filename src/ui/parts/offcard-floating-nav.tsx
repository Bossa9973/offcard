import { useState, useEffect } from "react";
import { Wordmark } from "../components/wordmark";

export interface OffcardFloatingNavProps {
	onAction?: () => void;
	href?: string;
}

export function OffcardFloatingNav({ onAction, href = "/api/auth/login" }: OffcardFloatingNavProps) {
	const [scrolled, setScrolled] = useState(false);
	const [activeSection, setActiveSection] = useState("features");
	const [headerTheme, setHeaderTheme] = useState<"dark" | "light">("dark");

	useEffect(() => {
		const onScroll = () => {
			setScrolled(window.scrollY > 20);
		};
		window.addEventListener("scroll", onScroll, { passive: true });
		onScroll();

		// Track active section for nav tabs
		const sections = ["features", "card-designs", "pricing", "faq"];
		const navObserver = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setActiveSection(entry.target.id);
					}
				}
			},
			{ threshold: 0.25 }
		);

		sections.forEach((id) => {
			const el = document.getElementById(id);
			if (el) navObserver.observe(el);
		});

		// 1.1 Adaptive theme IntersectionObserver over [data-band="light|dark"]
		const bandObserver = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						const band = entry.target.getAttribute("data-band");
						setHeaderTheme(band === "light" ? "light" : "dark");
					}
				}
			},
			{ rootMargin: "-32px 0px -90% 0px" }
		);

		const bands = document.querySelectorAll("[data-band]");
		bands.forEach((b) => bandObserver.observe(b));

		return () => {
			window.removeEventListener("scroll", onScroll);
			navObserver.disconnect();
			bandObserver.disconnect();
		};
	}, []);

	const isLight = headerTheme === "light";

	return (
		<header
			className="fixed inset-x-0 top-0 z-50 w-full transition-all duration-200"
			style={{
				background: isLight ? "rgba(255, 255, 255, 0.88)" : "rgba(0, 0, 0, 0.88)",
				backdropFilter: "blur(16px) saturate(120%)",
				WebkitBackdropFilter: "blur(16px) saturate(120%)",
				borderBottom: isLight ? "1px solid rgba(0, 0, 0, 0.08)" : "1px solid rgba(255, 255, 255, 0.08)",
				color: isLight ? "var(--ink, #0a0a0a)" : "#ffffff",
			}}
		>
			<div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-3.5 lg:px-16 lg:py-4">
				{/* 1. Left: Off-Card Logo */}
				<div className="flex items-center">
					<a href="/" className="flex items-center transition-opacity hover:opacity-90" aria-label="Off-Card Home">
						<Wordmark variant={isLight ? "light" : "dark"} size="sm" />
					</a>
				</div>

				{/* 2. Center: Direct text links with active section underline indicator */}
				<nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
					{[
						{ id: "features", label: "Features" },
						{ id: "card-designs", label: "Cards" },
						{ id: "pricing", label: "Pricing" },
						{ id: "faq", label: "FAQ" },
					].map((tab) => {
						const isActive = activeSection === tab.id;
						return (
							<a
								key={tab.id}
								href={`#${tab.id}`}
								className={`relative py-1 text-sm font-medium transition-colors ${
									isActive
										? isLight
											? "text-[#0a0a0a]"
											: "text-white"
										: isLight
											? "text-black/60 hover:text-black"
											: "text-white/60 hover:text-white"
								}`}
							>
								{tab.label}
								{isActive && (
									<span
										className={`absolute -bottom-1 inset-x-0 h-[1.5px] rounded-full transition-all ${
											isLight ? "bg-black" : "bg-white"
										}`}
										aria-hidden="true"
									/>
								)}
							</a>
						);
					})}
				</nav>

				{/* 3. Right: Sign in + Primary CTA */}
				<div className="flex items-center gap-4 sm:gap-6">
					{/* Sign In text link */}
					<a
						href={href}
						className={`text-xs sm:text-sm font-medium transition-colors ${
							isLight ? "text-black/70 hover:text-black" : "text-white/70 hover:text-white"
						}`}
					>
						Sign in
					</a>

					{/* Single Primary CTA Button */}
					<a
						href={onAction ? undefined : href}
						onClick={onAction}
						className={`inline-flex items-center justify-center px-5 py-2 sm:px-5.5 sm:py-2.5 rounded-full font-semibold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap hover:scale-[1.02] active:scale-[0.98] ${
							isLight
								? "bg-black text-white hover:bg-black/90 shadow-[0_2px_16px_rgba(0,0,0,0.18)]"
								: "bg-white text-black hover:bg-white/90 shadow-[0_2px_16px_rgba(255,255,255,0.2)]"
						}`}
					>
						Open account
					</a>
				</div>
			</div>
		</header>
	);
}
