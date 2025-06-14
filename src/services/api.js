const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export function getMyPurchases(token) {
  return apiFetch("/api/sales/my", { token });
}

export function getMyServiceRequests(token) {
  return apiFetch("/api/servicerequests/my", { token });
}

export function createServiceRequest(token, data) {
  return apiFetch("/api/servicerequests", { method: "POST", token, body: data });
}

export function getEmployeeRegisterInfo(token) {
  return apiFetch("/auth/employee-register-info", { params: { token } });
}

export async function apiFetch(endpoint, { method = "GET", body, token, params } = {}) {
  let url = API_BASE_URL + endpoint;
  if (params) {
    const query = new URLSearchParams(params).toString();
    url += "?" + query;
  }
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body && typeof body !== "string" ? JSON.stringify(body) : body,
    credentials: "include",
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw { status: res.status, ...error };
  }
  return res.json();
}
