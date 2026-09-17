import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';

const AdminEmailEnrollments = () => {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('active');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      let query = supabase
        .from('email_enrollments')
        .select('id,sequence_id,step_index,status,next_send_at,last_sent_at,origin,getresponse_day_of_cycle,email_contacts(email,name,source,status)')
        .order('next_send_at', { ascending: true, nullsFirst: false })
        .limit(200);
      if (status !== 'all') {
        query = query.eq('status', status);
      }
      const { data, error: qError } = await query;
      if (cancelled) return;
      if (qError) {
        setError(qError.message);
        setRows([]);
      } else {
        setRows(data || []);
      }
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [status]);

  return (
    <div style={{ padding: '20px' }}>
      <header className="admin-header">
        <h1 className="admin-title">Email enrollments</h1>
      </header>
      <p style={{ color: '#4b5563', marginBottom: '16px' }}>
        Existing list: reset email, then DMD lesson 1 (pause a row if they reply and opt out). New opt-ins still run indoctrination first.
      </p>
      <div style={{ marginBottom: '16px' }}>
        <label>
          Status{' '}
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">active</option>
            <option value="paused">paused</option>
            <option value="completed">completed</option>
            <option value="suppressed">suppressed</option>
            <option value="all">all</option>
          </select>
        </label>
      </div>
      {loading && <p>Loading…</p>}
      {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
      {!loading && !error && (
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Source</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Sequence</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Step</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>GR day</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Next send</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const contact = row.email_contacts || {};
                return (
                  <tr key={row.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '8px' }}>{contact.email}</td>
                    <td style={{ padding: '8px' }}>{contact.source}</td>
                    <td style={{ padding: '8px' }}>{row.sequence_id}</td>
                    <td style={{ padding: '8px' }}>{row.step_index}</td>
                    <td style={{ padding: '8px' }}>{row.getresponse_day_of_cycle ?? '—'}</td>
                    <td style={{ padding: '8px' }}>{row.next_send_at ? new Date(row.next_send_at).toLocaleString() : '—'}</td>
                    <td style={{ padding: '8px' }}>{row.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length === 0 && <p style={{ marginTop: '12px' }}>No enrollments yet. Run the GetResponse import after applying the SQL migration.</p>}
        </div>
      )}
    </div>
  );
};

export default AdminEmailEnrollments;
