/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMemo, type ComponentType } from 'react';
import { analytics } from '../services/analytics';

type EventHandler = (...args: any[]) => void;

interface EventConfig {
	eventName: string;

	// Extract event properties from handler arguments
	getEventProperties?: (...args: any[]) => Record<string, unknown>;

	// Extract properties from component props
	getPropsProperties?: (props: any) => Record<string, unknown>;

	// Condition to track (return false to skip tracking)
	shouldTrack?: (...args: any[]) => boolean;
}

type EventMappings<P> = {
	[K in keyof P]?: P[K] extends EventHandler ? EventConfig : never;
}

export function withEventTracking<P extends object>(
	WrappedComponent: ComponentType<P>,
	eventMappings: EventMappings<P>
) {
	function EventTrackedComponent(props: P) {
		// Create wrapped handlers
		const wrappedProps = useMemo(() => {
			const newProps = { ...props };

			Object.entries(eventMappings).forEach(([propName, config]) => {
				const originalHandler = props[propName as keyof P] as EventHandler | undefined;
				const eventConfig = config as EventConfig;

				if (typeof originalHandler === 'function') {
					(newProps as any)[propName] = (...args: any[]) => {
						// Check if we should track
						const shouldTrack = eventConfig.shouldTrack?.(...args) ?? true;

						if (shouldTrack) {
							const eventProperties = {
								...eventConfig.getPropsProperties?.(props),
								...eventConfig.getEventProperties?.(...args),
							};

							analytics.trackEvent({
								name: eventConfig.eventName,
								properties: eventProperties
							});
						}

						// Call original handler
						return originalHandler(...args);
					}
				}
			});

			return newProps;
		}, [props])

		return <WrappedComponent {...wrappedProps} />
	}

	EventTrackedComponent.displayName = `withEventTracking(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`

	return EventTrackedComponent;
}

// ===== USAGE =====
interface Job {
	id: string;
	title: string;
	description: string;
	company: string;
	salary: string;
	category: string;
}

interface JobCardProps {
	job: Job;
	onApply: (jobId: string) => void;
	onSave: (jobId: string) => void;
	onShare: (jobId: string, platform: string) => void;
	onViewDetails: (jobId: string) => void;
}

function JobCard({ job, onApply, onSave, onShare, onViewDetails }: JobCardProps) {
	return (
		<div className="job-card">
			<h3>{job.title}</h3>
			<p>{job.company}</p>
			<p>{job.salary}</p>
			<div className="actions">
				<button onClick={() => onViewDetails(job.id)}>View</button>
				<button onClick={() => onApply(job.id)}>Apply</button>
				<button onClick={() => onSave(job.id)}>Save</button>
				<button onClick={() => onShare(job.id, 'linkedin')}>Share</button>
			</div>
		</div>
	);
}

export const TrackedJobCard = withEventTracking(JobCard, {
	onApply: {
		eventName: 'job_apply_clicked',
		getPropsProperties: (props: JobCardProps) => ({
			jobId: props.job.id,
			jobTitle: props.job.title,
			company: props.job.company,
			salary: props.job.salary,
			category: props.job.category,
		}),
	},
	onSave: {
		eventName: 'job_saved',
		getPropsProperties: (props: JobCardProps) => ({
			jobId: props.job.id,
			jobTitle: props.job.title,
		}),
	},
	onShare: {
		eventName: 'job_shared',
		getPropsProperties: (props: JobCardProps) => ({
			jobId: props.job.id,
		}),
		getEventProperties: (jobId: string, platform: string) => ({
			platform,
		}),
	},
	onViewDetails: {
		eventName: 'job_details_viewed',
		getPropsProperties: (props: JobCardProps) => ({
			jobId: props.job.id,
			jobTitle: props.job.title,
			company: props.job.company,
		}),
	},
});