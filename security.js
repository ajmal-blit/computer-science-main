/* CS Department security helpers: session validation, Firebase config, safe text utilities. */
(function () {
  'use strict';

  const SESSION_KEY = 'cs_session_v2';
  const LEGACY_KEYS = ['isLoggedIn', 'loggedUserName', 'loggedUserReg'];
  const MAX_SESSION_AGE_MS = 8 * 60 * 60 * 1000; // 8 hours

  const firebaseConfig = Object.freeze({
    apiKey: 'AIzaSyDz7PWoH4vbObyhYXhXNqi2Cr5uwjBdwJY',
    authDomain: 'cs-database-42dd0.firebaseapp.com',
    databaseURL: 'https://cs-database-42dd0-default-rtdb.asia-southeast1.firebasedatabase.app',
    projectId: 'cs-database-42dd0',
    storageBucket: 'cs-database-42dd0.firebasestorage.app',
    messagingSenderId: '265634068059',
    appId: '1:265634068059:web:4437f49f445c18d574717e'
  });

  function now() { return Date.now(); }
  function normalizeRegNo(value) { return String(value || '').trim().toUpperCase(); }
  function cleanText(value, maxLen = 120) {
    return String(value || '')
      .replace(/[\u0000-\u001f\u007f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, maxLen);
  }
  function isValidRegNo(value) {
    const reg = normalizeRegNo(value);
    return reg === 'ADMIN' || /^GVAZSCS\d{3}$/.test(reg);
  }

  function createSession(user) {
    const regNo = normalizeRegNo(user.regNo);
    const name = cleanText(user.name || 'Student', 80);
    const role = cleanText(user.role || (regNo === 'ADMIN' ? 'Admin' : 'Student'), 30);
    const issuedAt = now();
    const session = { regNo, name, role, issuedAt, expiresAt: issuedAt + MAX_SESSION_AGE_MS };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

    // Legacy keys are kept only for old UI compatibility. Sensitive logic must use CSAuth.getSession().
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('loggedUserName', name);
    localStorage.setItem('loggedUserReg', regNo);
    localStorage.setItem('cs_session_expires', String(session.expiresAt));
    return session;
  }

  function getSession() {
    let raw = sessionStorage.getItem(SESSION_KEY);

    // Controlled migration from older login data. Reject expired or malformed legacy sessions.
    if (!raw && localStorage.getItem('isLoggedIn') === 'true') {
      const expires = Number(localStorage.getItem('cs_session_expires') || '0');
      const legacyReg = normalizeRegNo(localStorage.getItem('loggedUserReg'));
      if (expires > now() && isValidRegNo(legacyReg)) {
        raw = JSON.stringify({
          regNo: legacyReg,
          name: cleanText(localStorage.getItem('loggedUserName') || 'Student', 80),
          role: legacyReg === 'ADMIN' ? 'Admin' : 'Student',
          issuedAt: expires - MAX_SESSION_AGE_MS,
          expiresAt: expires
        });
        sessionStorage.setItem(SESSION_KEY, raw);
      }
    }

    if (!raw) return null;
    try {
      const session = JSON.parse(raw);
      if (!session || !isValidRegNo(session.regNo) || Number(session.expiresAt) <= now()) {
        logout(false);
        return null;
      }
      return session;
    } catch (_err) {
      logout(false);
      return null;
    }
  }

  function logout(redirect = true) {
    sessionStorage.removeItem(SESSION_KEY);
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
    localStorage.removeItem('cs_session_expires');
    if (redirect) window.location.href = 'login.html';
  }

  function requireAuth() {
    const session = getSession();
    if (!session) window.location.replace('login.html');
    return session;
  }

  function initFirebase() {
    if (!window.firebase) throw new Error('Firebase SDK is not loaded.');
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    return firebase.database();
  }

  function setText(el, value) {
    if (el) el.textContent = cleanText(value, 500);
  }

  window.CSAuth = Object.freeze({
    firebaseConfig,
    createSession,
    getSession,
    requireAuth,
    logout,
    initFirebase,
    cleanText,
    normalizeRegNo,
    isValidRegNo,
    setText
  });
}());
