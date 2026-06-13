document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const database = CSAuth.initFirebase();
  const loginForm = document.getElementById('loginForm');
  const submitBtn = document.getElementById('submitBtn');
  const errorMessage = document.getElementById('errorMessage');
  const regInput = document.getElementById('regInput');
  const passInput = document.getElementById('passInput');

  const FAIL_KEY = 'cs_login_failures';
  const LOCK_KEY = 'cs_login_locked_until';
  const MAX_FAILS = 5;
  const LOCK_MS = 5 * 60 * 1000;

  function showError(message) {
    errorMessage.style.display = 'block';
    errorMessage.textContent = message;
  }

  function resetButton(text) {
    submitBtn.innerText = text;
    submitBtn.disabled = false;
    passInput.value = '';
  }

  function isLocked() {
    const lockedUntil = Number(sessionStorage.getItem(LOCK_KEY) || '0');
    return lockedUntil && lockedUntil > Date.now();
  }

  function recordFailure() {
    const fails = Number(sessionStorage.getItem(FAIL_KEY) || '0') + 1;
    sessionStorage.setItem(FAIL_KEY, String(fails));
    if (fails >= MAX_FAILS) {
      sessionStorage.setItem(LOCK_KEY, String(Date.now() + LOCK_MS));
      sessionStorage.setItem(FAIL_KEY, '0');
    }
  }

  function clearFailures() {
    sessionStorage.removeItem(FAIL_KEY);
    sessionStorage.removeItem(LOCK_KEY);
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    errorMessage.style.display = 'none';

    if (isLocked()) {
      showError('Too many failed attempts. Please wait a few minutes and try again.');
      return;
    }

    const regNo = CSAuth.normalizeRegNo(regInput.value);
    const password = String(passInput.value || '').trim();

    if (!CSAuth.isValidRegNo(regNo) || password.length < 3 || password.length > 64) {
      recordFailure();
      showError('Invalid Registration Number or Password.');
      return;
    }

    const originalText = submitBtn.innerText;
    submitBtn.innerText = 'Authenticating...';
    submitBtn.disabled = true;

    database.ref('globalStudentDB/' + regNo).once('value').then((snapshot) => {
      const userData = snapshot.val();
      if (userData && String(userData.password || '') === password) {
        clearFailures();
        submitBtn.innerText = 'Loading .....';
        CSAuth.createSession({
          regNo,
          name: userData.name || regNo,
          role: userData.role || (regNo === 'ADMIN' ? 'Admin' : 'Student')
        });
        setTimeout(() => { window.location.href = 'index.html'; }, 500);
      } else {
        recordFailure();
        showError('Invalid Registration Number or Password.');
        resetButton(originalText);
      }
    }).catch((error) => {
      console.error('Firebase Login Error:', error);
      showError('Connection failed. Please try again.');
      resetButton(originalText);
    });
  });
});
