import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
  getFirestore, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

const firebaseConfig = {
    apiKey: "AIzaSyD77VYYRNIMXBtWfx8li2gWeHs10ZqQiqA",
  authDomain: "reservation-98317.firebaseapp.com",
  projectId: "reservation-98317",
  storageBucket: "reservation-98317.firebasestorage.app",
  messagingSenderId: "1018405254929",
  appId: "1:1018405254929:web:4718abd17e989cb0df7eb0",
  measurementId: "G-TNB3P7C7SQ"
};

export const app  = initializeApp(firebaseConfig);
export const db   = getFirestore(app);
export const auth = getAuth(app);
export const ts   = serverTimestamp;
