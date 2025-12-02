/* eslint-disable @typescript-eslint/no-unused-vars */
// hocs/withPerformanceTracking.tsx
import { useEffect, useRef, Profiler, type ComponentType } from 'react';
import { analytics } from '../services/analytics';

interface PerformanceConfig {
	componentName: string;
	// Only track if render time exceeds threshold (ms)
	thresholdMs?: number;
	// Track every N renders (1 = every render)
	sampleRate?: number;
	// Include in performance tracking
	trackMount?: boolean;
	trackUpdate?: boolean;
}

export function withPerformanceTracking<P extends object>(
	WrappedComponent: ComponentType<P>,
	config: PerformanceConfig
) {
	const {
		componentName,
		thresholdMs = 16, // 1 frame at 60fps
		sampleRate = 1,
		trackMount = true,
		trackUpdate = true,
	} = config;

	function PerformanceTrackedComponent(props: P) {
		const renderCount = useRef(0);
		const mountTime = useRef<number>(0);

		useEffect(() => {
			mountTime.current = performance.now();

			return () => {
				const totalLifetime = performance.now() - mountTime.current;
				analytics.trackTiming({
					category: 'Component Lifecycle',
					variable: 'total_lifetime',
					duration: Math.round(totalLifetime),
					label: componentName,
				});
			};
		}, []);

		const handleRender = (
			_id: string,
			phase: 'mount' | 'update',
			actualDuration: number,
			baseDuration: number,
			_startTime: number,
			_commitTime: number
		) => {
			renderCount.current += 1;

			// Sample rate check
			if (renderCount.current % sampleRate !== 0) return;

			// Phase check
			if (phase === 'mount' && !trackMount) return;
			if (phase === 'update' && !trackUpdate) return;

			// Threshold check
			if (actualDuration < thresholdMs) return;

			analytics.trackTiming({
				category: 'Component Render',
				variable: phase,
				duration: Math.round(actualDuration),
				label: componentName,
			});

			analytics.trackEvent({
				name: 'slow_render_detected',
				properties: {
					component: componentName,
					phase,
					actualDuration: Math.round(actualDuration),
					baseDuration: Math.round(baseDuration),
					renderCount: renderCount.current,
				},
			});
		};

		return (
			// @ts-expect-error ignore
			<Profiler id={componentName} onRender={handleRender}>
				<WrappedComponent {...props} />
			</Profiler>
		);
	}

	PerformanceTrackedComponent.displayName = `withPerformanceTracking(${WrappedComponent.displayName || WrappedComponent.name || 'Component'
		})`;

	return PerformanceTrackedComponent;
}

// ===== USAGE =====

// Track performance of heavy components
// @ts-expect-error ignore
const TrackedJobFeed = withPerformanceTracking(JobFeed, {
	componentName: 'JobFeed',
	thresholdMs: 50, // Only track if render takes > 50ms
	sampleRate: 5, // Track every 5th render
});