/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  AnalyticsEvent,
  AnalyticsProvider,
  PageViewEvent,
  TimingEvent,
  UserIdentity,
} from "../types/analytics";

type GTagCommand = "config" | "event" | "set" | string;
interface GTagEventParams {
  [key: string]: any;
}

export class GoogleAnalyticsProvider implements AnalyticsProvider {
  constructor(measurementId: string) {
    if (typeof window !== "undefined") {
      const script = document.createElement("script");
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      script.async = true;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag(
        command: GTagCommand,
        ...rest: (string | GTagEventParams)[]
      ) {
        window.dataLayer?.push([...command, rest]);
      };
    }
  }

  trackEvent({ name, properties }: AnalyticsEvent) {
    window.gtag("event", name, properties);
  }

  trackPageView({ screenName, properties }: PageViewEvent) {
    window.gtag?.("event", "page_view", {
      page_title: screenName,
      ...properties,
    });
  }

  trackTiming({ category, variable, duration, label }: TimingEvent) {
    window.gtag?.("event", "timing_complete", {
      event_category: category,
      name: variable,
      value: duration,
      event_label: label,
    });
  }

  identify({ userId, traits }: UserIdentity) {
    window.gtag?.("set", "user_properties", {
      user_id: userId,
      ...traits,
    });
  }

  reset() {
    window.gtag?.("set", "user_properties", { user_id: null });
  }
}
