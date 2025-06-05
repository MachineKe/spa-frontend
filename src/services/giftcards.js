import { apiFetch } from "./api";

// Public: List all available gift cards/promotions for a tenant (by subdomain or tenantId)
export function getPublicGiftCards({ subdomain, tenantId }) {
  return apiFetch("/giftcards/public", { params: { subdomain, tenantId } });
}

// Public: Purchase/send a gift card
export function purchaseGiftCard(data) {
  return apiFetch("/giftcards/public", { method: "POST", body: data });
}

// Admin: List all gift cards for current tenant
export function getGiftCards(token) {
  return apiFetch("/giftcards", { token });
}

// Admin: Mark a gift card as redeemed
export function redeemGiftCard(token, id) {
  return apiFetch(`/giftcards/${id}/redeem`, { method: "PUT", token });
}
