import { createContext, useContext, ReactNode, useMemo } from 'react';
import { analytics } from '../services/analytics';

interface AnalyticsContextValue {
	// Global properties added to all events
	globalProperties: Record<string, unknown>;
	setGlobalProperty: (key: string, value: unknown) => void;
	// User session info
	sessionId: string;
	// Utility methods
	trackEvent: typeof analytics.trackEvent;
	trackPageView: typeof analytics.trackPageView;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
	const [globalProperties, setGlobalProperties] = useState<Record<string, unknown>>({});

	const sessionId = useMemo(() => {
		// Generate or retrieve session ID
		const existing = sessionStorage.getItem('analytics_session_id');
		if (existing) return existing;

		const newId = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
		sessionStorage.setItem('analytics_session_id', newId);
		return newId;
	}, []);

	const setGlobalProperty = useCallback((key: string, value: unknown) => {
		setGlobalProperties(prev => ({ ...prev, [key]: value }));
	}, []);

	// Wrap analytics methods to include global properties
	const trackEvent = useCallback((event: AnalyticsEvent) => {
		analytics.trackEvent({
			...event,
			properties: {
				...globalProperties,
				sessionId,
				...event.properties,
			},
		});
	}, [globalProperties, sessionId]);

	const trackPageView = useCallback((event: PageViewEvent) => {
		analytics.trackPageView({
			...event,
			properties: {
				...globalProperties,
				sessionId,
				...event.properties,
			},
		});
	}, [globalProperties, sessionId]);

	const value = useMemo(() => ({
		globalProperties,
		setGlobalProperty,
		sessionId,
		trackEvent,
		trackPageView,
	}), [globalProperties, setGlobalProperty, sessionId, trackEvent, trackPageView]);

	return (
		<AnalyticsContext.Provider value={value}>
			{children}
		</AnalyticsContext.Provider>
	);
}

export function useAnalytics() {
	const context = useContext(AnalyticsContext);
	if (!context) {
		throw new Error('useAnalytics must be used within AnalyticsProvider');
	}
	return context;
}