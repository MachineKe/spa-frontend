import { apiFetch } from "./api";

// Public: Submit a new booking
export function submitBooking(data) {
  return apiFetch("/bookings/public", { method: "POST", body: data });
}

// Admin/Manager/Staff: List all bookings for current tenant
export function getBookings(token) {
  return apiFetch("/bookings", { token });
}

// Admin/Manager: Update a booking
export function updateBooking(token, id, data) {
  return apiFetch(`/bookings/${id}`, { method: "PUT", token, body: data });
}

// Admin/Manager: Delete a booking
export function deleteBooking(token, id) {
  return apiFetch(`/bookings/${id}`, { method: "DELETE", token });
}

// Customer: List own bookings
export function getMyBookings(token) {
  return apiFetch("/booking/my", { token });
}
