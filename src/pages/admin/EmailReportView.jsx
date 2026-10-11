const number = value => value == null ? 'Unavailable' : value.toLocaleString();
const date = value => value ? `${new Date(value).toLocaleString()} (local time)` : 'No matched feedback recorded';

function Metric({ label, value, detail }) {
  return <article className="email-report-card"><h3>{label}</h3><strong>{number(value)}</strong><p>{detail}</p></article>;
}

export function EmailReportView({ report }) {
  const delivery = report.delivery;
  const list = report.list;
  const counts = delivery.counts || {};
  const feedbackIsOld = delivery.last_feedback_recorded_at && new Date(report.generated_at) - new Date(delivery.last_feedback_recorded_at) > 86400000;
  return <>
    <p className="email-report-muted">{new Date(report.window_start).toLocaleDateString()} – {new Date(report.window_end).toLocaleDateString()} · Last {report.days} days · Updated {date(report.generated_at)}</p>
    <div className="email-report-notice"><strong>Know what is measured.</strong> Open and click tracking is not verified. Rates stay unavailable until reliable tracking exists. Simulator activity is excluded.</div>
    <section aria-labelledby="overview-title">
      <h2 id="overview-title">Your email overview</h2>
      {(delivery.status !== 'available' || list.status !== 'available') && <p role="status" className="email-report-notice">Some reporting sources are unavailable. No partial totals are shown.</p>}
      <div className="email-report-grid">
        <Metric label="Consent-eligible subscribers" value={list.eligible} detail="Current human opt-ins, active and admitted, without exclusion or uncertain delivery. Net growth unavailable without historical eligibility data." />
        <Metric label="Sent · accepted by SES" value={counts.accepted} detail="Distinct SES message + recipient pairs accepted in this window. Acceptance is not delivery." />
        <Metric label="Delivered" value={counts.delivery} detail={counts.accepted ? `${(counts.delivery / counts.accepted * 100).toFixed(1)}% of accepted messages have delivery feedback. Not inbox placement.` : counts.accepted === 0 ? 'No sends yet. Delivery rate has no denominator.' : 'Receiving mail server accepted the message. Rate unavailable.'} />
        <Metric label="Unique clicked messages · CTR" detail="Tracking not verified. CTR uses clicked messages ÷ accepted messages with verified click tracking and a content link." />
        <Metric label="Observed opened messages · open rate" detail="Tracking not verified. Open rate uses opened-delivered messages ÷ delivered HTML messages with verified open tracking." />
        <Metric label="Click-to-open rate · CTOR" detail="Tracking not verified. Clicked messages ÷ opened messages, using the same cohort with both kinds of tracking." />
      </div>
      <p className="email-report-muted">Latest matched feedback recorded: {delivery.status === 'available' ? date(delivery.last_feedback_recorded_at) : 'Unavailable'}. {feedbackIsOld && 'Latest matched feedback is over 24 hours old; low traffic may explain this. '}Recording time does not establish ingestion health.</p>
    </section>
    <section aria-labelledby="health-title"><h2 id="health-title">List and delivery health</h2>
      <dl className="email-report-health">
        {[
          ['Hard-bounced messages', counts.bounced], ['Non-permanent bounced messages', counts.transient_bounce],
          ['Complained messages', counts.complained], ['Recent unsubscribed contacts', list.unsubscribed_in_window],
          ['Suppressed contacts · now', list.suppressed], ['Quarantined attempts · now', delivery.operations?.uncertain],
          ['Legacy exclusion addresses', list.legacy_exclusion_addresses], ['Awaiting review · now', list.review],
        ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{number(value)}</dd></div>)}
      </dl>
      <p className="email-report-muted">Bounce and complaint counts follow the accepted cohort. Non-permanent bounces include temporary and undetermined outcomes; final soft bounces are unavailable. Recent unsubscribes count currently unsubscribed contacts timestamped in the window, not a full transition history. Review and suppression counts may overlap.</p>
      {list.status === 'available' && !list.manifest_ready && <p className="email-report-notice">Eligibility unavailable until the legacy exclusion manifest is ready and complete.</p>}
    </section>
    <details><summary>Operational details</summary><dl className="email-report-health">
      {[['Send feedback observed', counts.send], ['Rejected messages', counts.reject], ['Retryable attempts · now', delivery.operations?.retryable], ['Blocked attempts · now', delivery.operations?.blocked], ['Sending attempts · now', delivery.operations?.sending], ['Claimed attempts · now', delivery.operations?.claimed], ['Human CRM contacts · now', list.total]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{number(value)}</dd></div>)}
      </dl><p>Send feedback is supporting evidence for accepted messages, not additional sends. Retryable work includes budget deferrals. Uncertain attempts require reconciliation; they are not confirmed failures. Eligibility does not mean a contact is enrolled, due, or sending is enabled.</p></details>
    {delivery.status === 'available' && <>
      <details><summary>By sequence and message</summary><p>Unique accepted recipient-messages, grouped by sequence and step. Feedback follows the accepted cohort.</p>
        <div className="email-report-table-wrap"><table><caption className="email-report-sr">Message delivery outcomes</caption><thead><tr>{['Sequence', 'Message', 'Accepted', 'Delivered', 'Hard bounces', 'Complaints'].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>
          {delivery.messages.map(row => <tr key={`${row.sequence}-${row.step}`}><th scope="row">{row.sequence}</th><td>{row.step}</td><td>{row.accepted}</td><td>{row.delivered}</td><td>{row.hard_bounces}</td><td>{row.complaints}</td></tr>)}
        </tbody></table></div>{!delivery.messages.length && <p>No accepted messages recorded in this window.</p>}
      </details>
      <details><summary>Daily delivery trend (UTC)</summary><p>Grouped by acceptance date. First and last days may be partial.</p><div className="email-report-table-wrap"><table><thead><tr><th scope="col">Accepted date</th><th scope="col">Accepted</th><th scope="col">Delivered</th></tr></thead><tbody>{delivery.daily.map(row => <tr key={row.day}><th scope="row">{row.day}</th><td>{row.accepted}</td><td>{row.delivered}</td></tr>)}</tbody></table></div></details>
    </>}
    <details><summary>Coverage and definitions</summary>{report.notes.map(note => <p key={note}>{note}</p>)}<p>Source reads are bounded and are not a transactionally consistent database snapshot. Unavailable means a source is missing, unreadable, or exceeds the reporting limit; it never means zero.</p><p>Unique means one recipient-message, not unique people across emails; total counts every action. Content CTR excludes unsubscribe and preferences links. Engagement, once instrumented, is observed and unfiltered: privacy prefetch and scanners can affect it. CTOR may exceed 100% when clicks occur without pixel loads. Definitions need not match GetResponse exactly. Zero denominators do not produce 0%.</p><p>To add engagement reporting: verify SES open/click instrumentation and consent implications, preserve provider event time and bounce subtype, and record tracking coverage per message. Historical rates cannot be reconstructed from delivery events.</p></details>
  </>;
}

