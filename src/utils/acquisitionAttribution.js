const KEY = "rr_acquisition_touches";
const WINDOW_MS = 90 * 24 * 60 * 60 * 1000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Keep acquisition clicks separate from UTM defaults and affiliate tracking.
export function captureAcquisitionTouch(
  search = window.location.search,
  storage = window.localStorage,
  now = Date.now(),
) {
  let current = {};
  try {
    current = JSON.parse(storage.getItem(KEY) || "{}") || {};
  } catch {
    /* Storage can be unavailable. */
  }
  const valid = (t) =>
    t &&
    UUID.test(t.id) &&
    Number.isFinite(t.at) &&
    t.at <= now &&
    now - t.at < WINDOW_MS;
  if (!valid(current.first)) delete current.first;
  if (!valid(current.last)) delete current.last;
  if (!current.first && current.last) current.first = current.last;
  const id = new URLSearchParams(search).get("rr_touch");
  if (UUID.test(id || "") && current.last?.id !== id) {
    const touch = { id, at: now };
    current.first ||= touch;
    current.last = touch;
  }
  try {
    storage.setItem(KEY, JSON.stringify(current));
  } catch {
    /* Attribution must not block a form. */
  }
  return current;
}
export function acquisitionForSubmission() {
  try {
    const touches = captureAcquisitionTouch();
    return {
      acquisition: {
        first_touch_id: touches.first?.id || null,
        last_touch_id: touches.last?.id || null,
      },
    };
  } catch {
    return {};
  }
}
