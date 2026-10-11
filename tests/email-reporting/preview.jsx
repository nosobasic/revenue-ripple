// Static, offline review of the unavailable state. Never calls a backend.
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { EmailReportView } from '../../src/pages/admin/EmailReportView';
const report = {
  days: 30, generated_at: '2026-10-11T12:00:00Z', window_start: '2026-09-11T12:00:00Z', window_end: '2026-10-11T12:00:00Z',
  delivery: { status: 'unavailable' }, list: { status: 'unavailable' }, notes: ['Offline layout preview. No production data was loaded.'],
};
export const markup = renderToStaticMarkup(<div className="email-report"><header className="email-report-header"><div><span className="email-report-eyebrow">OFFLINE REVIEW · NO LIVE DATA</span><h1>Email reports</h1><p>A clear view of delivery, engagement, and list health.</p></div></header><EmailReportView report={report} /></div>);
