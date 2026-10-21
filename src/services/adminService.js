import { apiRequest } from "./api";

export async function getAdmins(token) {
  return apiRequest("/api/users/admins", {
    token,
  });
}

export async function createAdmin(token, data) {
  return apiRequest("/api/users/admins", {
    method: "POST",
    token,
    body: data,
  });
}

export async function deleteAdmin(token, id) {
  return apiRequest(`/api/users/admins/${id}`, {
    method: "DELETE",
    token,
  });
}
