import { useEffect, useState, useCallback } from "react";
import { Plus, Target, Check, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { memberApi } from "../lib/memberApi";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
const empty = { title: "", description: "", target_value: "", target_date: "" };
export default function GoalDashboard({ refreshKey = 0 }) {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(empty);
  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError("");
    try {
      const data = await memberApi(user, "/api/goals");
      setGoals(data.goals || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user]);
  useEffect(() => {
    load();
  }, [load, refreshKey]);
  async function mutate(path, method, body) {
    setBusy(true);
    setError("");
    try {
      await memberApi(user, path, {
        method,
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      if (method === "POST") {
        setOpen(false);
        setDraft(empty);
      }
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Card className="rr-panel rr-goals" id="goals">
      <div className="rr-section-heading">
        <div>
          <h2>
            <Target size={22} /> Your goals
          </h2>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
          <Plus /> Add goal
        </Button>
      </div>
      {error && (
        <div role="alert" className="rr-error">
          {error} <button onClick={load}>Retry</button>
        </div>
      )}
      {loading ? (
        <p className="rr-muted" role="status">
          Loading your goals…
        </p>
      ) : goals.length ? (
        <div className="rr-goal-list">
          {goals.map((goal) => {
            const percent =
              goal.status === "completed"
                ? 100
                : goal.target_value > 0
                  ? Math.max(
                      0,
                      Math.min(
                        100,
                        ((Number(goal.current_value) || 0) /
                          goal.target_value) *
                          100,
                      ),
                    )
                  : null;
            return (
              <article className="rr-goal" key={goal.id}>
                <div
                  className={`rr-goal-icon ${goal.status === "completed" ? "done" : ""}`}
                >
                  {goal.status === "completed" ? (
                    <Check size={18} />
                  ) : (
                    <Target size={18} />
                  )}
                </div>
                <div className="rr-goal-body">
                  <h3>{goal.title}</h3>
                  <p>
                    {goal.description ||
                      "One step at a time. Keep moving forward."}
                  </p>
                  {percent !== null && (
                    <>
                      <div className="rr-meter">
                        <span style={{ width: `${percent}%` }} />
                      </div>
                      <small>
                        {Math.round(percent)}% complete
                        {goal.target_value > 0 &&
                          ` · ${goal.current_value || 0} / ${goal.target_value}`}
                      </small>
                    </>
                  )}
                  <div className="rr-goal-meta">
                    <span className="rr-tag">{goal.status}</span>
                    {goal.target_date && (
                      <small>
                        Target {new Date(goal.target_date).toLocaleDateString()}
                      </small>
                    )}
                  </div>
                </div>
                <div className="rr-goal-actions">
                  {goal.status === "active" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={busy}
                      aria-label={`Complete ${goal.title}`}
                      onClick={() =>
                        mutate(`/api/goals/${goal.id}`, "PUT", {
                          status: "completed",
                        })
                      }
                    >
                      <Check />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={busy}
                    aria-label={`Delete ${goal.title}`}
                    onClick={() => {
                      if (window.confirm("Delete this goal?"))
                        mutate(`/api/goals/${goal.id}`, "DELETE");
                    }}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        !error && (
          <div className="rr-empty">
            <Target />
            <h3>What would you like to achieve?</h3>
            <p>
              Your onboarding goal will appear here. You can also add one now.
            </p>
            <Button variant="outline" onClick={() => setOpen(true)}>
              Set a goal <Arrow />
            </Button>
          </div>
        )
      )}
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!busy) setOpen(value);
        }}
      >
        <DialogContent>
          <DialogTitle className="rr-dialog-title">Create a goal</DialogTitle>
          <DialogDescription className="rr-muted">
            Set a goal you can work toward, one lesson at a time.
          </DialogDescription>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutate("/api/goals", "POST", {
                ...draft,
                title: draft.title.trim(),
                goal_type: "custom",
                target_value: draft.target_value
                  ? Number(draft.target_value)
                  : null,
                target_date: draft.target_date || null,
              });
            }}
          >
            <label htmlFor="goal-title">Goal</label>
            <input
              id="goal-title"
              required
              maxLength={500}
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
            <label htmlFor="goal-description">Description</label>
            <textarea
              id="goal-description"
              value={draft.description}
              onChange={(e) =>
                setDraft({ ...draft, description: e.target.value })
              }
            />
            <div className="rr-choice-grid">
              <div>
                <label htmlFor="goal-value">Target value (optional)</label>
                <input
                  id="goal-value"
                  type="number"
                  min="0.01"
                  step="any"
                  value={draft.target_value}
                  onChange={(e) =>
                    setDraft({ ...draft, target_value: e.target.value })
                  }
                />
              </div>
              <div>
                <label htmlFor="goal-date">Target date (optional)</label>
                <input
                  id="goal-date"
                  type="date"
                  value={draft.target_date}
                  onChange={(e) =>
                    setDraft({ ...draft, target_date: e.target.value })
                  }
                />
              </div>
            </div>
            {error && (
              <p role="alert" className="rr-error">
                {error}
              </p>
            )}
            <div className="rr-dialog-actions">
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button disabled={busy || !draft.title.trim()}>
                {busy ? "Saving…" : "Create goal"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
function Arrow() {
  return <span aria-hidden="true">→</span>;
}
