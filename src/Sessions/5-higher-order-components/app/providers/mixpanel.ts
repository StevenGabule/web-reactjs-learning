import mixpanel from "mixpanel-browser";
import type {
  AnalyticsEvent,
  AnalyticsProvider,
  PageViewEvent,
  TimingEvent,
  UserIdentity,
} from "../types/analytics";

export class MixpanelProvider implements AnalyticsProvider {
  constructor(token: string) {
    mixpanel.init(token, {
      debug: import.meta.env.NODE_ENV === "development",
      track_pageview: false, // We'll handle this manually
      persistence: "localStorage",
    });
  }

  trackEvent({ name, properties }: AnalyticsEvent) {
    mixpanel.track(name, properties);
  }

  trackPageView({ screenName, properties }: PageViewEvent) {
    mixpanel.track("Page View", {
      screen_name: screenName,
      ...properties,
    });
  }

  trackTiming({ category, variable, duration, label }: TimingEvent) {
    mixpanel.track("Timing", {
      category,
      variable,
      duration,
      label,
    });
  }

  identify({ userId, email, name, traits }: UserIdentity) {
    mixpanel.identify(userId);
    mixpanel.people.set({
      $email: email,
      $name: name,
      ...traits,
    });
  }

  reset() {
    mixpanel.reset();
  }
}
