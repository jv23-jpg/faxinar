export function validateCPF(cpf) {
  if (!cpf) return false;
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return false;
  if (/^(\d)\1+$/.test(clean)) return false;
  const digits = clean.split('').map(d => parseInt(d, 10));
  const validator = (t) => {
    let sum = 0;
    for (let i = 0; i < t; i++) sum += digits[i] * (t + 1 - i);
    const rev = (sum * 10) % 11 % 10;
    return rev === digits[t];
  };
  return validator(9) && validator(10);
}

export function validateEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function formatPhone(phone) {
  if (!phone) return '';
  const nums = phone.replace(/\D/g, '');
  if (nums.length === 11) return `(${nums.slice(0,2)}) ${nums.slice(2,7)}-${nums.slice(7)}`;
  if (nums.length === 10) return `(${nums.slice(0,2)}) ${nums.slice(2,6)}-${nums.slice(6)}`;
  return phone;
}

const STORAGE_KEY = 'leidy.signup.v1';
const VERSIONS_KEY = 'leidy.signup.v1.versions';
export function saveProgress(data) {
  try {
    // Save previous as version
    const previous = loadProgress();
    if (previous) {
      try {
        const versions = JSON.parse(localStorage.getItem(VERSIONS_KEY) || '[]');
        versions.unshift({ id: Date.now().toString(36), at: new Date().toISOString(), data: previous });
        // keep only last 20 versions
        localStorage.setItem(VERSIONS_KEY, JSON.stringify(versions.slice(0, 20)));
      } catch (e) {}
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {}
}

export function loadProgress() { try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : null; } catch(e){ return null; } }

export function clearProgress() { try { localStorage.removeItem(STORAGE_KEY); } catch(e){} }

export function listProgressVersions() { try { return JSON.parse(localStorage.getItem(VERSIONS_KEY) || '[]'); } catch(e){ return []; } }

export function getProgressVersion(id) { try { const versions = JSON.parse(localStorage.getItem(VERSIONS_KEY) || '[]'); return versions.find(v => v.id === id) || null; } catch(e){ return null; } }

export function restoreProgressVersion(id) { try { const v = getProgressVersion(id); if (!v) return false; const current = loadProgress(); if (current) {
    const versions = JSON.parse(localStorage.getItem(VERSIONS_KEY) || '[]');
    versions.unshift({ id: Date.now().toString(36), at: new Date().toISOString(), data: current });
    localStorage.setItem(VERSIONS_KEY, JSON.stringify(versions.slice(0, 20)));
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(v.data));
  return true; } catch(e){ return false; } }

// --- Re-entry / resume helpers ---
const RESUME_STORE = 'leidy.resume.tokens';
export function createResumeToken(progress, ttlMinutes = 24 * 60) {
  try {
    const token = Math.random().toString(36).slice(2, 10);
    const expires = Date.now() + ttlMinutes * 60 * 1000;
    const store = JSON.parse(localStorage.getItem(RESUME_STORE) || '{}');
    store[token] = { progress, expires };
    localStorage.setItem(RESUME_STORE, JSON.stringify(store));
    return token;
  } catch (e) { return null; }
}

export function getProgressByToken(token) {
  try {
    const store = JSON.parse(localStorage.getItem(RESUME_STORE) || '{}');
    const entry = store[token];
    if (!entry) return null;
    if (entry.expires && Date.now() > entry.expires) {
      delete store[token];
      localStorage.setItem(RESUME_STORE, JSON.stringify(store));
      return null;
    }
    return entry.progress || null;
  } catch (e) { return null; }
}

export function removeResumeToken(token) {
  try {
    const store = JSON.parse(localStorage.getItem(RESUME_STORE) || '{}');
    if (store[token]) { delete store[token]; localStorage.setItem(RESUME_STORE, JSON.stringify(store)); }
  } catch (e) {}
}

export function generateResumeLink(token) {
  try { return `${window.location.origin}${window.location.pathname}?resume=${token}`; } catch(e){ return '' }
}

export function sendResumeEmail(email, link) {
  try {
    if (!email || !link) return false;
    const subject = encodeURIComponent('Retomar cadastro — Leidy Cleaner');
    const body = encodeURIComponent(`Olá,%0D%0A%0D%0AVocê pode retomar seu cadastro usando o link abaixo:%0D%0A${link}%0D%0A%0D%0AAtenciosamente,%0D%0ALeidy Cleaner`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    return true;
  } catch (e) { return false; }
}

