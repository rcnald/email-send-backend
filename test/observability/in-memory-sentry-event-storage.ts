import type { ErrorEvent } from "@sentry/node";

export class InMemorySentryEventStorage {
  public readonly events: ErrorEvent[] = [];

  store(event: ErrorEvent) {
    this.events.push(event);
  }

  clear() {
    this.events.length = 0;
  }
}
