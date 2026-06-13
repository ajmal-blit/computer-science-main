document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const loginForm = document.getElementById('loginForm');
  const submitBtn = document.getElementById('submitBtn');
  const errorMessage = document.getElementById('errorMessage');
  const regInput = document.getElementById('regInput');
  const passInput = document.getElementById('passInput');

  const FAIL_KEY = 'cs_login_failures';
  const LOCK_KEY = 'cs_login_locked_until';
  const MAX_FAILS = 5;
  const LOCK_MS = 5 * 60 * 1000;
  const LOGIN_TIMEOUT_MS = 12000;

  let database = null;

  function showError(message) {
    if (!errorMessage) return;
    errorMessage.style.display = 'block';
    errorMessage.textContent = message;
  }

  function resetButton(text) {
    if (submitBtn) {
      submitBtn.innerText = text || 'Authenticate →';
      submitBtn.disabled = false;
    }
    if (passInput) passInput.value = '';
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

  function getDatabase() {
    if (database) return database;
    if (!window.CSAuth || typeof CSAuth.initFirebase !== 'function') {
      throw new Error('Security helper is not loaded.');
    }
    database = CSAuth.initFirebase();
    return database;
  }

  function withTimeout(promise, ms) {
    let timeoutId;
    const timeout = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('Login request timed out. Check Firebase/CSP connection.'));
      }, ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
  }

  if (!loginForm || !submitBtn || !regInput || !passInput) {
    console.error('Login form elements are missing.');
    showError('Login page setup error. Please redeploy the latest files.');
    return;
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (errorMessage) errorMessage.style.display = 'none';

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

    let db;
    try {
      db = getDatabase();
    } catch (error) {
      console.error('Firebase init error:', error);
      showError('Login service failed to load. Please refresh and try again.');
      resetButton(originalText);
      return;
    }

    withTimeout(db.ref('globalStudentDB/' + regNo).once('value'), LOGIN_TIMEOUT_MS)
      .then((snapshot) => {
        const userData = snapshot.val();
        let dbPass = '';
        if (userData !== null) {
          if (typeof userData === 'object') {
            dbPass = String(userData.password || userData.pass || userData.Password || '').trim();
          } else {
            dbPass = String(userData).trim();
          }
        }
        if (userData !== null && dbPass === password) {
          clearFailures();
          submitBtn.innerText = 'Loading .....';
          CSAuth.createSession({
            regNo,
            name: (typeof userData === 'object' ? userData.name : null) || regNo,
            role: (typeof userData === 'object' ? userData.role : null) || (regNo === 'ADMIN' ? 'Admin' : 'Student')
          });
          window.location.href = 'index.html';
        } else {
          recordFailure();
          showError('Invalid Registration Number or Password.');
          resetButton(originalText);
        }
      })
      .catch((error) => {
        console.error('Firebase Login Error:', error);
        if (error.message && error.message.includes('permission_denied')) {
          showError('Database access denied. Check Firebase rules.');
        } else {
          showError('Connection failed. Please refresh and try again.');
        }
        resetButton(originalText);
      });
  });
});
