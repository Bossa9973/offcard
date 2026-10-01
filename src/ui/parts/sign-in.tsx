import type { ReactNode } from "react";
import { ShaderBackground } from "./shader-background";
import { Wordmark } from "./app-header";

const BLUEPRINT_URL = "https://whop.com/blueprints/app_EtrVTHbuydoOk6/?a=timofeyobraz";

export function SignIn({
	error,
	href = "/api/auth/login",
	label = "Sign in with Whop",
	meta,
	onAction,
	subtitle = "Your new home for finance",
	title = "Spend, send, and get paid.",
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
			<ShaderBackground className="nb-auth__shader" />

			<header className="nb-auth__bar">
				<span className="nb-auth__brand"><Wordmark /></span>
				<a className="nb-auth__signin" href={href}>Sign in</a>
			</header>

			<div className="nb-auth__inner">
				<div aria-hidden className="nb-auth__card">
					<img alt="" className="nb-auth__whop-logo" src="/images/whop-logo-etch.svg" width="56" height="30" />
					<img alt="" className="nb-auth__visa-logo" src="/images/visa-etch.svg" width="84" height="42" />
					<span className="nb-auth__card-name">Neo Finance</span>
					<span className="nb-auth__card-number">•••• 7474</span>
				</div>

				<h1 className="nb-auth__title">{title}</h1>
				{subtitle ? <p className="nb-auth__sub">{subtitle}</p> : null}

				<div className="nb-auth__actions">
					{onAction ? (
						<button className="nb-button nb-button--primary nb-auth__cta" onClick={onAction} type="button">
							{label}
						</button>
					) : (
						<a className="nb-button nb-button--primary nb-auth__cta" href={href}>
							{label}
						</a>
					)}
					<a className="nb-button nb-auth__cta nb-auth__cta--dark" href={BLUEPRINT_URL}>
						Create one
					</a>
				</div>

				{error ? <p className="nb-auth__error">{error}</p> : null}
				{meta ? <p className="nb-auth__meta">{meta}</p> : null}
			</div>
		</div>
	);
}
