import {
  getUserHistory,
  isFirebaseReady,
  logOutUser,
  saveHistoryEntry
} from "./firebase-service.js";

const SESSION_KEY = "brewCoffeeSession";

const prompts = [
  "What changed your mind about something important in the last year?",
  "What kind of person do you become when you feel most like yourself?",
  "What would make this season of your life feel more honest?",
  "Which conversation are you secretly hoping to have more often?"
];

const matchArchetypes = {
  reflective: {
    title: "A calm, deep-diving coffee chat",
    partner: "You're likely to meet someone observant, emotionally articulate, and unhurried.",
    prompt: "What idea have you outgrown lately, and what replaced it?"
  },
  playful: {
    title: "A bright, easy but surprising conversation",
    partner: "Expect someone witty, open, and curious enough to follow weird ideas somewhere interesting.",
    prompt: "What tiny thing makes you feel ridiculously alive?"
  },
  ambitious: {
    title: "A future-facing coffee chat",
    partner: "You might meet a builder, a dreamer, or someone in the middle of a brave pivot.",
    prompt: "What are you building in private before you're ready to explain it?"
  },
  honest: {
    title: "A gentle, real conversation",
    partner: "This match will probably value sincerity over polish and connection over performance.",
    prompt: "What truth has been quietly waiting for your attention?"
  }
};

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch (error) {
    console.error("Unable to read current session", error);
    return null;
  }
}

function formatHistoryDate(isoDate) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(isoDate));
}

const user = readSession();

if (!user) {
  window.location.href = "./login.html";
} else {
  const promptNode = document.getElementById("rotatingPrompt");
  const resultCard = document.getElementById("resultCard");
  const resultTitle = document.getElementById("resultTitle");
  const resultSummary = document.getElementById("resultSummary");
  const resultMeta = document.getElementById("resultMeta");
  const form = document.getElementById("plannerForm");
  const plannerNameInput = document.getElementById("name");
  const brandTag = document.getElementById("brandTag");
  const userPill = document.getElementById("userPill");
  const logoutButton = document.getElementById("logoutButton");
  const welcomeTitle = document.getElementById("welcomeTitle");
  const welcomeCopy = document.getElementById("welcomeCopy");
  const historyList = document.getElementById("historyList");
  const historyEmpty = document.getElementById("historyEmpty");

  function renderHistory(entries) {
    historyList.innerHTML = "";

    if (!entries.length) {
      historyEmpty.classList.remove("is-hidden");
      return;
    }

    historyEmpty.classList.add("is-hidden");

    entries.forEach((entry) => {
      const item = document.createElement("article");
      item.className = "history-item";
      item.innerHTML = `
        <div class="history-item-top">
          <div>
            <p class="mini-label">Saved chat</p>
            <h3>${entry.title}</h3>
          </div>
          <span class="history-time">${formatHistoryDate(entry.createdAt)}</span>
        </div>
        <p>${entry.summary}</p>
        <div class="result-meta">
          <span>${entry.mood}</span>
          <span>${entry.setting}</span>
          <span>${entry.city}</span>
        </div>
      `;
      historyList.appendChild(item);
    });
  }

  async function loadHistory() {
    if (!isFirebaseReady()) {
      historyEmpty.classList.remove("is-hidden");
      historyEmpty.textContent = "Add your Firebase project config in firebase-config.js first.";
      return;
    }

    try {
      const entries = await getUserHistory(user.uid);
      renderHistory(entries);
    } catch (error) {
      console.error("Unable to load history", error);
      historyEmpty.classList.remove("is-hidden");
      historyEmpty.textContent =
        error.message || "We couldn't load your saved coffee chat history right now.";
    }
  }

  plannerNameInput.value = user.fullName || "";
  brandTag.textContent = `Ready for your next thoughtful coffee chat, ${user.fullName}`;
  userPill.textContent = user.city ? `${user.fullName} from ${user.city}` : user.fullName;
  welcomeTitle.textContent = `Welcome back, ${user.fullName}.`;
  welcomeCopy.textContent = user.intention
    ? `Today's Brew mood starts with what matters to you: ${user.intention}`
    : "Your next meaningful coffee conversation is ready to be shaped.";

  let promptIndex = 0;

  window.setInterval(() => {
    promptIndex = (promptIndex + 1) % prompts.length;
    promptNode.textContent = prompts[promptIndex];
  }, 4000);

  logoutButton.addEventListener("click", async () => {
    localStorage.removeItem(SESSION_KEY);

    if (isFirebaseReady()) {
      try {
        await logOutUser();
      } catch (error) {
        console.error("Unable to log out from Firebase", error);
      }
    }

    window.location.href = "./login.html";
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim() || user.fullName || "You";
    const mood = document.getElementById("mood").value;
    const setting = document.getElementById("setting").value;
    const intention =
      document.getElementById("intention").value.trim() ||
      user.intention ||
      "a conversation that feels grounding, awake, and unexpectedly memorable";

    const archetype = matchArchetypes[mood];
    const title = `${name}, ${archetype.title}`;
    const summary = `${archetype.partner} In a ${setting}, Brew would frame this conversation around ${intention.toLowerCase()}. Start with: "${archetype.prompt}"`;
    const city = user.city || "Thoughtful city vibes";

    resultTitle.textContent = title;
    resultSummary.textContent = summary;
    resultMeta.innerHTML = `
      <span>${mood}</span>
      <span>${setting}</span>
      <span>${city}</span>
    `;

    resultCard.classList.remove("is-active");
    void resultCard.offsetWidth;
    resultCard.classList.add("is-active");
    resultCard.scrollIntoView({ behavior: "smooth", block: "nearest" });

    if (!isFirebaseReady()) {
      historyEmpty.classList.remove("is-hidden");
      historyEmpty.textContent = "Add your Firebase project config in firebase-config.js first.";
      return;
    }

    try {
      await saveHistoryEntry({
        userId: user.uid,
        title,
        summary,
        mood,
        setting,
        city
      });
      await loadHistory();
    } catch (error) {
      console.error("Unable to save history", error);
    }
  });

  loadHistory();
}
