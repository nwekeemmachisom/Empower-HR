import { apiRequest } from "./api";

export async function getDocuments(token) {
  return apiRequest("/api/documents", { token });
}

export async function addDocument(token, data) {
  return apiRequest("/api/documents", {
    method: "POST",
    token,
    body: data,
  });
}

export async function deleteDocument(token, id) {
  return apiRequest(`/api/documents/${id}`, {
    method: "DELETE",
    token,
  });
}
