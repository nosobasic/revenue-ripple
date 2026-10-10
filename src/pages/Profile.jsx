import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUserRole } from '../hooks/useUserRole';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import MembershipBilling from '../components/MembershipBilling';
import '../pages.css';
import './Profile.css';

const fields = [
  ['name', 'Full name', 'text', 'name'],
  ['email', 'Email address', 'email', 'email'],
  ['phone', 'Phone number', 'tel', 'tel'],
  ['company', 'Company', 'text', 'organization'],
];
const details = user => Object.fromEntries(['name', 'email', 'phone', 'company', 'bio'].map(key => [key, user?.[key] || '']));

export default function Profile() {
  const { user, updateUserProfile, logout } = useAuth();
  const { role } = useUserRole();
  const navigate = useNavigate();
  // Keyed content discards edits and in-flight UI on account changes.
  return <div className="dashboard profile-page"><Navbar />{user
    ? <ProfileDetails key={user.id} user={user} role={role} updateUserProfile={updateUserProfile} logout={logout} navigate={navigate} />
    : <main className="container profile-empty"><h1>Profile settings</h1><p>Please sign in to view your profile.</p><Link to="/login" state={{ from: '/profile' }}>Sign in</Link></main>}</div>;
}

function ProfileDetails({ user, role, updateUserProfile, logout, navigate }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState(() => details(user));
  useEffect(() => { if (!editing) setForm(details(user)); }, [user, editing]);
  async function save(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true); setMessage('');
    try {
      const emailChanged = form.email !== user.email;
      await updateUserProfile(form);
      setEditing(false);
      setMessage(emailChanged ? 'Profile saved. Follow the email confirmation instructions to complete an email change.' : 'Profile saved.');
    } catch { setMessage('We could not save your profile. Please try again.'); }
    finally { setSaving(false); }
  }
  async function signOut() {
    try { await logout(); navigate('/'); }
    catch { setMessage('We could not sign you out. Please try again.'); }
  }
  return <>
    <header className="dashboard-header"><div className="container profile-header">
      <div className="profile-identity"><span className="profile-avatar" aria-hidden="true"><FaUser /></span><div><h1 className="dashboard-title">Profile settings</h1><p className="dashboard-welcome">{user.name || 'Your account'}</p></div></div>
      <div className="profile-actions"><button className="profile-button light" disabled={saving} onClick={() => { setEditing(!editing); setForm(details(user)); setMessage(''); }}>{editing ? 'Cancel editing' : 'Edit profile'}</button><button className="profile-button light" disabled={saving} onClick={signOut}>Sign out</button></div>
    </div></header>
    <main className="container profile-layout">
      <section className="profile-card" aria-labelledby="personal-heading"><h2 id="personal-heading">Personal information</h2>
        <p className="profile-note">Update your contact details. Account roles and membership access are managed separately.</p>
        <form onSubmit={save}>
          <div className="profile-fields">{fields.map(([key, label, type, autoComplete]) => <div className="profile-field" key={key}><label htmlFor={`profile-${key}`}>{label}</label><input id={`profile-${key}`} name={key} type={type} autoComplete={autoComplete} value={form[key]} readOnly={!editing} disabled={saving} onChange={event => setForm(previous => ({ ...previous, [key]: event.target.value }))} /></div>)}</div>
          <div className="profile-field"><label htmlFor="profile-bio">About you</label><textarea id="profile-bio" name="bio" rows={4} value={form.bio} readOnly={!editing} disabled={saving} onChange={event => setForm(previous => ({ ...previous, bio: event.target.value }))} /></div>
          {editing && <button type="submit" className="profile-button" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>}
          <p role="status" aria-live="polite">{message}</p>
        </form>
      </section>
      <aside className="profile-sidebar">
        <section className="profile-card" aria-labelledby="access-heading"><h2 id="access-heading">Account access</h2><dl className="profile-access"><dt>Account role</dt><dd>{role ? role.replaceAll('_', ' ') : 'Unavailable'}</dd><dt>Recorded plan</dt><dd>{user.plan || 'Not recorded'}</dd></dl><p>Learning access and existing membership are separate from a linked Stripe billing account.</p><p className="profile-note">Administrator access does not grant paid scan credits. Scans are not enabled.</p></section>
        <MembershipBilling userId={user.id} />
        {['affiliate', 'reseller'].includes(role) && <nav className="profile-card profile-links" aria-label="Optional upgrades"><h2>Explore upgrade options</h2>{role === 'affiliate' && <Link to="/special">Explore Reseller</Link>}<Link to="/affiliate-centre/tools">Explore Pro Reseller</Link><p className="profile-note">Review the offer before choosing an upgrade. These links do not change your current membership.</p></nav>}
        <nav className="profile-card profile-links" aria-label="Account resources"><h2>Quick actions</h2>{role !== 'pro_reseller' && <Link to="/affiliate-centre/tools">Marketing tools</Link>}<Link to="/affiliate-centre/training">Training & guides</Link><Link to="/affiliate-centre/payouts">Earnings & payouts</Link><Link to="/affiliate-centre/support">Support & FAQ</Link></nav>
      </aside>
    </main>
  </>;
}
