import type { ReactNode } from "react";

const ARROW_PATH = "M4.5 11.5 11 5m0 0H5.5m5.5 0v5.5";

function Arrow() {
	return (
		<svg aria-hidden fill="none" height="16" viewBox="0 0 16 16" width="16">
			<path
				d={ARROW_PATH}
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.6"
			/>
		</svg>
	);
}

export function SignIn({
	error,
	href = "/api/auth/login",
	label = "Sign in with Whop",
	meta,
	onAction,
	subtitle,
	title = (
		<>
			Your money,
			<br />
			in one place.
		</>
	),
}: {
	error?: string;
	href?: string;
	label?: string;
	meta?: string;
	onAction?: () => void;
	subtitle?: string;
	title?: ReactNode;
}) {
	return (
		<div className="nb-auth">
			<div aria-hidden className="nb-auth__aurora" />
			<div aria-hidden className="nb-auth__grid" />

			<div className="nb-auth__inner">
				<div aria-hidden className="nb-auth__card">
					<img alt="" className="nb-auth__whop-logo" src="/images/whop-logo-etch.svg" width="56" height="30" />
					<img alt="" className="nb-auth__visa-logo" src="/images/visa-etch.svg" width="84" height="42" />
					<span className="nb-auth__card-name">Neobank card</span>
					<span className="nb-auth__card-number">•••• 7474</span>
				</div>

				<h1 className="nb-auth__title">{title}</h1>
				{subtitle ? <p className="nb-auth__sub">{subtitle}</p> : null}

				{onAction ? (
					<button className="nb-button nb-button--primary nb-auth__cta" onClick={onAction} type="button">
						{label}
						<Arrow />
					</button>
				) : (
					<a className="nb-button nb-button--primary nb-auth__cta" href={href}>
						{label}
						<Arrow />
					</a>
				)}

				<a
					className="nb-auth__blueprint-link"
					href="https://whop.com/blueprints/app_EtrVTHbuydoOk6/?a=timofeyobraz"
				>
					Create your own neobank
				</a>

				{error ? <p className="nb-auth__error">{error}</p> : null}
				{meta ? <p className="nb-auth__meta">{meta}</p> : null}
			</div>
		</div>
	);
}
