import { apiFetch } from "./api";

// Register a new user
export function register(data) {
  return apiFetch("/auth/register", { method: "POST", body: data });
}

// Login (with optional 2FA)
export function login(data) {
  return apiFetch("/auth/login", { method: "POST", body: data });
}

// Enable 2FA (requires token)
export function enable2FA(token) {
  return apiFetch("/auth/enable-2fa", { method: "POST", token });
}

// Verify 2FA setup (requires token)
export function verify2FA(token, code) {
  return apiFetch("/auth/verify-2fa", { method: "POST", token, body: { token: code } });
}

// Get current user info (requires token)
export function getCurrentUser(token) {
  return apiFetch("/auth/me", { token });
}
