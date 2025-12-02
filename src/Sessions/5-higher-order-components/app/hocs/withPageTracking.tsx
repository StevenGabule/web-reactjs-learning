/* eslint-disable react-refresh/only-export-components */
import { useEffect, useRef, type ComponentType } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '../services/analytics';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface PageTrackingConfig {
	screenName: string;

	// Function to extract dynamic properties from props
	getProperties?: (props: any) => Record<string, unknown>;

	// Track on every render or just on mount?
	trackingOnPropsChange?: boolean;

	// Dependencies to watch for re-tracking
	trackingDependencies?: string[]
}

export function withPageTracking<P extends object>(
	WrappedComponent: ComponentType<P>,
	config: PageTrackingConfig
) {
	const {
		screenName,
		getProperties,
		trackingOnPropsChange = false,
		trackingDependencies = []
	} = config;

	function PageTrackedComponent(props: P) {
		const location = useLocation();
		const hasTrackedMount = useRef(false);
		const prevDeps = useRef<unknown[]>([]);

		// Extract current dependency values
		const currentDeps = trackingDependencies.map(
			dep => props[dep as keyof P]
		);

		useEffect(() => {
			const properties = {
				...getProperties?.(props),
				path: location.pathname,
				search: location.search,
				referrer: document.referrer
			}

			// Track on mount
			if (!hasTrackedMount.current) {
				analytics.trackPageView({
					screenName, properties
				})
				hasTrackedMount.current = true;
				prevDeps.current = currentDeps;
				return;
			}

			// Track on props change if enabled
			if (trackingOnPropsChange) {
				const depsChanged = currentDeps.some(
					(dep, i) => dep !== prevDeps.current[i]
				);

				if (depsChanged) {
					analytics.trackPageView({
						screenName,
						properties: {
							...properties,
							isRevisit: true
						},
					});
					prevDeps.current = currentDeps;
				}
			}
		}, [currentDeps, location.pathname, location.search, props]);

		return <WrappedComponent {...props} />
	}

	PageTrackedComponent.displayName = `withPageTracking(${WrappedComponent.displayName || WrappedComponent.name || 'Component'
		})`;

	return PageTrackedComponent;
}


// ===== USAGE =====
interface Job {
	id: number;
	title: string;
	description: string;
}

interface JobListingPageProps {
	category?: string;
	location?: string;
	jobs?: Job[];
}

function JobListingPage({ category, location, jobs }: JobListingPageProps) {
	return (
		<div>
			<h1>Jobs in {category}</h1>
			<p>{location}</p>
			{jobs?.map(job => (
				<li>{job.title}</li>
			))}
		</div>
	)
}

export const TrackedJobListingPage = withPageTracking(JobListingPage, {
	screenName: 'Job Listings',
	getProperties: (props) => ({
		category: props.category,
		location: props.location,
		jobCount: props.jobs.length
	}),
	trackingOnPropsChange: true,
	trackingDependencies: ['category', 'location']
});
