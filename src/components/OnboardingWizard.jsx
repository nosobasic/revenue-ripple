import { useEffect, useState } from "react";
import { ArrowRight, Check, Sparkles, Target } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { memberApi } from "../lib/memberApi";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
const interests = [
  "SEO & Content Marketing",
  "Paid Advertising (PPC)",
  "Social Media Marketing",
  "Email Marketing",
  "Affiliate Marketing",
  "Funnel Building",
  "Web Design",
  "AI & Automation",
];
const titles = [
  "What would you like to achieve?",
  "What would you like to learn?",
  "Choose your experience and pace",
  "Your learning plan",
];
const descriptions = [
  "Start with one goal. We’ll keep it front and center on your dashboard.",
  "Choose the skills you want to put into practice.",
  "We’ll use this context to help you through the material.",
  "Review your plan, then take your first step with Ripple.",
];
const defaults = {
  goals: "",
  interests: [],
  experience: "",
  targetRevenue: "",
  dailyMinutes: "15",
};
export default function OnboardingWizard({
  onComplete,
  onDismiss,
  initialState,
}) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [data, setData] = useState(defaults);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const incoming = initialState?.data || {};
    setData({
      ...defaults,
      ...incoming,
      goals: typeof incoming.goals === "string" ? incoming.goals : "",
      interests: Array.isArray(incoming.interests) ? incoming.interests : [],
    });
    // Original wizard had a welcome screen at index zero.
    setStep(Math.min(3, Math.max(0, (initialState?.current_step || 1) - 1)));
  }, [initialState]);
  const change = (key, value) => setData((old) => ({ ...old, [key]: value }));
  const valid =
    step === 0
      ? data.goals.trim().length > 0
      : step === 1
        ? data.interests.length > 0
        : step === 2
          ? !!data.experience
          : true;
  async function advance() {
    if (!valid || busy) return;
    setBusy(true);
    setError("");
    try {
      await memberApi(user, "/api/onboarding/state", {
        method: "PUT",
        body: JSON.stringify({
          current_step: Math.min(step + 2, 4),
          data: { ...data, goals: data.goals.trim() },
        }),
      });
      if (step === 3) {
        await memberApi(user, "/api/onboarding/complete", { method: "POST" });
        onComplete?.(data);
      } else setStep(step + 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onDismiss?.();
      }}
    >
      <DialogContent
        onEscapeKeyDown={(e) => {
          if (busy) e.preventDefault();
        }}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <span className="rr-eyebrow">
          <Sparkles size={15} /> Welcome to Revenue Ripple
        </span>
        <div className="rr-step-bars" aria-label={`Step ${step + 1} of 4`}>
          {titles.map((_, i) => (
            <span key={i} className={i <= step ? "active" : ""} />
          ))}
        </div>
        <DialogTitle className="rr-dialog-title">{titles[step]}</DialogTitle>
        <DialogDescription className="rr-muted">
          {descriptions[step]}
        </DialogDescription>
        <div className="rr-onboarding-body">
          {step === 0 && (
            <>
              <label htmlFor="onboarding-goal">My main goal</label>
              <textarea
                id="onboarding-goal"
                maxLength={500}
                rows={3}
                placeholder="Build an email list of 1,000 subscribers…"
                value={data.goals}
                onChange={(e) => change("goals", e.target.value)}
              />
              <div className="rr-chips">
                {[
                  "Launch my first campaign",
                  "Grow my email list",
                  "Use AI in my business",
                ].map((goal) => (
                  <button key={goal} onClick={() => change("goals", goal)}>
                    {goal}
                  </button>
                ))}
              </div>
              <label htmlFor="revenue-target">
                Revenue target <span className="rr-muted">(optional)</span>
              </label>
              <input
                id="revenue-target"
                value={data.targetRevenue}
                onChange={(e) => change("targetRevenue", e.target.value)}
                placeholder="e.g. $5,000 / month"
              />
            </>
          )}
          {step === 1 && (
            <div className="rr-choice-grid">
              {interests.map((interest) => (
                <button
                  key={interest}
                  aria-pressed={data.interests.includes(interest)}
                  onClick={() =>
                    change(
                      "interests",
                      data.interests.includes(interest)
                        ? data.interests.filter((i) => i !== interest)
                        : [...data.interests, interest],
                    )
                  }
                >
                  {interest}
                  {data.interests.includes(interest) && <Check size={16} />}
                </button>
              ))}
            </div>
          )}
          {step === 2 && (
            <>
              <div className="rr-choice-grid">
                {["beginner", "intermediate", "advanced"].map((level) => (
                  <button
                    key={level}
                    aria-pressed={data.experience === level}
                    onClick={() => change("experience", level)}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <label htmlFor="learning-time">Time for learning each day</label>
              <select
                id="learning-time"
                value={data.dailyMinutes}
                onChange={(e) => change("dailyMinutes", e.target.value)}
              >
                {["10", "15", "30", "60"].map((t) => (
                  <option key={t} value={t}>
                    {t} minutes
                  </option>
                ))}
              </select>
            </>
          )}
          {step === 3 && (
            <div className="rr-plan-preview">
              <Target size={26} />
              <h3>{data.goals}</h3>
              <p>{data.interests.join(" · ")}</p>
              <p>
                {data.experience} · {data.dailyMinutes} minutes a day
              </p>
              <ol>
                <li>Learn with a course matched to your interests.</li>
                <li>Check your understanding with a module quiz.</li>
                <li>Ask Ripple for help applying what you learned.</li>
              </ol>
            </div>
          )}
        </div>
        {error && (
          <p role="alert" className="rr-error">
            {error}
          </p>
        )}
        <div className="rr-dialog-actions">
          <Button
            variant="ghost"
            disabled={busy}
            onClick={() => (step ? setStep(step - 1) : onDismiss?.())}
          >
            {step ? "Back" : "Finish later"}
          </Button>
          <span className="rr-muted">{step + 1} / 4</span>
          <Button disabled={!valid || busy} onClick={advance}>
            {busy
              ? "Saving your plan…"
              : step === 3
                ? "Start my journey"
                : "Continue"}
            <ArrowRight />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
