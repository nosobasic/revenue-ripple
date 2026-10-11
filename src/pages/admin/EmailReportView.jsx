import { createElement } from 'react';
import { ArrowUpRight, BarChart3, CheckCheck, Clock3, Mail, ShieldCheck, Sparkles, Users, Waves } from 'lucide-react';

const number = value => value == null ? 'Unavailable' : value.toLocaleString();
const date = value => value ? `${new Date(value).toLocaleString()} (local time)` : 'No matched feedback recorded';
const shortDate = value => new Date(`${value}T00:00:00Z`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });

function Metric({ label, value, detail, icon, color, tag }) {
  return <article className={`email-report-card email-report-card-${color}`}>
    <div className="email-report-card-top"><span className="email-report-icon">{createElement(icon, { size: 20, 'aria-hidden': true })}</span><span className="email-report-tag">{tag}</span></div>
    <h3>{label}</h3><strong>{number(value)}</strong><p>{detail}</p>
  </article>;
}

function DeliveryChart({ rows }) {
  if (!rows?.length) return <p className="email-report-muted">No daily delivery data is available.</p>;
  const max = Math.max(1, ...rows.map(row => row.accepted));
  const width = 620, height = 158, left = 30, top = 18, step = (width - left - 8) / rows.length;
  const ticks = [...new Set([0, Math.floor(rows.length / 2), rows.length - 1])];
  return <figure className="email-report-chart">
    <svg viewBox="0 0 640 220" role="img" aria-labelledby="delivery-chart-title delivery-chart-desc">
      <title id="delivery-chart-title">Accepted and delivered messages by accepted date</title>
      <desc id="delivery-chart-desc">UTC daily counts. Delivered outcomes belong to the accepted cohort. Exact values are available in the daily data table below.</desc>
      {[0, .5, 1].map(fraction => <g key={fraction}><line x1={left} x2={width} y1={top + height * fraction} y2={top + height * fraction} stroke="#dce5ef" strokeDasharray="3 5" /><text x={left - 9} y={top + height * fraction + 4} textAnchor="end">{(max * (1 - fraction)).toLocaleString(undefined, { maximumFractionDigits: 1 })}</text></g>)}
      {rows.map((row, index) => <g key={row.day}><title>{`${row.day}: ${row.accepted} accepted, ${row.delivered} delivered`}</title>
        <rect x={left + index * step + step * .15} y={top + height * (1 - row.accepted / max)} width={step * .3} height={height * row.accepted / max} rx={Math.min(3, step * .08)} fill="#4f46e5" />
        <rect x={left + index * step + step * .5} y={top + height * (1 - row.delivered / max)} width={step * .3} height={height * row.delivered / max} rx={Math.min(3, step * .08)} fill="#0d9488" />
      </g>)}
      {ticks.map(index => <text key={index} x={left + (index + .5) * step} y="201" textAnchor="middle">{shortDate(rows[index].day)}</text>)}
    </svg>
    <figcaption>By accepted date · UTC · first and last days may be partial</figcaption>
  </figure>;
}

function CoverageCard() {
  return <aside className="email-report-coverage" aria-labelledby="engagement-coverage-title">
    <div className="email-report-coverage-top"><span className="email-report-icon"><Sparkles size={21} aria-hidden="true" /></span><span className="email-report-tag">Tracking coverage</span></div>
    <h2 id="engagement-coverage-title">Clarity before clicks.</h2>
    <p>Open and click tracking is not verified yet. Delivery activity is real evidence; engagement rates need their own.</p>
    <dl className="email-report-untracked"><div><dt>Open rate</dt><dd>Unavailable</dd></div><div><dt>CTR</dt><dd>Unavailable</dd></div><div><dt>CTOR</dt><dd>Unavailable</dd></div></dl>
    <a href="#email-report-definitions">How these rates work <ArrowUpRight size={15} aria-hidden="true" /></a>
  </aside>;
}

export function EmailReportView({ report }) {
  const delivery = report.delivery, list = report.list, counts = delivery.counts || {};
  const feedbackIsOld = delivery.last_feedback_recorded_at && new Date(report.generated_at) - new Date(delivery.last_feedback_recorded_at) > 86400000;
  if (report.classification?.status === 'unavailable') return <section className="email-report-setup" aria-labelledby="report-setup-title">
    <span className="email-report-icon"><ShieldCheck size={27} aria-hidden="true" /></span><span className="email-report-eyebrow">A FOUNDATION YOU CAN TRUST</span>
    <h2 id="report-setup-title">Your next insight starts with reliable data.</h2>
    <p>We’re waiting for the reporting connection to verify which activity belongs to real subscribers. Simulator tests will stay out of your business results.</p>
    <div className="email-report-setup-topics"><span><Mail size={19} />Delivery</span><span><Users size={19} />List health</span><span><BarChart3 size={19} />Message trends</span></div>
    <div className="email-report-notice" role="status"><ShieldCheck size={18} aria-hidden="true" /><div><strong>Unavailable doesn’t mean zero.</strong><br />Results will appear once the reporting boundary is verified. No sending or tracking settings have changed.</div></div>
    <details><summary>What about engagement and growth?</summary><p>Open rate, CTR and CTOR need verified tracking. Net eligible-list growth needs historical eligibility records. Neither will be inferred from delivery events.</p></details>
    <p className="email-report-muted">Last checked: {date(report.generated_at)}</p>
  </section>;
  return <>
    <div className="email-report-context"><span><Clock3 size={15} aria-hidden="true" /> {new Date(report.window_start).toLocaleDateString()} – {new Date(report.window_end).toLocaleDateString()}</span><span>Updated {date(report.generated_at)}</span></div>
    <section aria-labelledby="overview-title">
      <div className="email-report-section-heading"><div><span className="email-report-eyebrow">THE BIG PICTURE</span><h2 id="overview-title">Your email overview</h2></div><span className="email-report-scope"><ShieldCheck size={15} aria-hidden="true" /> Simulator activity excluded</span></div>
      {(delivery.status !== 'available' || list.status !== 'available') && <p role="status" className="email-report-notice">Some reporting sources are unavailable. No partial totals are shown.</p>}
      <div className="email-report-grid">
        <Metric label="Consent-eligible subscribers" value={list.eligible} icon={Users} color="blue" tag="Your audience" detail="Current human opt-ins, active and admitted, without exclusion or uncertain delivery. Net growth needs historical eligibility data." />
        <Metric label="Sent · accepted by SES" value={counts.accepted} icon={Mail} color="purple" tag={`Last ${report.days} days`} detail="Distinct recipient-messages accepted in this window. Acceptance is not delivery; retries are not extra sends." />
        <Metric label="Delivered" value={counts.delivery} icon={CheckCheck} color="teal" tag={counts.accepted ? `${(counts.delivery / counts.accepted * 100).toFixed(1)}% of accepted` : 'Delivery feedback'} detail={counts.accepted ? 'Messages with actual delivery feedback. Receiving mail server acceptance does not establish inbox placement.' : counts.accepted === 0 ? 'No sends yet. Delivery rate has no denominator.' : 'Delivery source is unavailable.'} />
      </div>
    </section>
    <div className="email-report-insights">
      <section className="email-report-panel email-report-trend" aria-labelledby="trend-title"><header><div><BarChart3 size={19} aria-hidden="true" /><h2 id="trend-title">Your delivery rhythm</h2></div><span className="email-report-tag">Last {report.days} days</span></header>
        <div className="email-report-panel-body"><div className="email-report-legend"><span><i />Accepted</span><span><i />Delivered</span></div>
          {delivery.status === 'available' ? <DeliveryChart rows={delivery.daily} /> : <p>Daily trend unavailable.</p>}
          {delivery.status === 'available' && <details className="email-report-chart-data"><summary>View daily data</summary><div className="email-report-table-wrap" tabIndex={0} role="region" aria-label="Scrollable email metrics table"><table><caption className="email-report-sr">Daily delivery trend in UTC</caption><thead><tr><th scope="col">Accepted date</th><th scope="col">Accepted</th><th scope="col">Delivered</th></tr></thead><tbody>{delivery.daily.map(row => <tr key={row.day}><th scope="row">{row.day}</th><td>{row.accepted}</td><td>{row.delivered}</td></tr>)}</tbody></table></div></details>}
        </div></section><CoverageCard />
    </div>
    <div className="email-report-freshness"><Clock3 size={16} aria-hidden="true" /><p>Latest matched feedback recorded: <strong>{delivery.status === 'available' ? date(delivery.last_feedback_recorded_at) : 'Unavailable'}</strong>. {feedbackIsOld && 'This is over 24 hours old; low traffic may explain it. '}Recording time alone does not establish ingestion health.</p></div>
    <section className="email-report-panel email-report-health-panel" aria-labelledby="health-title"><header><div><Waves size={20} aria-hidden="true" /><h2 id="health-title">List & delivery health</h2></div><span className="email-report-tag">Care for your audience</span></header><div className="email-report-panel-body">
      <dl className="email-report-health">{[
        ['Hard-bounced messages', counts.bounced], ['Non-permanent bounces', counts.transient_bounce], ['Complained messages', counts.complained], ['Recent unsubscribed contacts', list.unsubscribed_in_window],
        ['Suppressed contacts · now', list.suppressed], ['Quarantined attempts · now', delivery.operations?.uncertain], ['Legacy exclusion addresses', list.legacy_exclusion_addresses], ['Awaiting review · now', list.review],
      ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{number(value)}</dd></div>)}</dl>
      <p className="email-report-muted">Bounce and complaint counts follow the accepted cohort. Non-permanent bounces include temporary and undetermined outcomes; final soft bounces are unavailable. Recent unsubscribes count currently unsubscribed contacts timestamped in the window, not a full transition history. Review and suppression may overlap.</p>
      {list.status === 'available' && !list.manifest_ready && <p className="email-report-notice">Eligibility is unavailable until the legacy exclusion manifest is ready and complete.</p>}
    </div></section>
    <div className="email-report-detail-heading"><span className="email-report-eyebrow">TAKE A CLOSER LOOK</span><h2>Details when you need them</h2></div>
    {delivery.status === 'available' && <details className="email-report-detail"><summary><span>By sequence & message<small>See which messages reached their audience</small></span></summary><p>Unique accepted recipient-messages grouped by sequence and step. Feedback follows the accepted cohort.</p>
      <div className="email-report-table-wrap" tabIndex={0} role="region" aria-label="Scrollable email metrics table"><table><caption className="email-report-sr">Message delivery outcomes</caption><thead><tr>{['Sequence', 'Message', 'Accepted', 'Delivered', 'Hard bounces', 'Complaints'].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{delivery.messages.map(row => <tr key={`${row.sequence}-${row.step}`}><th scope="row">{row.sequence}</th><td>{row.step}</td><td>{row.accepted}</td><td>{row.delivered}</td><td>{row.hard_bounces}</td><td>{row.complaints}</td></tr>)}</tbody></table></div>{!delivery.messages.length && <p>No accepted messages recorded in this window.</p>}
    </details>}
    <details className="email-report-detail"><summary><span>Operational details<small>Current attempts and delivery exceptions</small></span></summary><dl className="email-report-health">{[['Send feedback observed', counts.send], ['Rejected messages', counts.reject], ['Retryable attempts · now', delivery.operations?.retryable], ['Blocked attempts · now', delivery.operations?.blocked], ['Sending attempts · now', delivery.operations?.sending], ['Claimed attempts · now', delivery.operations?.claimed], ['Human CRM contacts · now', list.total]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{number(value)}</dd></div>)}</dl><p>Send feedback supports acceptance; it is not additional sends. Retryable work includes budget deferrals. Uncertain attempts need reconciliation and are not confirmed failures. Eligibility does not mean enrollment, due status, or enabled sending.</p></details>
    <details className="email-report-detail" id="email-report-definitions"><summary><span>Coverage & definitions<small>The meaning behind every number</small></span></summary>{report.notes.map(note => <p key={note}>{note}</p>)}<dl className="email-report-definitions"><div><dt>CTR</dt><dd>Unique content-clicked messages ÷ accepted messages with verified click tracking and a content link. Unsubscribe and preferences clicks are excluded.</dd></div><div><dt>Open rate</dt><dd>Opened-delivered messages ÷ delivered HTML messages with verified open tracking.</dd></div><div><dt>CTOR</dt><dd>Unique clicked ÷ opened messages within the same both-trackable cohort. It may exceed 100% when a click occurs without an observed open.</dd></div></dl><p>Unique means one recipient-message, not unique people across emails. A zero denominator means unavailable. Privacy prefetch and scanners can affect observed engagement. Definitions need not match GetResponse exactly.</p><p>Unavailable means a required source or contract could not be verified; it never means zero. Available results come from one database snapshot. Historical engagement cannot be reconstructed from delivery events.</p></details>
  </>;
}
