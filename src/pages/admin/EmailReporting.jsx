import { useEffect, useState } from 'react';
import { ArrowUpRight, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { authenticatedFetch } from '../../lib/authenticatedFetch';
import './email-reporting.css';

import { EmailReportView } from './EmailReportView';
import { startEmailReportRequest } from './emailReportRequest';

export default function EmailReporting() {
  const [days, setDays] = useState('30');
  const [refresh, setRefresh] = useState(0);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    setReport(null); setError('');
    return startEmailReportRequest(authenticatedFetch, days, setReport, setError);
  }, [days, refresh]);
  return <div className="email-report">
    <header className="email-report-header"><div><span className="email-report-eyebrow">REVENUE RIPPLE · EMAIL CRM</span><h1>Email reports</h1><p>See your reach. Understand your audience. Take your next step.</p></div><Link to="/admin/email">Manage enrollments <ArrowUpRight size={15} aria-hidden="true" /></Link></header>
    <div className="email-report-controls"><label>Reporting window <select value={days} onChange={e => setDays(e.target.value)}><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select></label><button onClick={() => setRefresh(value => value + 1)}><RefreshCw size={14} aria-hidden="true" /> Refresh</button></div>
    {error ? <p role="alert" className="email-report-notice">{error}</p> : report ? <EmailReportView report={report} /> : <p role="status">Loading email report…</p>}
  </div>;
}
