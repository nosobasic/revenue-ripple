import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Send, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAIAssistant } from "../context/AIAssistantContext";
import { memberApi } from "../lib/memberApi";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";

export default function LearningCoach({ context, lessonPath, lessonTitle }) {
  const { user } = useAuth();
  const { isOpen, setIsOpen } = useAIAssistant();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const end = useRef(null);
  useEffect(() => {
    setMessages([]);
    setInput("");
    setError("");
  }, [user?.id]);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [messages, busy]);
  async function send(text = input) {
    if (busy || !text.trim()) return;
    const message = text.trim();
    setBusy(true);
    setError("");
    setInput("");
    const history = [...messages, { from: "user", text: message }];
    setMessages(history);
    try {
      const response = await memberApi(user, "/api/ai-assistant", {
        method: "POST",
        body: JSON.stringify({
          message,
          previousMessages: messages.slice(-6),
          context: {
            page: "/dashboard",
            userRole: user?.role || "member",
            learningContext: context,
          },
        }),
      });
      if (!response.reply)
        throw new Error("Ripple could not respond. Please try again.");
      setMessages([...history, { from: "ai", text: response.reply }]);
    } catch (e) {
      setMessages(messages);
      setInput(message);
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="rr-learning-coach">
        <span className="rr-eyebrow">
          <Sparkles size={16} /> RIPPLE · YOUR LEARNING COMPANION
        </span>
        <DialogTitle className="rr-dialog-title">
          Let’s work through it.
        </DialogTitle>
        <DialogDescription className="rr-muted">
          Ask a question, practice an idea, or turn your next lesson into an
          action.
        </DialogDescription>
        <Link
          to={lessonPath}
          className="rr-coach-lesson"
          onClick={() => setIsOpen(false)}
        >
          <div>
            <small>YOUR NEXT LESSON</small>
            <p>{lessonTitle || "Explore your courses"}</p>
          </div>
          <ArrowRight size={18} />
        </Link>
        <div
          className="rr-chat-log"
          role="log"
          aria-live="polite"
          aria-label="Conversation with Ripple"
        >
          {!messages.length && (
            <div className="rr-chat-message">
              <span>RIPPLE</span>
              <p>
                What would help you move forward today? We can unpack a concept,
                try a practice question, or plan a small action for your
                business.
              </p>
            </div>
          )}
          {messages.map((message, i) => (
            <div
              key={i}
              className={`rr-chat-message ${message.from === "user" ? "rr-chat-user" : ""}`}
            >
              <span>{message.from === "user" ? "YOU" : "RIPPLE"}</span>
              <p>{message.text}</p>
            </div>
          ))}
          {busy && (
            <p className="rr-muted" role="status">
              Ripple is thinking…
            </p>
          )}
          <div ref={end} />
        </div>
        {!messages.length && (
          <div className="rr-chips">
            {[
              "Explain my next lesson",
              "Give me a practice question",
              "Help me apply this to my goal",
            ].map((text) => (
              <button key={text} disabled={busy} onClick={() => send(text)}>
                {text}
              </button>
            ))}
          </div>
        )}
        {error && (
          <p className="rr-error" role="alert">
            {error} Your message is ready to resend.
          </p>
        )}
        <form
          className="rr-chat-form"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <label className="sr-only" htmlFor="coach-message">
            Message Ripple
          </label>
          <textarea
            id="coach-message"
            rows={2}
            maxLength={4000}
            placeholder="What’s on your mind?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                send();
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={busy || !input.trim()}
            aria-label="Send message"
          >
            <Send />
          </Button>
        </form>
        <small className="rr-muted">
          Ripple can help explain and practice. Check important details against
          your course material.
        </small>
      </DialogContent>
    </Dialog>
  );
}
