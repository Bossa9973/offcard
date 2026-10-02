import type { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "dark" | "soft" | "outline-light" | "outline-dark";
export type ButtonSize = "md" | "sm";

export interface ButtonProps {
	variant?: ButtonVariant;
	size?: ButtonSize;
	icon?: boolean | ReactNode;
	as?: "button" | "a";
	href?: string;
	children: ReactNode;
	className?: string;
	onClick?: () => void;
	disabled?: boolean;
	type?: "button" | "submit" | "reset";
}

export function ArrowUpRightIcon({ className }: { className?: string }) {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={`off-btn-icon ${className || ""}`}
		>
			<line x1="7" y1="17" x2="17" y2="7" />
			<polyline points="7 7 17 7 17 17" />
		</svg>
	);
}

export function Button({
	variant = "primary",
	size = "md",
	icon = false,
	as = "button",
	href,
	children,
	className = "",
	onClick,
	disabled = false,
	type = "button",
}: ButtonProps) {
	const classNames = `off-btn off-btn--${variant} off-btn--${size} ${className}`;

	const content = (
		<>
			<span>{children}</span>
			{icon === true ? <ArrowUpRightIcon /> : icon ? icon : null}
		</>
	);

	if (as === "a" || href) {
		return (
			<a
				href={href}
				className={classNames}
				onClick={disabled ? (e) => e.preventDefault() : onClick}
				aria-disabled={disabled}
			>
				{content}
			</a>
		);
	}

	return (
		<button
			type={type}
			className={classNames}
			onClick={onClick}
			disabled={disabled}
		>
			{content}
		</button>
	);
}
