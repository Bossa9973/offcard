import { ChevronLeft16 } from "@frosted-ui/icons";
import { useLayoutEffect, useRef, type ComponentProps } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export function buttonClassName(variant: ButtonVariant = "secondary", className = "") {
	return `nb-button nb-button--${variant} ${className}`.trim();
}

/** Also use buttonClassName on links and Frosted dialog triggers to retain their semantics. */
export function Button({ variant = "secondary", className, type = "button", ...props }:
	ComponentProps<"button"> & { variant?: ButtonVariant }) {
	return <button type={type} className={buttonClassName(variant, className)} {...props} />;
}

/** The one way back from a sub-page: top-left, above the page title, "Back to <parent>". */
export function BackButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
	return (
		<button type="button" className="nb-back" onClick={onClick} disabled={disabled}>
			<ChevronLeft16 aria-hidden />
			{label}
		</button>
	);
}

/** Auto-growing fields keep addresses/line items readable without internal scrollbars. */
export function AutoTextarea(props: ComponentProps<"textarea">) {
	const ref = useRef<HTMLTextAreaElement>(null);
	useLayoutEffect(() => {
		const field = ref.current;
		if (!field) return;
		const resize = () => {
			field.style.height = "auto";
			field.style.height = `${field.scrollHeight + 2}px`;
		};
		resize();
		let width = field.clientWidth;
		const observer = new ResizeObserver(() => {
			if (field.clientWidth !== width) { width = field.clientWidth; resize(); }
		});
		observer.observe(field);
		return () => observer.disconnect();
	}, [props.value]);
	return <textarea {...props} ref={ref} />;
}
