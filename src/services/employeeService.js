import { apiRequest } from "./api";

export async function getEmployees(token) {
  return apiRequest("/api/employees", {
    token,
  });
}

export async function getEmployee(token, id) {
  return apiRequest(`/api/employees/${id}`, {
    token,
  });
}

export async function createEmployee(token, data) {
  return apiRequest("/api/employees", {
    method: "POST",
    token,
    body: data,
  });
}

export async function updateEmployee(token, id, data) {
  return apiRequest(`/api/employees/${id}`, {
    method: "PUT",
    token,
    body: data,
  });
}
