// Every mount/filter/account owns its request. Late results cannot repopulate it.
export function startEmailReportRequest(fetchReport, days, onReport, onError) {
  const controller = new AbortController();
  Promise.resolve().then(() => fetchReport(`/api/admin/email/reporting?days=${days}`, { signal: controller.signal }))
    .then(async response => {
      if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? 'Administrator sign-in required.' : 'Email reporting is unavailable. Try again.');
      return response.json();
    }).then(data => { if (!controller.signal.aborted) onReport(data); })
    .catch(err => { if (!controller.signal.aborted) onError(err.message); });
  return () => controller.abort();
}
