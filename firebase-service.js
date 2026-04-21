import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

let app;
let auth;
let db;

function ensureFirebase() {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured yet. Add your project config in firebase-config.js.");
  }

  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
}

export function isFirebaseReady() {
  return isFirebaseConfigured();
}

export async function signUpUser({ fullName, email, password, city, intention }) {
  ensureFirebase();

  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const { user } = credential;

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    fullName,
    email: email.toLowerCase(),
    city,
    intention,
    createdAt: serverTimestamp()
  });

  return {
    uid: user.uid,
    email: user.email,
    fullName,
    city,
    intention
  };
}

export async function signInUser({ email, password }) {
  ensureFirebase();

  const credential = await signInWithEmailAndPassword(auth, email, password);
  const { user } = credential;
  let profile = await getUserProfile(user.uid);

  if (!profile) {
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      fullName: user.email?.split("@")[0] || "Brew Member",
      email: user.email?.toLowerCase() || email.toLowerCase(),
      city: "",
      intention: "",
      createdAt: serverTimestamp()
    });
    profile = await getUserProfile(user.uid);
  }

  return {
    uid: user.uid,
    email: user.email,
    fullName: profile?.fullName || user.email,
    city: profile?.city || "",
    intention: profile?.intention || ""
  };
}

export async function getUserProfile(uid) {
  ensureFirebase();

  const snapshot = await getDoc(doc(db, "users", uid));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function saveHistoryEntry({ userId, title, summary, mood, setting, city }) {
  ensureFirebase();

  await addDoc(collection(db, "history"), {
    userId,
    title,
    summary,
    mood,
    setting,
    city,
    createdAt: serverTimestamp()
  });
}

export async function getUserHistory(userId) {
  ensureFirebase();

  const historyQuery = query(
    collection(db, "history"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(historyQuery);
  return snapshot.docs.map((entry) => {
    const data = entry.data();
    return {
      id: entry.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString()
    };
  });
}

export async function logOutUser() {
  ensureFirebase();
  await signOut(auth);
}
