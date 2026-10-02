import type { SVGProps } from "react";

export type CurrencyCode = "USDC" | "USDT" | "ETH" | "BTC" | "USD" | "EUR" | "GBP" | string;

export interface CurrencyIconProps extends SVGProps<SVGSVGElement> {
	code: CurrencyCode;
	size?: number;
	className?: string;
}

/**
 * Authentic vector SVG icons for crypto and fiat currencies.
 * Crisp, high-contrast, scalable badges for USDC, USDT, ETH, BTC, USD, EUR, GBP.
 */
export function CurrencyIcon({
	code,
	size = 20,
	className = "",
	style,
	...rest
}: CurrencyIconProps) {
	const normalized = code.toUpperCase().trim();

	switch (normalized) {
		case "USDC":
			return (
				<svg
					width={size}
					height={size}
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className={`off-currency-icon off-currency-icon--usdc ${className}`}
					aria-label="USDC icon"
					role="img"
					style={{ flexShrink: 0, ...style }}
					{...rest}
				>
					<circle cx="12" cy="12" r="11" fill="#2775CA" />
					<path
						d="M12.75 6.5C9.75 6.5 8 8 8 10.25C8 13.8 16 12.3 16 15.2C16 16.7 14.5 17.5 12.5 17.5C10.5 17.5 9 16.6 8.35 15.2M12 5V6.5M12 17.5V19"
						stroke="#FFFFFF"
						strokeWidth="1.6"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M6 12C6 8.686 8.686 6 12 6"
						stroke="#FFFFFF"
						strokeWidth="1.2"
						strokeOpacity="0.6"
						strokeLinecap="round"
					/>
					<path
						d="M18 12C18 15.314 15.314 18 12 18"
						stroke="#FFFFFF"
						strokeWidth="1.2"
						strokeOpacity="0.6"
						strokeLinecap="round"
					/>
				</svg>
			);

		case "USDT":
			return (
				<svg
					width={size}
					height={size}
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className={`off-currency-icon off-currency-icon--usdt ${className}`}
					aria-label="USDT icon"
					role="img"
					style={{ flexShrink: 0, ...style }}
					{...rest}
				>
					<circle cx="12" cy="12" r="11" fill="#26A17B" />
					<path
						d="M13.2 11.2V9.8H17V7.5H7V9.8H10.8V11.2C7.8 11.4 5.5 12.1 5.5 13C5.5 13.9 7.8 14.6 10.8 14.8V17.5H13.2V14.8C16.2 14.6 18.5 13.9 18.5 13C18.5 12.1 16.2 11.4 13.2 11.2ZM12 13.9C9.2 13.9 7.3 13.4 7.3 13C7.3 12.6 9.2 12.1 12 12.1C14.8 12.1 16.7 12.6 16.7 13C16.7 13.4 14.8 13.9 12 13.9Z"
						fill="#FFFFFF"
					/>
				</svg>
			);

		case "ETH":
			return (
				<svg
					width={size}
					height={size}
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className={`off-currency-icon off-currency-icon--eth ${className}`}
					aria-label="Ethereum icon"
					role="img"
					style={{ flexShrink: 0, ...style }}
					{...rest}
				>
					<circle cx="12" cy="12" r="11" fill="#627EEA" />
					<path d="M12 4L6.5 12.5L12 15.5L17.5 12.5L12 4Z" fill="#FFFFFF" fillOpacity="0.85" />
					<path d="M12 4L6.5 12.5L12 15.5V4Z" fill="#FFFFFF" fillOpacity="0.95" />
					<path d="M12 16.5L6.5 13.5L12 20L17.5 13.5L12 16.5Z" fill="#FFFFFF" fillOpacity="0.85" />
					<path d="M12 16.5L6.5 13.5L12 20V16.5Z" fill="#FFFFFF" fillOpacity="0.95" />
				</svg>
			);

		case "BTC":
			return (
				<svg
					width={size}
					height={size}
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className={`off-currency-icon off-currency-icon--btc ${className}`}
					aria-label="Bitcoin icon"
					role="img"
					style={{ flexShrink: 0, ...style }}
					{...rest}
				>
					<circle cx="12" cy="12" r="11" fill="#F7931A" />
					<path
						d="M15.5 10.2C15.8 8.8 14.8 8.1 13.4 7.8L13.8 6.2L12.8 6L12.4 7.6C12.1 7.5 11.8 7.4 11.5 7.4L11.9 5.8L10.9 5.6L10.5 7.2C10.2 7.1 9.9 7 9.7 7L8.4 6.7L8.1 7.9C8.1 7.9 8.8 8.1 8.8 8.1C9.2 8.2 9.3 8.5 9.2 8.8L8.3 12.4C8.4 12.4 8.5 12.5 8.6 12.5L8.3 12.4L7.1 17.2C7 17.5 6.7 17.7 6.4 17.6C6.4 17.6 5.7 17.4 5.7 17.4L5.2 18.7L6.6 19.1C6.9 19.2 7.2 19.3 7.5 19.4L7.1 21L8.1 21.2L8.5 19.6C8.8 19.7 9.1 19.8 9.4 19.8L9 21.4L10 21.6L10.4 20C12.2 20.3 13.5 20.1 14.2 18.6C14.7 17.4 14.3 16.6 13.4 16.1C14 15.6 14.4 14.8 14.2 13.7C14 12.7 13.2 12.1 12.2 11.8C12.9 11.7 13.5 11.2 13.8 10.5M13 15.5C12.7 16.7 10.4 16.1 9.5 15.9L10.2 13.1C11.1 13.3 13.4 14.1 13 15.5ZM13.4 11.2C13.1 12.3 11.1 11.8 10.4 11.6L11 9.2C11.8 9.4 13.7 9.9 13.4 11.2Z"
						fill="#FFFFFF"
					/>
				</svg>
			);

		case "USD":
			return (
				<svg
					width={size}
					height={size}
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className={`off-currency-icon off-currency-icon--usd ${className}`}
					aria-label="USD icon"
					role="img"
					style={{ flexShrink: 0, ...style }}
					{...rest}
				>
					<circle cx="12" cy="12" r="11" fill="#1C1C20" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
					<path
						d="M12 6V18M14.5 9C14.5 7.6 13.4 6.8 12 6.8C10.6 6.8 9.5 7.6 9.5 8.9C9.5 11.5 14.5 10.8 14.5 13.5C14.5 14.9 13.4 15.8 12 15.8C10.4 15.8 9.3 14.8 9.3 13.5"
						stroke="#FFFFFF"
						strokeWidth="1.8"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			);

		case "EUR":
			return (
				<svg
					width={size}
					height={size}
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className={`off-currency-icon off-currency-icon--eur ${className}`}
					aria-label="EUR icon"
					role="img"
					style={{ flexShrink: 0, ...style }}
					{...rest}
				>
					<circle cx="12" cy="12" r="11" fill="#152B52" />
					<path
						d="M15.5 8.5C14.5 7.3 13.2 6.8 11.8 6.8C8.8 6.8 6.8 9.2 6.8 12.2C6.8 15.2 8.8 17.6 11.8 17.6C13.2 17.6 14.5 17.1 15.5 15.9M6 10.8H13M6 13.2H13"
						stroke="#FFFFFF"
						strokeWidth="1.8"
						strokeLinecap="round"
					/>
				</svg>
			);

		case "GBP":
			return (
				<svg
					width={size}
					height={size}
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className={`off-currency-icon off-currency-icon--gbp ${className}`}
					aria-label="GBP icon"
					role="img"
					style={{ flexShrink: 0, ...style }}
					{...rest}
				>
					<circle cx="12" cy="12" r="11" fill="#401826" />
					<path
						d="M14.5 8.5C14.5 7.4 13.6 6.5 12.4 6.5C10.8 6.5 9.8 7.8 9.8 10V16.8H15M8.5 12.2H13.5M8 17.5H16"
						stroke="#FFFFFF"
						strokeWidth="1.8"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			);

		default:
			return (
				<span
					className={`off-currency-disc-fallback ${className}`}
					style={{
						display: "inline-flex",
						alignItems: "center",
						justifyContent: "center",
						width: size,
						height: size,
						borderRadius: "9999px",
						background: "rgba(255,255,255,0.12)",
						color: "#FFFFFF",
						fontSize: Math.round(size * 0.55),
						fontWeight: 700,
						flexShrink: 0,
						...style,
					}}
					aria-hidden="true"
				>
					{normalized.slice(0, 1)}
				</span>
			);
	}
}
