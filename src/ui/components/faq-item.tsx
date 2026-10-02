import { useState, useId } from "react";

export interface FaqItemProps {
	question: string;
	answer: string;
	defaultOpen?: boolean;
	className?: string;
}

/**
 * FaqItem: Accessible accordion with smooth grid-template-rows height transition (Pass 5, Section 4.8)
 */
export function FaqItem({
	question,
	answer,
	defaultOpen = false,
	className = "",
}: FaqItemProps) {
	const [isOpen, setIsOpen] = useState(defaultOpen);
	const rawId = useId();
	const contentId = `faq-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

	return (
		<div className={`off-faq-row ${isOpen ? "off-faq-row--open" : ""} ${className}`} data-keep-clear="faq-row">
			<button
				type="button"
				className="off-faq-trigger"
				onClick={() => setIsOpen((prev) => !prev)}
				aria-expanded={isOpen}
				aria-controls={contentId}
			>
				<span className="off-faq-question">{question}</span>
				<span className="off-faq-chevron-wrap" aria-hidden="true">
					<svg
						className="off-faq-chevron"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<polyline points="6 9 12 15 18 9" />
					</svg>
				</span>
			</button>
			<div
				id={contentId}
				role="region"
				aria-labelledby={contentId}
				className="off-faq-panel"
			>
				<div className="off-faq-panel__inner">
					<p className="off-faq-answer">{answer}</p>
				</div>
			</div>
		</div>
	);
}
