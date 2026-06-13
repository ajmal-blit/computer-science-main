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
  const LOGIN_TIMEOUT_MS = 7000;
  const DEFAULT_LOGIN_TEXT = 'Authenticate →';

  let database = null;

  function showError(message) {
    if (!errorMessage) return;
    errorMessage.style.display = 'block';
    errorMessage.textContent = message;
  }

  function hideError() {
    if (errorMessage) errorMessage.style.display = 'none';
  }

  function resetButton(text) {
    if (submitBtn) {
      submitBtn.innerText = text || DEFAULT_LOGIN_TEXT;
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
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Login request timed out. Using local fallback if available.'));
      }, ms);

      Promise.resolve(promise).then(
        (value) => {
          clearTimeout(timeoutId);
          resolve(value);
        },
        (error) => {
          clearTimeout(timeoutId);
          reject(error);
        }
      );
    });
  }

  function getRedirectTarget() {
    const params = new URLSearchParams(window.location.search);
    const next = params.get('next');
    if (next && /^[a-z0-9\-_/]+\.html(?:[?#].*)?$/i.test(next) && !next.includes('login.html')) {
      return next;
    }
    return 'dashboard.html';
  }

  function loginSuccess(regNo, userData) {
    clearFailures();
    submitBtn.innerText = 'Loading...';
    CSAuth.createSession({
      regNo,
      name: userData.name || regNo,
      role: userData.role || 'Student'
    });
    window.location.href = getRedirectTarget();
  }

  function tryLocalFallback(regNo, password) {
    if (!window.CSLocalData || typeof CSLocalData.verifyFallbackLogin !== 'function') return null;
    return CSLocalData.verifyFallbackLogin(regNo, password);
  }

  function verifyWithFirebase(regNo) {
    try {
      const db = getDatabase();
      return withTimeout(db.ref('globalStudentDB/' + regNo).once('value'), LOGIN_TIMEOUT_MS)
        .then((snapshot) => snapshot && typeof snapshot.val === 'function' ? snapshot.val() : null);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  if (!loginForm || !submitBtn || !regInput || !passInput || !window.CSAuth) {
    console.error('Login form or security helper is missing.');
    showError('Login page setup error. Please redeploy the latest files.');
    return;
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    hideError();

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

    const originalText = submitBtn.innerText || DEFAULT_LOGIN_TEXT;
    submitBtn.innerText = 'Authenticating...';
    submitBtn.disabled = true;

    verifyWithFirebase(regNo)
      .then((userData) => {
        if (userData) {
          if (String(userData.password || '') === password) {
            loginSuccess(regNo, userData);
            return;
          }
          recordFailure();
          showError('Invalid Registration Number or Password.');
          resetButton(originalText);
          return;
        }

        const fallbackUser = tryLocalFallback(regNo, password);
        if (fallbackUser) {
          loginSuccess(regNo, fallbackUser);
          return;
        }

        recordFailure();
        showError('Invalid Registration Number or Password.');
        resetButton(originalText);
      })
      .catch((error) => {
        console.warn('Firebase login unavailable:', error);
        const fallbackUser = tryLocalFallback(regNo, password);
        if (fallbackUser) {
          loginSuccess(regNo, fallbackUser);
          return;
        }

        recordFailure();
        showError('Login connection failed. Try again, or use Reg No as passcode if fallback mode is enabled.');
        resetButton(originalText);
      });
  });
});
