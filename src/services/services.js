import { apiFetch } from "./api";

// Public: List all services for a tenant (by subdomain or tenantId)
export function getPublicServices({ subdomain, tenantId }) {
  return apiFetch("/services/public", { params: { subdomain, tenantId } });
}

// Admin: List all services for current tenant
export function getServices(token) {
  return apiFetch("/services", { token });
}

// Admin: Create a new service
export function createService(token, data) {
  return apiFetch("/services", { method: "POST", token, body: data });
}

// Admin: Update a service
export function updateService(token, id, data) {
  return apiFetch(`/services/${id}`, { method: "PUT", token, body: data });
}

// Admin: Delete a service
export function deleteService(token, id) {
  return apiFetch(`/services/${id}`, { method: "DELETE", token });
}
