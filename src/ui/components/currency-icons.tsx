import { useId, type SVGProps } from "react";

export type CurrencyCode = "USDC" | "USDT" | "TETHER" | "ETH" | "ETHEREUM" | "BTC" | "BITCOIN" | "SOL" | "SOLANA" | "USD" | "EUR" | "GBP" | string;

export interface CurrencyIconProps extends SVGProps<SVGSVGElement> {
	code: CurrencyCode;
	size?: number;
	className?: string;
}

/**
 * Authentic vector SVG icons for crypto and fiat currencies.
 * Crisp, high-contrast, scalable badges for USDC, USDT, ETH, BTC, SOL, USD, EUR, GBP.
 */
export function CurrencyIcon({
	code,
	size = 20,
	className = "",
	style,
	...rest
}: CurrencyIconProps) {
	const rawId = useId();
	const uid = rawId.replace(/:/g, "_");
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
		case "TETHER":
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
		case "ETHEREUM":
			return (
				<svg
					width={size}
					height={size}
					viewBox="0 0 32 32"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					xmlnsXlink="http://www.w3.org/1999/xlink"
					className={`off-currency-icon off-currency-icon--eth ${className}`}
					aria-label="Ethereum icon"
					role="img"
					style={{ flexShrink: 0, ...style }}
					{...rest}
				>
					<defs>
						<linearGradient id={`eth-c-${uid}`} x1="50%" x2="50%" y1="0%" y2="100%">
							<stop offset="0%" stopColor="#FFF" stopOpacity={0.5} />
							<stop offset="100%" stopColor="#FFF" stopOpacity={0.5} />
						</linearGradient>
						<circle id={`eth-b-${uid}`} cx={16} cy={15} r={15} />
						<filter
							id={`eth-a-${uid}`}
							width="111.7%"
							height="111.7%"
							x="-5.8%"
							y="-4.2%"
							filterUnits="objectBoundingBox"
						>
							<feOffset dy={0.5} in="SourceAlpha" result="shadowOffsetOuter1" />
							<feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation={0.5} />
							<feComposite in="shadowBlurOuter1" in2="SourceAlpha" operator="out" result="shadowBlurOuter1" />
							<feColorMatrix
								in="shadowBlurOuter1"
								values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.199473505 0"
							/>
						</filter>
						<path
							id={`eth-e-${uid}`}
							d="M16.4977734,20.9675435 L23.9999473,16.616495 L16.4977207,26.9946245 L16.4976173,26.9943278 L9,16.6164144 L16.4977734,20.9674935 Z M16.4977471,3.00004297 L23.9954941,15.2198561 L16.4977734,19.5730917 L9,15.2198561 L16.4977471,3.00004297 Z"
						/>
						<filter
							id={`eth-d-${uid}`}
							width="123.3%"
							height="114.6%"
							x="-11.7%"
							y="-5.2%"
							filterUnits="objectBoundingBox"
						>
							<feOffset dy={0.5} in="SourceAlpha" result="shadowOffsetOuter1" />
							<feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation={0.5} />
							<feComposite in="shadowBlurOuter1" in2="SourceAlpha" operator="out" result="shadowBlurOuter1" />
							<feColorMatrix
								in="shadowBlurOuter1"
								values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.204257246 0"
							/>
						</filter>
					</defs>
					<g fill="none" fillRule="evenodd">
						<use fill="#000" filter={`url(#eth-a-${uid})`} href={`#eth-b-${uid}`} xlinkHref={`#eth-b-${uid}`} />
						<use fill="#627EEA" href={`#eth-b-${uid}`} xlinkHref={`#eth-b-${uid}`} />
						<use
							fill={`url(#eth-c-${uid})`}
							style={{ mixBlendMode: "soft-light" }}
							href={`#eth-b-${uid}`}
							xlinkHref={`#eth-b-${uid}`}
						/>
						<circle cx={16} cy={15} r={14.5} stroke="#000" strokeOpacity={0.097} />
						<g fillRule="nonzero">
							<use fill="#000" filter={`url(#eth-d-${uid})`} href={`#eth-e-${uid}`} xlinkHref={`#eth-e-${uid}`} />
							<use fill="#FFF" fillOpacity={0} fillRule="evenodd" href={`#eth-e-${uid}`} xlinkHref={`#eth-e-${uid}`} />
						</g>
						<g fill="#FFF" fillRule="nonzero" transform="translate(9 3)">
							<polygon fillOpacity={0.602} points="7.498 0 7.498 8.87 14.995 12.22" />
							<polygon points="7.498 0 0 12.22 7.498 8.87" />
							<polygon fillOpacity={0.602} points="7.498 17.968 7.498 23.995 15 13.616" />
							<polygon points="7.498 23.995 7.498 17.967 0 13.616" />
							<polygon fillOpacity={0.2} points="7.498 16.573 14.995 12.22 7.498 8.872" />
							<polygon fillOpacity={0.602} points="0 12.22 7.498 16.573 7.498 8.872" />
						</g>
					</g>
				</svg>
			);

		case "BTC":
		case "BITCOIN":
			return (
				<svg
					width={size}
					height={size}
					viewBox="0 0 32 32"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					xmlnsXlink="http://www.w3.org/1999/xlink"
					className={`off-currency-icon off-currency-icon--btc ${className}`}
					aria-label="Bitcoin icon"
					role="img"
					style={{ flexShrink: 0, ...style }}
					{...rest}
				>
					<defs>
						<linearGradient id={`btc-c-${uid}`} x1="50%" x2="50%" y1="0%" y2="100%">
							<stop offset="0%" stopColor="#FFF" stopOpacity={0.5} />
							<stop offset="100%" stopColor="#FFF" stopOpacity={0.5} />
						</linearGradient>
						<circle id={`btc-b-${uid}`} cx={16} cy={15} r={15} />
						<filter
							id={`btc-a-${uid}`}
							width="111.7%"
							height="111.7%"
							x="-5.8%"
							y="-4.2%"
							filterUnits="objectBoundingBox"
						>
							<feOffset dy={0.5} in="SourceAlpha" result="shadowOffsetOuter1" />
							<feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation={0.5} />
							<feComposite in="shadowBlurOuter1" in2="SourceAlpha" operator="out" result="shadowBlurOuter1" />
							<feColorMatrix
								in="shadowBlurOuter1"
								values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.199473505 0"
							/>
						</filter>
						<path
							id={`btc-e-${uid}`}
							d="M23.1889526,13.0201846 C23.5025526,10.9239385 21.9064911,9.79704615 19.7240911,9.04529231 L20.4320295,6.20566154 L18.7035372,5.77489231 L18.0143065,8.53969231 C17.5599065,8.42646154 17.0931988,8.31963077 16.6294449,8.21378462 L17.3235988,5.43076923 L15.5960911,5 L14.8876603,7.83864615 C14.5115372,7.75298462 14.1423065,7.66830769 13.7839065,7.5792 L13.7858757,7.57033846 L11.4021218,6.97513846 L10.9423065,8.82129231 C10.9423065,8.82129231 12.224768,9.1152 12.1976911,9.13341538 C12.8977526,9.30818462 13.0242757,9.77144615 13.0031065,10.1387077 L12.1967065,13.3736615 C12.2449526,13.3859692 12.3074757,13.4036923 12.3763988,13.4312615 C12.3187988,13.4169846 12.2572603,13.4012308 12.1937526,13.3859692 L11.0634142,17.9176615 C10.9777526,18.1303385 10.7606449,18.4493538 10.2712911,18.3282462 C10.2885218,18.3533538 9.01492185,18.0146462 9.01492185,18.0146462 L8.15682954,19.9932308 L10.4061834,20.5539692 C10.8246449,20.6588308 11.2347372,20.7686154 11.6384295,20.872 L10.9231065,23.7441231 L12.6496295,24.1748923 L13.3580603,21.3332923 C13.8296911,21.4612923 14.2875372,21.5794462 14.7355372,21.6907077 L14.029568,24.5190154 L15.7580603,24.9497846 L16.4733834,22.0830769 C19.4208295,22.6408615 21.6371988,22.4158769 22.5701218,19.7500308 C23.3218757,17.6035692 22.5327065,16.3654154 20.9819372,15.5580308 C22.1112911,15.2976 22.9619988,14.5547077 23.1889526,13.0201846 L23.1889526,13.0201846 Z M19.2396603,18.5581538 C18.7055065,20.7046154 15.0914757,19.5442462 13.9197834,19.2532923 L14.8689526,15.4482462 C16.0406449,15.7406769 19.7979372,16.3196308 19.2396603,18.5581538 Z M19.7743065,12.9891692 C19.2869218,14.9416615 16.2789218,13.9496615 15.303168,13.7064615 L16.1637218,10.2553846 C17.1394757,10.4985846 20.2818757,10.9524923 19.7743065,12.9891692 Z"
						/>
						<filter
							id={`btc-d-${uid}`}
							width="123.2%"
							height="117.5%"
							x="-11.6%"
							y="-6.3%"
							filterUnits="objectBoundingBox"
						>
							<feOffset dy={0.5} in="SourceAlpha" result="shadowOffsetOuter1" />
							<feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation={0.5} />
							<feComposite in="shadowBlurOuter1" in2="SourceAlpha" operator="out" result="shadowBlurOuter1" />
							<feColorMatrix
								in="shadowBlurOuter1"
								values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.204257246 0"
							/>
						</filter>
					</defs>
					<g fill="none" fillRule="evenodd">
						<use fill="#000" filter={`url(#btc-a-${uid})`} href={`#btc-b-${uid}`} xlinkHref={`#btc-b-${uid}`} />
						<use fill="#F7931A" href={`#btc-b-${uid}`} xlinkHref={`#btc-b-${uid}`} />
						<use
							fill={`url(#btc-c-${uid})`}
							style={{ mixBlendMode: "soft-light" }}
							href={`#btc-b-${uid}`}
							xlinkHref={`#btc-b-${uid}`}
						/>
						<circle cx={16} cy={15} r={14.5} stroke="#000" strokeOpacity={0.097} />
						<g fillRule="nonzero">
							<use fill="#000" filter={`url(#btc-d-${uid})`} href={`#btc-e-${uid}`} xlinkHref={`#btc-e-${uid}`} />
							<use fill="#FFF" fillRule="evenodd" href={`#btc-e-${uid}`} xlinkHref={`#btc-e-${uid}`} />
						</g>
					</g>
				</svg>
			);

		case "SOL":
		case "SOLANA":
			return (
				<svg
					width={size}
					height={size}
					viewBox="0 0 36 36"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className={`off-currency-icon off-currency-icon--sol ${className}`}
					aria-label="Solana icon"
					role="img"
					style={{ flexShrink: 0, ...style }}
					{...rest}
				>
					<defs>
						<linearGradient x1="90.737%" y1="34.776%" x2="35.509%" y2="55.415%" id={`sol-a-${uid}`}>
							<stop stopColor="#00FFA3" offset="0%" />
							<stop stopColor="#DC1FFF" offset="100%" />
						</linearGradient>
						<linearGradient x1="66.588%" y1="43.8%" x2="11.36%" y2="64.439%" id={`sol-b-${uid}`}>
							<stop stopColor="#00FFA3" offset="0%" />
							<stop stopColor="#DC1FFF" offset="100%" />
						</linearGradient>
						<linearGradient x1="78.586%" y1="39.317%" x2="23.358%" y2="59.956%" id={`sol-c-${uid}`}>
							<stop stopColor="#00FFA3" offset="0%" />
							<stop stopColor="#DC1FFF" offset="100%" />
						</linearGradient>
					</defs>
					<g fill="none">
						<circle fill="#181E33" cx={18} cy={18} r={18} />
						<path
							d="M3.9 14.355a.785.785 0 0 1 .554-.23h19.153c.35 0 .525.423.277.67l-3.783 3.784a.785.785 0 0 1-.555.23H.393a.392.392 0 0 1-.277-.67l3.783-3.784z"
							fill={`url(#sol-a-${uid})`}
							transform="translate(6 9)"
						/>
						<path
							d="M3.9.23c.15-.146.35-.23.554-.23h19.153c.35 0 .525.422.277.67l-3.783 3.783a.785.785 0 0 1-.555.23H.393a.392.392 0 0 1-.277-.67L3.899.229z"
							fill={`url(#sol-b-${uid})`}
							transform="translate(6 9)"
						/>
						<path
							d="M20.1 7.247a.785.785 0 0 0-.554-.23H.393a.392.392 0 0 0-.277.67l3.783 3.784c.145.145.344.23.555.23h19.153c.35 0 .525-.423.277-.67l-3.783-3.784z"
							fill={`url(#sol-c-${uid})`}
							transform="translate(6 9)"
						/>
					</g>
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
