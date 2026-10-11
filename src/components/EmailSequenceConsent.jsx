export const EMAIL_CONSENT_VERSION = 'free-education-2026-10-06';
export const EMAIL_CONSENT_TEXT = 'Yes, email me Revenue Ripple’s free learning sequence: 9 introductory emails over 14 days, then 26 digital marketing lessons every two weeks. I can unsubscribe at any time.';

export default function EmailSequenceConsent({ checked, onChange }) {
  return (
    <div className="text-sm text-gray-600">
      <label className="flex items-start gap-3">
        <input type="checkbox" name="email_consent" checked={checked}
          onChange={(event) => onChange(event.target.checked)} className="mt-1" />
        <span>{EMAIL_CONSENT_TEXT}</span>
      </label>
      <p className="mt-2">Optional. You can get the free download without subscribing. <a className="underline" href="/privacy-policy">Privacy policy</a>.</p>
    </div>
  );
}
