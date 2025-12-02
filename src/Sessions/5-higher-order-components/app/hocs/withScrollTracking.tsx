/* eslint-disable react-refresh/only-export-components */
import { useEffect, useRef, type ComponentType } from 'react';
import { analytics } from '../services/analytics';

interface ScrollTrackingConfig {
	screenName: string;
	// Percentages to track (e.g., [25, 50, 75, 100])
	depthMarkers?: number[];
	// Track time spent at each depth
	trackTimeAtDepth?: boolean;
	// Debounce scroll events (ms)
	debounceMs?: number;
}

export function withScrollTracking<P extends object>(
	WrappedComponent: ComponentType<P>,
	config: ScrollTrackingConfig
) {
	const {
		screenName,
		depthMarkers = [25, 50, 75, 100],
		trackTimeAtDepth = true,
		debounceMs = 100,
	} = config;

	function ScrollTrackedComponent(props: P) {
		const containerRef = useRef<HTMLDivElement>(null);
		const trackedDepths = useRef<Set<number>>(new Set());
		const depthStartTime = useRef<Map<number, number>>(new Map());
		const maxDepth = useRef<number>(0);

		useEffect(() => {
			const container = containerRef.current;
			if (!container) return;

			// @ts-expect-error ignore
			let timeoutId: NodeJS.Timeout;

			const calculateScrollDepth = (): number => {
				const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
				const scrollableHeight = scrollHeight - clientHeight;

				if (scrollableHeight <= 0) return 100;

				return Math.round((scrollTop / scrollableHeight) * 100);
			};

			const handleScroll = () => {
				clearTimeout(timeoutId);

				timeoutId = setTimeout(() => {
					const currentDepth = calculateScrollDepth();

					// Update max depth
					if (currentDepth > maxDepth.current) {
						maxDepth.current = currentDepth;
					}

					// Check depth markers
					depthMarkers.forEach(marker => {
						if (currentDepth >= marker && !trackedDepths.current.has(marker)) {
							trackedDepths.current.add(marker);

							analytics.trackEvent({
								name: 'scroll_depth_reached',
								properties: {
									screenName,
									depth: marker,
									timeToReach: performance.now(),
								},
							});

							if (trackTimeAtDepth) {
								depthStartTime.current.set(marker, performance.now());
							}
						}
					});
				}, debounceMs);
			};

			window.addEventListener('scroll', handleScroll, { passive: true });

			// Track initial position
			handleScroll();

			return () => {
				window.removeEventListener('scroll', handleScroll);
				clearTimeout(timeoutId);

				// Track final statistics
				analytics.trackEvent({
					name: 'scroll_session_complete',
					properties: {
						screenName,
						maxDepthReached: maxDepth.current,
						depthsReached: Array.from(trackedDepths.current),
					},
				});

				// Track time at each depth
				if (trackTimeAtDepth) {
					depthStartTime.current.forEach((startTime, depth) => {
						analytics.trackTiming({
							category: 'Scroll Engagement',
							variable: `time_at_${depth}_percent`,
							duration: Math.round(performance.now() - startTime),
							label: screenName,
						});
					});
				}
			};
		}, []);

		return (
			<div ref={containerRef}>
				<WrappedComponent {...props} />
			</div>
		);
	}

	ScrollTrackedComponent.displayName = `withScrollTracking(${WrappedComponent.displayName || WrappedComponent.name || 'Component'
		})`;

	return ScrollTrackedComponent;
}

// ===== USAGE =====
// @ts-expect-error ignore
export const TrackedJobDescriptionPage = withScrollTracking(JobDescriptionPage, {
	screenName: 'Job Description',
	depthMarkers: [25, 50, 75, 90, 100],
	trackTimeAtDepth: true,
});