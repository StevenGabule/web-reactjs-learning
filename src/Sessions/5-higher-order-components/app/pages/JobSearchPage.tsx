/* eslint-disable react-refresh/only-export-components */
import { withFullAnalytics } from '../hocs/withFullAnalytics';

interface JobSearchPageProps {
	filters: JobFilters;
	jobs: Job[];
	totalCount: number;
	onSearch: (query: string) => void;
	onFilterChange: (filters: JobFilters) => void;
	onJobClick: (job: Job) => void;
	onApplyQuick: (jobId: string) => void;
	onLoadMore: () => void;
}

function JobSearchPage(props: JobSearchPageProps) {
	const { filters, jobs, totalCount, onSearch, onFilterChange, onJobClick, onApplyQuick, onLoadMore } = props;

	return (
		<div className="job-search-page">
			<SearchBar onSearch={onSearch} />
			<FilterPanel filters={filters} onChange={onFilterChange} />
			<div className="results-info">
				Showing {jobs.length} of {totalCount} jobs
			</div>
			<JobList
				jobs={jobs}
				onJobClick={onJobClick}
				onApplyQuick={onApplyQuick}
			/>
			{jobs.length < totalCount && (
				<button onClick={onLoadMore}>Load More</button>
			)}
		</div>
	);
}

export default withFullAnalytics(JobSearchPage, {
	page: {
		screenName: 'Job Search',
		getProperties: (props: JobSearchPageProps) => ({
			totalResults: props.totalCount,
			resultsShown: props.jobs.length,
			hasFilters: Object.keys(props.filters).length > 0,
			category: props.filters.category,
			location: props.filters.location,
		}),
		trackOnPropsChange: true,
		trackingDependencies: ['totalCount', 'filters'],
	},
	events: {
		onSearch: {
			eventName: 'job_search_performed',
			getEventProperties: (query: string) => ({
				searchQuery: query,
				queryLength: query.length,
			}),
		},
		onFilterChange: {
			eventName: 'job_filters_changed',
			getEventProperties: (filters: JobFilters) => ({
				activeFilters: Object.keys(filters).filter(k => filters[k as keyof JobFilters]),
				category: filters.category,
				location: filters.location,
				salaryMin: filters.salaryMin,
				jobType: filters.jobType,
			}),
		},
		onJobClick: {
			eventName: 'job_card_clicked',
			getEventProperties: (job: Job) => ({
				jobId: job.id,
				jobTitle: job.title,
				company: job.company,
				position: job.listPosition, // Position in search results
			}),
		},
		onApplyQuick: {
			eventName: 'quick_apply_clicked',
			getEventProperties: (jobId: string) => ({ jobId }),
		},
		onLoadMore: {
			eventName: 'load_more_jobs_clicked',
			getPropsProperties: (props: JobSearchPageProps) => ({
				currentlyShown: props.jobs.length,
				totalAvailable: props.totalCount,
			}),
		},
	},
	scroll: {
		screenName: 'Job Search',
		depthMarkers: [25, 50, 75, 100],
	},
	performance: {
		componentName: 'JobSearchPage',
		thresholdMs: 200,
	},
});