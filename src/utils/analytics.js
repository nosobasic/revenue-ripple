/**
 * Lightweight analytics emitter with console fallback.
 * Replace with production provider when available.
 */

/**
 * @typedef {{ [key: string]: unknown }} AnalyticsPayload
 */

/**
 * Emit an analytics event. In production, wire to your provider.
 * @param {string} eventName
 * @param {AnalyticsPayload} [payload]
 */
export function emit(eventName, payload = {}) {
  try {
    // Stub: replace with real analytics (e.g., PostHog/Segment)
    // eslint-disable-next-line no-console
    console.log('[analytics]', eventName, payload);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Analytics emit failed', err);
  }
}


