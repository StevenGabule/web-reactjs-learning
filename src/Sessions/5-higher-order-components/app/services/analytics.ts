import type {
  AnalyticsEvent,
  AnalyticsProvider,
  PageViewEvent,
  TimingEvent,
  UserIdentity,
} from "../types/analytics";

class AnalyticsService implements AnalyticsProvider {
  private providers: AnalyticsProvider[] = [];
  private isEnabled: boolean = true;
  private queue: Array<() => void> = [];
  private isInitialized: boolean = false;

  // Register multiple analytics providers (Google Analytics, Mixpanel, etc)
  registerProvider(provider: AnalyticsProvider) {
    this.providers.push(provider);

    // Flush queue events
    if (!this.isInitialized && this.providers.length > 0) {
      this.isInitialized = true;
      this.queue.forEach((fn) => fn());
      this.queue = [];
    }
  }

  private executeOrQueue(fn: () => void) {
    if (this.isInitialized) {
      fn();
    } else {
      this.queue.push(fn);
    }
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  trackEvent(event: AnalyticsEvent) {
    if (!this.isEnabled) return;

    const enrichedEvent = {
      ...event,
      timestamp: event.timestamp || new Date(),
    };

    this.executeOrQueue(() => {
      this.providers.forEach((provider) => {
        try {
          provider.trackEvent(enrichedEvent);
        } catch (error) {
          console.error("Analytics trackEvent error: ", error);
        }
      });
    });

    // Debug logging in development
    if (import.meta.env.NODE_ENV === "development") {
      console.log(`📊 Event: ${enrichedEvent}`);
    }
  }

  trackPageView(event: PageViewEvent) {
    if (!this.isEnabled) return;

    this.executeOrQueue(() => {
      this.providers.forEach((provider) => {
        try {
          provider.trackPageView(event);
        } catch (error) {
          console.error(`Analytics trackPageView error: ${error}`);
        }
      });
    });

    if (import.meta.env.NODE_ENV === "development") {
      console.log(`📄 Page View: ${event}`);
    }
  }

  trackTiming(event: TimingEvent) {
    if (!this.isEnabled) return;

    this.executeOrQueue(() => {
      this.providers.forEach((provider) => {
        try {
          provider.trackTiming(event);
        } catch (error) {
          console.error(`Analytics trackTiming error: ${error}`);
        }
      });
    });

    if (import.meta.env.NODE_ENV === "development") {
      console.log("Timing:", event);
    }
  }

  identify(user: UserIdentity) {
    this.executeOrQueue(() => {
      this.providers.forEach((provider) => {
        try {
          provider.identify(user);
        } catch (error) {
          console.error(`Analytics identifier error: ${error}`);
        }
      });
    });
  }

  reset() {
    this.providers.forEach((provider) => {
      try {
        provider.reset();
      } catch (error) {
        console.error("Analytics reset error:", error);
      }
    });
  }
}

// Singleton instance
export const analytics = new AnalyticsService();
