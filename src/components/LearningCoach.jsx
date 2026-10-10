import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useAIAssistant } from "../context/AIAssistantContext";
import { memberApi } from "../lib/memberApi";
import CoachDialog from "./CoachDialog";

export default function LearningCoach({ context, lessonPath, lessonTitle }) {
  const { user } = useAuth();
  const { isOpen, setIsOpen } = useAIAssistant();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setMessages([]);
    setInput("");
    setError("");
  }, [user?.id]);
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
    <CoachDialog
      open={isOpen} onOpenChange={setIsOpen}
      messages={messages} input={input} onInputChange={setInput}
      onSend={send} busy={busy} maxLength={4000}
      error={error ? `${error} Your message is ready to resend.` : ""}
      lessonPath={lessonPath} lessonTitle={lessonTitle}
      suggestions={["Explain my next lesson", "Give me a practice question", "Help me apply this to my goal"]}
    />
  );
}
