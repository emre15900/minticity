const API_BASE_URL = "https://jsonplaceholder.typicode.com/users";

const defaultHeaders = {
  "Content-Type": "application/json; charset=UTF-8",
};

async function handleResponse(response, fallbackMessage) {
  if (!response.ok) {
    const message =
      fallbackMessage ||
      `Beklenmeyen bir hata oluştu (${response.status} ${response.statusText})`;
    throw new Error(message);
  }
  return response.json();
}

export async function fetchUsers() {
  const response = await fetch(API_BASE_URL, { cache: "no-store" });
  return handleResponse(response, "Kullanıcı listesi alınamadı");
}

export async function fetchUserById(id) {
  const response = await fetch(`${API_BASE_URL}/${id}`, { cache: "no-store" });
  return handleResponse(response, "Kullanıcı detayı alınamadı");
}

export async function createUser(payload) {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  });
  return handleResponse(response, "Kullanıcı oluşturulamadı");
}

export async function updateUser(id, payload) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  });
  return handleResponse(response, "Kullanıcı güncellenemedi");
}

export async function deleteUser(id) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });
  await handleResponse(response, "Kullanıcı silinemedi");
  return true;
}

