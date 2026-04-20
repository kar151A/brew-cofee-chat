# Brew Coffee Chat

Brew Coffee Chat is a lightweight web app for meeting thoughtful strangers for one good coffee chat.

The app includes:
- a signup page for new users
- a login page for returning users
- a calm sage-green home page
- a coffee chat planner
- per-user saved chat history stored locally in the browser with IndexedDB

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

## Run locally

You can open the app directly in a browser, but using a small local server is recommended.

### Option 1: Python

```bash
python -m http.server 5500
```

Then open:

```txt
http://localhost:5500
```

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

## Notes

- User accounts are stored locally in the current browser.
- Coffee chat history is tied to the saved local user account.
- This version does not require Firebase or any external backend.
