const CUSTOM_USERS_KEY = "minticity:customUsers";
const DELETED_USERS_KEY = "minticity:deletedUsers";

const isBrowser = () => typeof window !== "undefined";

const now = () => Date.now();

function readJSON(key) {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Yerel depolama okunamadı", error);
    return null;
  }
}

function writeJSON(key, value) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Yerel depolama yazılamadı", error);
  }
}

export function getCustomUsers() {
  return readJSON(CUSTOM_USERS_KEY) || [];
}

export function upsertCustomUser(user) {
  const current = getCustomUsers();
  const existing = current.find((item) => Number(item.id) === Number(user.id));
  const normalized = {
    ...existing,
    ...user,
    id: user.id ?? existing?.id ?? now(),
    createdAt: existing?.createdAt || user?.createdAt || now(),
    isLocal: true,
  };
  const filtered = current.filter((item) => Number(item.id) !== Number(normalized.id));
  writeJSON(CUSTOM_USERS_KEY, [...filtered, normalized]);
}

export function removeCustomUser(id) {
  const current = getCustomUsers();
  writeJSON(
    CUSTOM_USERS_KEY,
    current.filter((user) => user.id !== id)
  );
}

export function getDeletedUserIds() {
  return readJSON(DELETED_USERS_KEY) || [];
}

export function addDeletedUserId(id) {
  const current = getDeletedUserIds();
  if (current.includes(id)) return;
  writeJSON(DELETED_USERS_KEY, [...current, id]);
}

export function clearDeletedUserId(id) {
  const current = getDeletedUserIds();
  writeJSON(
    DELETED_USERS_KEY,
    current.filter((item) => item !== id)
  );
}

export function findLocalUserById(id) {
  const numericId = Number(id);
  const customUser = getCustomUsers().find(
    (user) => Number(user.id) === numericId
  );
  return customUser || null;
}

