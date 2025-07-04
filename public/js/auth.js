import { auth } from './firebase-config.js';
import {
  signInWithEmailAndPassword
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

const emailInput = document.getElementById('email');
const pwInput    = document.getElementById('pw');

document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  try {
    await signInWithEmailAndPassword(auth, emailInput.value, pwInput.value);
    location.href = 'dashboard.html';
  } catch (err) {
    alert(err.message);
  }
});
