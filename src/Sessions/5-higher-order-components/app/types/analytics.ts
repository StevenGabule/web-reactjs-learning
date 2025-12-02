export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: Date;
}

export interface PageViewEvent {
  screenName: string;
  properties?: Record<string, unknown>;
}

export interface UserIdentity {
  userId: string;
  email?: string;
  name?: string;
  traits?: Record<string, unknown>;
}

export interface TimingEvent {
  category: string;
  variable: string;
  duration: number; // milliseconds
  label?: string;
}

export interface AnalyticsProvider {
  trackEvent: (event: AnalyticsEvent) => void;
  trackPageView: (event: PageViewEvent) => void;
  trackTiming: (event: TimingEvent) => void;
  identify: (user: UserIdentity) => void;
  reset: () => void;
}
