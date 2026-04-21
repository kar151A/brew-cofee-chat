import { isFirebaseReady, signInUser, signUpUser } from "./firebase-service.js";

const SESSION_KEY = "brewCoffeeSession";

function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch (error) {
    console.error("Unable to read current session", error);
    return null;
  }
}

function showFeedback(node, message, isError = true) {
  if (!node) {
    return;
  }

  node.textContent = message;
  node.classList.toggle("is-error", isError);
  node.classList.toggle("is-success", !isError);
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function redirectIfSignedIn() {
  if (getSession()) {
    window.location.href = "./home.html";
  }
}

const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");

if (isFirebaseReady()) {
  redirectIfSignedIn();
}

if (signupForm) {
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const feedback = document.getElementById("signupFeedback");
    const fullName = document.getElementById("signupName").value.trim();
    const email = normalizeEmail(document.getElementById("signupEmail").value);
    const password = document.getElementById("signupPassword").value;
    const city = document.getElementById("signupCity").value.trim();
    const intention = document.getElementById("signupIntention").value.trim();

    if (!isFirebaseReady()) {
      showFeedback(feedback, "Add your Firebase project config in firebase-config.js first.");
      return;
    }

    try {
      const newUser = await signUpUser({
        fullName,
        email,
        password,
        city,
        intention
      });

      saveSession(newUser);
      showFeedback(feedback, "Profile created. Taking you into Brew now.", false);
      window.setTimeout(() => {
        window.location.href = "./home.html";
      }, 400);
    } catch (error) {
      console.error("Unable to create account", error);
      showFeedback(feedback, error.message || "We couldn't save your account right now.");
    }
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const feedback = document.getElementById("loginFeedback");
    const email = normalizeEmail(document.getElementById("loginEmail").value);
    const password = document.getElementById("loginPassword").value;

    if (!isFirebaseReady()) {
      showFeedback(feedback, "Add your Firebase project config in firebase-config.js first.");
      return;
    }

    try {
      const user = await signInUser({ email, password });
      saveSession(user);
      showFeedback(feedback, "Login successful. Opening your Brew home.", false);
      window.setTimeout(() => {
        window.location.href = "./home.html";
      }, 300);
    } catch (error) {
      console.error("Unable to log in", error);
      showFeedback(feedback, error.message || "We couldn't log you in right now.");
    }
  });
}
