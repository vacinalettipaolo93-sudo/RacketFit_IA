import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCqGq5VP19uDGbcq13rtEpb83CQlJuZiFw",
  authDomain: "racketfit-ai.firebaseapp.com",
  projectId: "racketfit-ai",
  storageBucket: "racketfit-ai.firebasestorage.app",
  messagingSenderId: "385431019820",
  appId: "1:385431019820:web:7a9731fe748fba19860c89"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);