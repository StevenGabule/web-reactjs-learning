import React, { type ReactNode } from 'react';

type InViewportState = {
	isInView: boolean;
	hasBeenInView: boolean;
}

type InViewportProps = {
	children: (state: InViewportState) => ReactNode;
	threshold?: number;  // 0-1, how much of element must be visible
	rootMargin?: string;  // CSS-like margin around root (e.g., "100px")
}

export const InViewport = ({
	children,
	threshold = 0,
	rootMargin = '0px'
}: InViewportProps) => {
	const [isInView, setIsInView] = React.useState(false);
	const [hasBeenInView, setHasBeenInView] = React.useState(false)
	const elementRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		const element = elementRef.current;
		if (!element) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				setIsInView(entry.isIntersecting);

				if (entry.isIntersecting) {
					setHasBeenInView(true)
				}
			},
			{ threshold, rootMargin }
		);

		observer.observe(element)

		// Key concepts:
		// entries[0] - We only observe one element, so first entry is ours
		// isIntersecting - Boolean from the API indicating visibility
		// hasBeenInView only sets to true, never back to false (sticky state)
		// Cleanup prevents memory leaks

		// Cleanup: stop observing when component unmounts
		return () => observer.disconnect()

	}, [threshold, rootMargin]);

	return (
		<div ref={elementRef}>
			{children({ isInView, hasBeenInView })}
		</div>
	)
}

export const UseInViewport = (options?: ({ threshold?: number; rootMargin?: string })) => {
	const [isInView, setIsInView] = React.useState(false)
	const [hasBeenInView, setHasBeenInView] = React.useState(false)
	const elementRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		const element = elementRef.current;
		if (!element) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				setIsInView(entry.isIntersecting);

				if (entry.isIntersecting) {
					setHasBeenInView(true)
				}
			},
			{ ...options }
		);

		observer.observe(element)
		// Cleanup: stop observing when component unmounts
		return () => observer.disconnect();

	}, [options]);

	return {
		ref: elementRef,
		isInView,
		hasBeenInView
	}
}