import { useCallback, useEffect, useRef, useState } from 'react';

const messages = {
  beta_unavailable: 'This beta is not available for this account. Your learning access continues.',
  beta_complete: 'This account has reached the beta scan attempt limit. Your saved results and learning access remain available.',
  pilot_unavailable: 'This supervised pilot is not available for this account.',
  pilot_complete: 'This pilot attempt is complete. Your saved work remains available; another attempt requires review.',
  credits_used: 'Your scan allowance has been used. Your saved scan and learning access remain available.',
  run_in_progress: 'A scan is already in progress or awaiting review. Refresh its status below.',
  attempt_cap: 'You have reached the rolling 24-hour attempt limit. Your saved work is safe; try again after earlier attempts leave that window.',
  queue_full: 'The scan queue is busy. Please try again shortly. No new credit was reserved.',
  budget_unavailable: 'Scans are paused while capacity is reviewed. No new credit was reserved.',
  unavailable: 'Scans are not enabled yet. Your scan allowance is unchanged.',
  key_conflict: 'The request changed. Preview your questions again before starting.',
};
export default function VisibilityTool({ api }) {
  const [fields, setFields] = useState({ business_name: '', domain: '', topic: '' });
  const [preview, setPreview] = useState(null);
  const [access, setAccess] = useState(null);
  const [job, setJob] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const requestRef = useRef(null);
  const active = job && ['queued', 'running'].includes(job.status);
  const read = useCallback(async (path, options) => {
    const response = await api(path, options);
    const data = await response.json();
    if (!response.ok) throw new Error(messages[data.error] || data.error || 'The request could not be confirmed. Please retry.');
    return data;
  }, [api]);
  const refresh = useCallback(async () => {
    const [newAccess, latest] = await Promise.all([read('/api/visibility/access'), read('/api/visibility/jobs/latest')]);
    setAccess(newAccess); setJob(latest.job);
  }, [read]);
  useEffect(() => { refresh().catch(e => setError(e.message)); }, [refresh]);
  useEffect(() => {
    if (!active) return;
    let stopped = false;
    const timer = setInterval(async () => {
      try {
        const data = await read(`/api/visibility/jobs/${job.id}`);
        const terminal = !['queued', 'running'].includes(data.job.status);
        const next = terminal ? await read('/api/visibility/access') : null;
        if (!stopped) {
          if (next) setAccess(next);
          setJob(data.job); setError('');
        }
      } catch (e) { if (!stopped) setError(`${e.message} Your scan may still be running; do not start another.`); }
    }, 3000);
    return () => { stopped = true; clearInterval(timer); };
  }, [active, job?.id, read]);
  async function showPreview(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const data = await read('/api/visibility/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fields) });
      setPreview(data);
      if (requestRef.current?.hash !== data.preview_hash || ['failed', 'completed'].includes(job?.status)) {
        requestRef.current = { hash: data.preview_hash, key: crypto.randomUUID() };
      }
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  async function start() {
    if (busy || !preview) return;
    setBusy(true); setError('');
    try {
      const data = await read('/api/visibility/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': requestRef.current.key }, body: JSON.stringify({ ...preview.input, preview_hash: preview.preview_hash }) });
      const status = await read(`/api/visibility/jobs/${data.id}`);
      setPreview(null); setJob(status.job); setAccess(await read('/api/visibility/access'));
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  const result = job?.result;
  const reservedCredits = (access?.reserved || 0) + (access?.bonus?.reserved || 0);
  const allowanceNotice = !access ? null
    : reservedCredits > 0 ? 'Scan credit is reserved for a scan in progress or awaiting review. Check its status below.'
    : access.remaining === 0 ? 'No scan credits are available. Your saved results and learning access remain available.'
    : !access.enabled ? 'New scans are not available for this account right now. Your saved results and learning access remain available.'
    : null;
  return <main className="max-w-3xl mx-auto px-5 py-10 text-slate-900">
    <p className="text-blue-700 font-semibold">AI SEO Visibility Tool</p>
    <h1 className="text-3xl font-bold mt-2 mb-3">See what appears. Know what to do next.</h1>
    <p className="text-slate-600">Check three customer questions with one search-enabled API, review the evidence, and see up to three evidence-backed actions.</p>
    {(access?.is_fixture || job?.is_fixture) && <p role="status" className="my-5 border-2 border-amber-500 bg-amber-50 p-4 rounded-xl font-semibold">Offline demonstration — all answers and sources below are synthetic fixtures. No live searches, provider charges, or real account credits.</p>}
    <div className="my-5 bg-blue-50 p-4 rounded-xl">
      <p className="font-semibold">{access ? `${access.remaining} available · ${access.reserved + (access.bonus?.reserved || 0)} reserved · ${access.used + (access.bonus?.used || 0)} completed` : 'Checking your scan allowance…'}</p>
      <p>1 scan credit = 3 questions and up to 3 evidence-backed actions. Failed scans restore your credit. Saved results remain available.</p>
      {access?.period === 'month' ? <p className="mt-2">Membership: {access.limit} scans per UTC calendar month. Unused credits do not roll over. {access.resets_at && <>Next reset: {new Date(access.resets_at).toLocaleString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })} UTC.</>}</p> : <p className="mt-2">Free: one regular starter scan per account, with no monthly reset.</p>}
      {access?.bonus?.limit > 0 && <p className="mt-2">Welcome-back bonus: {access.bonus.remaining} available · {access.bonus.reserved} reserved · {access.bonus.used} completed, in addition to your regular allowance.</p>}
      {access?.remaining === 0 && <p className="mt-2">{access.period === 'month' ? 'Your next monthly allowance arrives at the reset above while membership remains active.' : 'Membership includes 10 scans per UTC calendar month for $47/month. Purchases are not enabled yet.'}</p>}
      {access?.attempts_per_24h && <p className="text-sm mt-2">Up to {access.attempts_per_24h} attempts per rolling 24 hours, including failed attempts. This safety limit applies to free and paid accounts.</p>}
      {allowanceNotice && <p className="mt-2" data-testid="allowance-notice">{allowanceNotice}</p>}
    </div>
    {error && <div role="alert" className="my-4 p-4 bg-amber-50 rounded-xl"><p>{error}</p><button className="underline mt-2" onClick={() => refresh().then(() => setError('')).catch(e => setError(e.message))}>Refresh scan status</button></div>}
    {!active && job?.status !== 'reconciliation' && <form onSubmit={showPreview} className="bg-white border rounded-xl p-5 space-y-4">
      {[['business_name','Business name','Example Studio',100],['domain','Website','business.example',253],['topic','What customers search for','Tutoring for high school students in Austin',240]].map(([key,label,placeholder,max]) => <label className="block font-medium" key={key}>{label}
        <input className="block w-full border rounded-lg p-3 mt-1" value={fields[key]} placeholder={placeholder} maxLength={max} required disabled={busy} onChange={e => { setFields({ ...fields, [key]: e.target.value }); setPreview(null); }} />
      </label>)}
      <button disabled={busy} className="bg-blue-700 text-white rounded-lg px-5 py-3 disabled:opacity-50">{busy ? 'Preparing…' : 'Preview my three questions'}</button>
      <p className="text-sm text-slate-600">Previewing does not use a credit. Your business name and domain identify matches; they are not secretly added to discovery questions.</p>
    </form>}
    {preview && !active && job?.status !== 'reconciliation' && <section className="border rounded-xl bg-white p-5 my-5">
      <h2 className="text-xl font-bold">Your three questions</h2>
      <ol className="list-decimal pl-6 space-y-3 my-4">{preview.prompts.map(p => <li key={p}>{p}</li>)}</ol>
      {preview.brand_specific && <p className="text-amber-800 mb-3">Your topic includes the business name or domain. These are brand-specific checks, not unprompted discovery observations.</p>}
      <button onClick={start} disabled={busy || !access?.enabled || access.remaining < 1} className="bg-blue-700 text-white rounded-lg px-5 py-3 disabled:opacity-50">{busy ? 'Submitting…' : access?.plan === 'free' && !(access.bonus?.limit > 0) ? 'Use starter credit' : 'Use one scan credit'}</button>
    </section>}
    {active && <section aria-live="polite" className="p-5 border rounded-xl bg-white"><h2 className="text-xl font-bold">{job.status === 'queued' ? 'Your scan is queued' : 'Checking your questions'}</h2><p>{job.completed_questions} of 3 answers saved. You can leave and return; refreshing will not start another scan.</p></section>}
    {job?.error && <p role="status" className="my-5 p-4 bg-amber-50 rounded-xl">{job.error}</p>}
    {result && <section className="mt-8" aria-live="polite">
      <h2 className="text-2xl font-bold">What appeared in this check</h2>
      <p className="text-sm text-slate-600 my-2">{result.business_name} · {result.domain} · {new Date(result.checked_at).toLocaleString()}</p>
      <div className="space-y-4">{result.evidence.map((record,i) => <article key={i} className="bg-white border rounded-xl p-5">
        <h3 className="font-semibold">{i + 1}. {record.prompt}</h3>
        <p className="my-2">{record.domain_cited ? 'Your domain was cited in this answer.' : 'Your domain was not cited in this answer.'} {record.name_match ? 'Possible name match — verify the entity.' : 'No exact name match observed.'}</p>
        <p className="text-xs text-slate-500">{record.provider} · {record.model} · {new Date(record.observed_at).toLocaleString()}</p>
        <details className="mt-3"><summary className="cursor-pointer text-blue-700">Read the answer and sources</summary>
          <p className="whitespace-pre-wrap mt-3">{record.answer}</p>
          {record.citations.map((citation,n) => <p key={n} className="text-sm mt-2"><q>{citation.cited_span}</q> — <a className="underline text-blue-700" href={citation.url} target="_blank" rel="noreferrer">{citation.title || citation.url}</a></p>)}
          {!record.citations.length && <p className="text-sm mt-2">No usable citations were returned.</p>}
          <p className="text-xs text-slate-500 mt-3">{record.interpretation}</p>
        </details>
      </article>)}</div>
      <h2 className="text-2xl font-bold mt-8 mb-4">Your next actions</h2>
      {result.actions.length === 0 && <p role="status" className="p-4 bg-slate-50 rounded-xl">No evidence-backed actions were identified in this check. Review the three answers and sources above; this does not mean there is nothing to improve.</p>}
      <ol className="space-y-4">{result.actions.map((action,i) => <li key={action.title} className="bg-white border rounded-xl p-5"><h3 className="font-semibold">{i + 1}. {action.title}</h3><p className="my-2">{action.action}</p><p className="text-sm text-slate-600">Evidence: {action.evidence}</p>{action.source_url && <a href={action.source_url} className="underline text-blue-700" target="_blank" rel="noreferrer">Review source</a>}</li>)}</ol>
      <p className="text-sm text-slate-600 mt-5">{result.limitations}</p>
    </section>}
    <p className="text-sm text-slate-600 mt-8">Membership: $47/month for 10 scans per UTC calendar month. Purchases are not enabled yet. Your current free learning access continues.</p>
  </main>;
}
