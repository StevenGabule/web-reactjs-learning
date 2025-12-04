import { ComponentType } from 'react';
import { withPageTracking, PageTrackingConfig } from './withPageTracking';
import { withEventTracking, EventMappings } from './withEventTracking';
import { withScrollTracking, ScrollTrackingConfig } from './withScrollTracking';
import { withPerformanceTracking, PerformanceConfig } from './withPerformanceTracking';

interface FullAnalyticsConfig<P> {
	page?: PageTrackingConfig;
	events?: EventMappings<P>;
	scroll?: ScrollTrackingConfig;
	performance?: PerformanceConfig;
}

export function withFullAnalytics<P extends object>(
	WrappedComponent: ComponentType<P>,
	config: FullAnalyticsConfig<P>
) {
	let EnhancedComponent: ComponentType<P> = WrappedComponent;

	// Apply in order: performance -> scroll -> events -> page
	// (innermost to outermost)

	if (config.performance) {
		EnhancedComponent = withPerformanceTracking(
			EnhancedComponent,
			config.performance
		);
	}

	if (config.scroll) {
		EnhancedComponent = withScrollTracking(
			EnhancedComponent,
			config.scroll
		);
	}

	if (config.events) {
		EnhancedComponent = withEventTracking(
			EnhancedComponent,
			config.events
		);
	}

	if (config.page) {
		EnhancedComponent = withPageTracking(
			EnhancedComponent,
			config.page
		);
	}

	return EnhancedComponent;
}

// ===== USAGE FOR SHIFTY =====

interface JobDetailsPageProps {
	job: Job;
	onApply: (jobId: string) => void;
	onSave: (jobId: string) => void;
	onContact: (employerId: string) => void;
}

function JobDetailsPage({ job, onApply, onSave, onContact }: JobDetailsPageProps) {
	return (
		<div className="job-details">
			<h1>{job.title}</h1>
			<div className="company">{job.company}</div>
			<div className="description">{job.description}</div>
			<div className="actions">
				<button onClick={() => onApply(job.id)}>Apply Now</button>
				<button onClick={() => onSave(job.id)}>Save Job</button>
				<button onClick={() => onContact(job.employerId)}>Contact</button>
			</div>
		</div>
	);
}

export const FullyTrackedJobDetailsPage = withFullAnalytics(JobDetailsPage, {
	page: {
		screenName: 'Job Details',
		getProperties: (props: JobDetailsPageProps) => ({
			jobId: props.job.id,
			jobTitle: props.job.title,
			company: props.job.company,
			category: props.job.category,
			salaryRange: props.job.salaryRange,
		}),
	},
	events: {
		onApply: {
			eventName: 'job_application_started',
			getPropsProperties: (props: JobDetailsPageProps) => ({
				jobId: props.job.id,
				jobTitle: props.job.title,
				company: props.job.company,
			}),
		},
		onSave: {
			eventName: 'job_saved',
			getPropsProperties: (props: JobDetailsPageProps) => ({
				jobId: props.job.id,
			}),
		},
		onContact: {
			eventName: 'employer_contacted',
			getPropsProperties: (props: JobDetailsPageProps) => ({
				jobId: props.job.id,
				employerId: props.job.employerId,
			}),
		},
	},
	scroll: {
		screenName: 'Job Details',
		depthMarkers: [25, 50, 75, 100],
	},
	performance: {
		componentName: 'JobDetailsPage',
		thresholdMs: 100,
	},
});