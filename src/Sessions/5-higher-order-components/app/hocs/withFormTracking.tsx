/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useCallback, type ComponentType } from 'react';
import { analytics } from '../services/analytics';

interface FormTrackingConfig {
	formName: string;
	// Track individual field interactions
	trackFieldInteractions?: boolean;
	// Track form abandonment
	trackAbandonment?: boolean;
	// Track time to complete
	trackCompletionTime?: boolean;
	// Fields to track specifically
	trackedFields?: string[];
}

interface FormTrackingProps {
	onSubmit?: (data: any) => void;
	onFieldChange?: (fieldName: string, value: any) => void;
	onFieldFocus?: (fieldName: string) => void;
	onFieldBlur?: (fieldName: string) => void;
}

export function withFormTracking<P extends FormTrackingProps>(
	WrappedComponent: ComponentType<P>,
	config: FormTrackingConfig
) {
	const {
		formName,
		trackFieldInteractions = true,
		trackAbandonment = true,
		trackCompletionTime = true,
		trackedFields = [],
	} = config;

	function FormTrackedComponent(props: P) {
		const formStartTime = useRef<number>(performance.now());
		const interactedFields = useRef<Set<string>>(new Set());
		const fieldFocusTimes = useRef<Map<string, number>>(new Map());
		const hasSubmitted = useRef(false);

		// Track form start
		useEffect(() => {
			analytics.trackEvent({
				name: 'form_started',
				properties: { formName },
			});

			return () => {
				// Track abandonment on unmount if not submitted
				if (trackAbandonment && !hasSubmitted.current) {
					const timeSpent = performance.now() - formStartTime.current;

					analytics.trackEvent({
						name: 'form_abandoned',
						properties: {
							formName,
							timeSpent: Math.round(timeSpent),
							fieldsInteracted: Array.from(interactedFields.current),
							completionPercentage: calculateCompletionPercentage(),
						},
					});
				}
			};
		}, []);

		const calculateCompletionPercentage = (): number => {
			if (trackedFields.length === 0) return 0;
			return Math.round(
				(interactedFields.current.size / trackedFields.length) * 100
			);
		};

		const wrappedOnSubmit = useCallback((data: any) => {
			hasSubmitted.current = true;
			const completionTime = performance.now() - formStartTime.current;

			analytics.trackEvent({
				name: 'form_submitted',
				properties: {
					formName,
					completionTimeMs: Math.round(completionTime),
					fieldsCompleted: interactedFields.current.size,
				},
			});

			if (trackCompletionTime) {
				analytics.trackTiming({
					category: 'Form Completion',
					variable: 'time_to_submit',
					duration: Math.round(completionTime),
					label: formName,
				});
			}

			props.onSubmit?.(data);
		}, [props.onSubmit]);

		const wrappedOnFieldFocus = useCallback((fieldName: string) => {
			if (trackFieldInteractions) {
				fieldFocusTimes.current.set(fieldName, performance.now());

				analytics.trackEvent({
					name: 'form_field_focused',
					properties: {
						formName,
						fieldName,
						isFirstInteraction: !interactedFields.current.has(fieldName),
					},
				});
			}

			props.onFieldFocus?.(fieldName);
		}, [props.onFieldFocus]);

		const wrappedOnFieldBlur = useCallback((fieldName: string) => {
			interactedFields.current.add(fieldName);

			if (trackFieldInteractions) {
				const focusTime = fieldFocusTimes.current.get(fieldName);
				const timeSpent = focusTime
					? Math.round(performance.now() - focusTime)
					: 0;

				analytics.trackEvent({
					name: 'form_field_blurred',
					properties: {
						formName,
						fieldName,
						timeSpentMs: timeSpent,
					},
				});
			}

			props.onFieldBlur?.(fieldName);
		}, [props.onFieldBlur]);

		const wrappedOnFieldChange = useCallback((fieldName: string, value: any) => {
			interactedFields.current.add(fieldName);

			if (trackFieldInteractions && trackedFields.includes(fieldName)) {
				analytics.trackEvent({
					name: 'form_field_changed',
					properties: {
						formName,
						fieldName,
						// Don't track actual values for privacy - just that it changed
						hasValue: Boolean(value),
						valueLength: typeof value === 'string' ? value.length : undefined,
					},
				});
			}

			props.onFieldChange?.(fieldName, value);
		}, [props.onFieldChange]);

		return (
			<WrappedComponent
				{...props}
				onSubmit={wrappedOnSubmit}
				onFieldFocus={wrappedOnFieldFocus}
				onFieldBlur={wrappedOnFieldBlur}
				onFieldChange={wrappedOnFieldChange}
			/>
		);
	}

	FormTrackedComponent.displayName = `withFormTracking(${WrappedComponent.displayName || WrappedComponent.name || 'Component'
		})`;

	return FormTrackedComponent;
}

// ===== USAGE FOR SHIFTY =====
// @ts-expect-error ignore
export const TrackedJobApplicationForm = withFormTracking(JobApplicationForm, {
	formName: 'Job Application',
	trackFieldInteractions: true,
	trackAbandonment: true,
	trackCompletionTime: true,
	trackedFields: [
		'fullName',
		'email',
		'phone',
		'resume',
		'coverLetter',
		'availability',
		'expectedSalary',
	],
});