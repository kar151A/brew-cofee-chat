# Brew Coffee Chat

Brew Coffee Chat is a lightweight web app for meeting thoughtful strangers for one good coffee chat.

The app includes:
- a signup page for new users
- a login page for returning users
- a calm sage-green home page
- a coffee chat planner
- per-user saved chat history stored in Firebase Firestore

## Pages

- `signup.html` - create a local account
- `login.html` - sign in with an existing account
- `home.html` - main app experience and saved history
- `index.html` - redirects based on whether a session exists

## Tech

- HTML
- CSS
- Vanilla JavaScript
- IndexedDB for local data storage
- localStorage for session handling

## Architecture

The app uses a simple static front-end architecture with browser-based persistence.

### Core modules

- `index.html`
  Redirect entry point. Sends the user to `home.html` if a session exists, otherwise to `login.html`.
- `signup.html`
  Collects new user information and creates a local account.
- `login.html`
  Authenticates an existing local user.
- `home.html`
  Main application screen for planning coffee chats and viewing saved history.
- `auth.js`
  Handles signup, login, session creation, and redirect behavior.
- `firebase-config.js`
  Holds the Firebase web app configuration for the project.
- `firebase-service.js`
  Wraps Firebase Auth and Firestore reads and writes.
- `home.js`
  Loads the logged-in user, renders the planner, saves chat previews, and displays user-specific history.
- `styles.css`
  Shared UI styling for auth screens and the main app.

### Data model

The app stores two main record types in Cloud Firestore:

- `users`
  Stores account information such as name, email, city, and intention.
- `history`
  Stores generated coffee chat previews linked to a specific user by `userId`.

The current signed-in user is tracked separately in `localStorage` under a session key.

### Request and state flow

```mermaid
flowchart TD
    A["index.html"] --> B{"Session in localStorage?"}
    B -- "Yes" --> C["home.html"]
    B -- "No" --> D["login.html"]
    D --> E["auth.js login flow"]
    E --> F["firebase-service.js reads Firebase Auth and Firestore"]
    F --> C
    G["signup.html"] --> H["auth.js signup flow"]
    H --> I["firebase-service.js writes user profile to Firestore"]
    I --> C
    C --> J["home.js planner flow"]
    J --> K["firebase-service.js writes history entry"]
    K --> L["Render saved history for current user"]
```

### Authentication approach

- Signup creates a Firebase Auth user and a Firestore user profile.
- Login validates the email and password with Firebase Auth.
- A successful login stores the current user session in `localStorage`.
- Logout clears the session and returns the user to the login page.

### History behavior

- Each generated coffee chat preview is saved as a history item.
- History entries are filtered by the logged-in user's `id`.
- On page load, `home.js` fetches and renders only that user's records.

## Run locally

You can open the app directly in a browser, but using a small local server is recommended.

## just click on this link = https://brew-cofee.netlify.app/

## Project structure

```txt
auth.js
db.js
home.html
home.js
index.html
login.html
signup.html
styles.css
```

## Firebase setup

1. Create a Firebase project and a web app.
2. Paste the Firebase config into `firebase-config.js`.
3. Enable `Authentication -> Sign-in method -> Email/Password`.
4. Create a Cloud Firestore database.
5. Paste the rules from `firestore.rules` into Firestore Rules and publish them.
6. Create a composite Firestore index for:
   `history: userId Ascending, createdAt Descending`

## Notes

- This version uses Firebase Auth for real login and signup.
- User profile data and chat history are stored in Firestore.
- Session state is still mirrored locally so the app can redirect between pages.
