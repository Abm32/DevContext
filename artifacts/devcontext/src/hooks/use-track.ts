function getSessionId(): string {
  let id = localStorage.getItem("dc_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("dc_session_id", id);
  }
  return id;
}

interface TrackOptions {
  page?: string;
  element?: string;
  metadata?: unknown;
}

async function track(eventType: string, options?: TrackOptions): Promise<void> {
  try {
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_type: eventType,
        session_id: getSessionId(),
        page: options?.page ?? window.location.pathname,
        element: options?.element,
        metadata: options?.metadata,
      }),
    });
  } catch {
  }
}

export function useTrack() {
  return { track };
}

export { track };
