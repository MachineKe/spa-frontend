import { apiFetch } from "./api";

// Public: List all employees for a tenant (by subdomain or tenantId)
export function getPublicEmployees({ subdomain, tenantId }) {
  return apiFetch("/employees/public", { params: { subdomain, tenantId } });
}

// Admin: List all employees for current tenant
export function getEmployees(token) {
  return apiFetch("/employees", { token });
}

// Admin: Create a new employee
export function createEmployee(token, data) {
  return apiFetch("/employees", { method: "POST", token, body: data });
}

// Admin: Update an employee
export function updateEmployee(token, id, data) {
  return apiFetch(`/employees/${id}`, { method: "PUT", token, body: data });
}

export function deleteEmployee(token, id) {
  return apiFetch(`/employees/${id}`, { method: "DELETE", token });
}

// Get all stores for the current tenant
export function getStores(token) {
  return apiFetch("/stores", { token });
}

// Assign/change an employee's store
export function updateEmployeeStore(token, employeeId, storeId) {
  return apiFetch(`/employees/${employeeId}`, {
    method: "PUT",
    token,
    body: { storeId },
  });
}
