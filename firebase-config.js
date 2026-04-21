export const firebaseConfig = {
  apiKey: "AIzaSyA2R0tCm1g6A44H-zIOyxjbtdHRGD65wmg",
  authDomain: "brew-coffee-b66b0.firebaseapp.com",
  projectId: "brew-coffee-b66b0",
  storageBucket: "brew-coffee-b66b0.firebasestorage.app",
  messagingSenderId: "283800728996",
  appId: "1:283800728996:web:3764bac371a582348abd31"
};

export function isFirebaseConfigured() {
  return Object.values(firebaseConfig).every(
    (value) => typeof value === "string" && value.trim() && !value.startsWith("PASTE_YOUR_")
  );
}
