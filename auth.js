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

BrewDB.open()
  .then(() => {
    redirectIfSignedIn();
  })
  .catch((error) => {
    console.error("Unable to initialize Brew database", error);
  });

if (signupForm) {
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const feedback = document.getElementById("signupFeedback");
    const fullName = document.getElementById("signupName").value.trim();
    const email = normalizeEmail(document.getElementById("signupEmail").value);
    const password = document.getElementById("signupPassword").value;
    const city = document.getElementById("signupCity").value.trim();
    const intention = document.getElementById("signupIntention").value.trim();

    try {
      const exists = await BrewDB.getUserByEmail(email);

      if (exists) {
        showFeedback(feedback, "That email already has a Brew account.");
        return;
      }

      const newUser = await BrewDB.createUser({
        id: crypto.randomUUID(),
        fullName,
        email,
        password,
        city,
        intention,
        createdAt: new Date().toISOString()
      });

      saveSession(newUser);
      showFeedback(feedback, "Profile created. Taking you into Brew now.", false);

      window.setTimeout(() => {
        window.location.href = "./home.html";
      }, 400);
    } catch (error) {
      console.error("Unable to create account", error);
      showFeedback(feedback, "We couldn't save your account right now. Please try again.");
    }
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const feedback = document.getElementById("loginFeedback");
    const email = normalizeEmail(document.getElementById("loginEmail").value);
    const password = document.getElementById("loginPassword").value;

    try {
      const user = await BrewDB.getUserByCredentials(email, password);

      if (!user) {
        showFeedback(feedback, "We couldn't find an account with that email and password.");
        return;
      }

      saveSession(user);
      showFeedback(feedback, "Login successful. Opening your Brew home.", false);

      window.setTimeout(() => {
        window.location.href = "./home.html";
      }, 300);
    } catch (error) {
      console.error("Unable to log in", error);
      showFeedback(feedback, "We couldn't access the database right now. Please try again.");
    }
  });
}
