import { initializeApp }                                          from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword,
         signInWithEmailAndPassword, signOut,
         onAuthStateChanged, updateProfile }                      from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore, doc, collection, getDocs, writeBatch }    from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const cfg = {
  apiKey:           "AIzaSyAMaJ0aFJhaMF7HEUmDdPKpAGfAt7I4CAE",
  authDomain:       "tahra-app.firebaseapp.com",
  projectId:        "tahra-app",
  storageBucket:    "tahra-app.firebasestorage.app",
  messagingSenderId:"1083200364147",
  appId:            "1:1083200364147:web:2c1dc12633d1ae6d72d406"
};

const app  = initializeApp(cfg);
const auth = getAuth(app);
const db   = getFirestore(app);

const SKEY = 'niddah_v4';
function lcLocal() { try { return JSON.parse(localStorage.getItem(SKEY)||'[]'); } catch { return []; } }
function scLocal(d) { try { localStorage.setItem(SKEY,JSON.stringify(d)); } catch {} }

const AUTH_ERRORS = {
  'auth/invalid-email':        'כתובת אימייל לא תקינה',
  'auth/user-not-found':       'משתמש לא נמצא',
  'auth/wrong-password':       'סיסמה שגויה',
  'auth/invalid-credential':   'אימייל או סיסמה שגויים',
  'auth/email-already-in-use': 'האימייל כבר רשום במערכת',
  'auth/weak-password':        'הסיסמה חייבת להכיל לפחות 6 תווים',
  'auth/too-many-requests':    'יותר מדי ניסיונות – נסי שוב מאוחר יותר',
};

window.__fb = {
  onAuthStateChanged: (cb) => onAuthStateChanged(auth, cb),
  async signIn(email, pass) {
    await signInWithEmailAndPassword(auth, email, pass);
  },
  async register(name, email, pass) {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: name });
    return cred.user;
  },
  async logout() { await signOut(auth); },
  authErrMsg(code) { return AUTH_ERRORS[code] || 'שגיאה – נסי שוב'; },
  async loadCycles(uid) {
    try {
      const snap = await getDocs(collection(db,'users',uid,'cycles'));
      const c = snap.docs.map(d => d.data()).sort((a,b) => new Date(b.date)-new Date(a.date));
      scLocal(c); return c;
    } catch { return lcLocal(); }
  },
  async saveCycles(uid, cycles) {
    scLocal(cycles);
    try {
      const batch = writeBatch(db);
      const snap  = await getDocs(collection(db,'users',uid,'cycles'));
      snap.docs.forEach(d => batch.delete(d.ref));
      cycles.forEach(c => batch.set(doc(db,'users',uid,'cycles',String(c.id)), c));
      await batch.commit();
      return true;
    } catch { return false; }
  },
  lcLocal, scLocal,
};
