const OPENING_MESSAGE = `Hey there, superstar! 🎹

Before we get into the good stuff — how's your piano practice going? Give me the honest scoop on your goals: what you practiced, what slipped, and how you're feeling about it all.

No judgment here — just truth and teamwork.`;

const messagesEl = document.getElementById("messages");
const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

/** @type {{ role: 'user' | 'assistant', content: string }[]} */
const conversation = [];

let isFirstUserMessage = true;

function appendMessage(text, role) {
  const div = document.createElement("div");
  div.className = `message ${role === "user" ? "user" : "coach"}`;
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return div;
}

function setLoading(on) {
  sendBtn.disabled = on;
  input.disabled = on;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  appendMessage(text, "user");
  input.value = "";
  setLoading(true);

  const typingEl = appendMessage("Thinking up a tip and a story…", "coach");
  typingEl.classList.add("typing");

  conversation.push({ role: "user", content: text });

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: conversation }),
    });

    const data = await res.json();
    typingEl.remove();

    if (!res.ok) {
      appendMessage(data.error || "Something went wrong. Try again in a sec.", "coach");
      conversation.pop();
      return;
    }

    appendMessage(data.reply, "coach");
    conversation.push({ role: "assistant", content: data.reply });
    isFirstUserMessage = false;
  } catch {
    typingEl.remove();
    appendMessage("Couldn't reach the coach server. Is it running?", "coach");
    conversation.pop();
  } finally {
    setLoading(false);
    input.focus();
  }
});

appendMessage(OPENING_MESSAGE, "coach");
input.focus();
