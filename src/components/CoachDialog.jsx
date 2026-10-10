import { useEffect, useId, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Link } from "react-router-dom";
import { ArrowRight, Send, Sparkles, X } from "lucide-react";
import styles from "./CoachDialog.module.css";

// Presentation only: each existing assistant keeps its own access and API logic.
export default function CoachDialog({
  open, onOpenChange, messages, input, onInputChange, onSend, busy = false,
  error = "", lessonPath, lessonTitle, suggestions = [], maxLength,
  showLauncher = false, inputRef,
}) {
  const inputId = useId();
  const end = useRef(null);
  const opener = useRef(null);
  const localInput = useRef(null);
  const content = useRef(null);
  const sending = useRef(false);
  const field = inputRef || localInput;
  useEffect(() => {
    if (open) end.current?.scrollIntoView({ block: "nearest" });
  }, [messages, busy, open]);
  async function submit(text) {
    if (sending.current || busy) return;
    sending.current = true;
    try {
      await onSend(text);
    } finally {
      sending.current = false;
    }
  }
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {showLauncher && (
        <Dialog.Trigger asChild>
          <button className={styles.launcher} aria-label="Open learning assistant">
            <Sparkles size={19} /> <span>Ask Ripple</span>
          </button>
        </Dialog.Trigger>
      )}
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content
          ref={content}
          className={styles.dialog}
          onOpenAutoFocus={event => {
            opener.current = document.activeElement;
            event.preventDefault();
            if (field.current && !field.current.disabled) field.current.focus();
            else content.current?.focus();
          }}
          onCloseAutoFocus={(event) => {
            if (opener.current?.isConnected && opener.current !== document.body) {
              event.preventDefault();
              opener.current.focus();
            }
          }}
        >
          <span className={styles.eyebrow}>
            <Sparkles size={16} /> RIPPLE · YOUR LEARNING COMPANION
          </span>
          <Dialog.Title className={styles.title}>Let’s work through it.</Dialog.Title>
          <Dialog.Description className={styles.description}>
            Ask a question, practice an idea, or turn your next lesson into an action.
          </Dialog.Description>
          {lessonPath && (
            <Link to={lessonPath} className={styles.lesson} onClick={() => onOpenChange(false)}>
              <div><small>YOUR NEXT LESSON</small><p>{lessonTitle || "Explore your courses"}</p></div>
              <ArrowRight size={18} />
            </Link>
          )}
          <div className={styles.log} role="log" aria-live="polite" aria-label="Conversation with Ripple">
            {!messages.length && (
              <div className={styles.message}>
                <span>RIPPLE</span>
                <p>What would help you move forward today? We can unpack a concept, try a practice question, or plan a small action for your business.</p>
              </div>
            )}
            {messages.map((message, i) => (
              <div key={message.id ?? i} className={`${styles.message} ${message.from === "user" ? styles.user : ""}`}>
                <span>{message.from === "user" ? "YOU" : "RIPPLE"}</span>
                <p>{message.text}</p>
                {message.timestamp && <time>{new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>}
              </div>
            ))}
            {busy && <p className={styles.description} role="status">Ripple is thinking…</p>}
            <div ref={end} />
          </div>
          {!messages.length && suggestions.length > 0 && (
            <div className={styles.chips}>
              {suggestions.map(text => <button key={text} disabled={busy} onClick={() => submit(text)}>{text}</button>)}
            </div>
          )}
          {error && <p className={styles.error} role="alert">{error}</p>}
          <form className={styles.form} onSubmit={event => { event.preventDefault(); submit(); }}>
            <label className={styles.srOnly} htmlFor={inputId}>Message Ripple</label>
            <textarea
              ref={field} id={inputId} rows={2} maxLength={maxLength}
              placeholder="What’s on your mind?" value={input} disabled={busy}
              onChange={event => onInputChange(event.target.value)}
              onKeyDown={event => {
                if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault(); submit();
                }
              }}
            />
            <button type="submit" className={styles.send} disabled={busy || !input.trim()} aria-label="Send message"><Send size={18} /></button>
          </form>
          <small className={styles.disclaimer}>Ripple can help explain and practice. Check important details against your course material.</small>
          <Dialog.Close className={styles.close} aria-label="Close"><X size={18} /></Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
