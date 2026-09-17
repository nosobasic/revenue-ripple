import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getApiBase } from '../config/constants';

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [status, setStatus] = useState(token ? 'working' : 'idle');
  const [email, setEmail] = useState('');
  const [message, setStatusMessage] = useState('');

  useEffect(() => {
    if (!token) return;
    fetch(`${getApiBase()}/api/email/unsubscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then(() => {
        setStatus('done');
        setStatusMessage('You are unsubscribed. You will not receive further marketing emails.');
      })
      .catch(() => {
        setStatus('error');
        setStatusMessage('We could not process that link. Try again with your email below.');
      });
  }, [token]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('working');
    try {
      const res = await fetch(`${getApiBase()}/api/email/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      await res.json();
      setStatus('done');
      setStatusMessage('If that address is on the list, it has been unsubscribed.');
    } catch {
      setStatus('error');
      setStatusMessage('Something went wrong. Email support@revenueripple.org.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Email preferences</h1>
        {status === 'working' && <p className="text-gray-600">Updating your preferences…</p>}
        {message && <p className="text-gray-700 mb-4">{message}</p>}
        {status !== 'working' && status !== 'done' && (
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block text-sm text-gray-700">
              Email
              <input
                type="email"
                required
                className="mt-1 w-full border rounded px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <button type="submit" className="w-full bg-gray-900 text-white py-2 rounded">
              Unsubscribe from marketing emails
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
