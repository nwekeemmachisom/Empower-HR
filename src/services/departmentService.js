import { apiRequest } from "./api";

export async function getDepartments(token) {
  return apiRequest("/api/departments", {
    token,
  });
}

export async function createDepartment(token, name) {
  return apiRequest("/api/departments", {
    method: "POST",
    token,
    body: { name },
  });
}

export async function updateDepartment(token, id, name) {
  return apiRequest(`/api/departments/${id}`, {
    method: "PUT",
    token,
    body: { name },
  });
}

export async function deleteDepartment(token, id) {
  return apiRequest(`/api/departments/${id}`, {
    method: "DELETE",
    token,
  });
}
