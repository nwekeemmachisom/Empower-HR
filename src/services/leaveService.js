import { apiRequest } from "./api";

export async function getLeaves(token) {
  return apiRequest("/api/leaves", { token });
}

export async function submitLeave(token, data) {
  return apiRequest("/api/leaves", {
    method: "POST",
    token,
    body: data,
  });
}

export async function reviewLeave(token, id, status) {
  return apiRequest(`/api/leaves/${id}/status`, {
    method: "PATCH",
    token,
    body: { status },
  });
}
