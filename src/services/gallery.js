import { apiFetch } from "./api";

// Public: List all gallery images for a tenant (by subdomain or tenantId)
export function getPublicGallery({ subdomain, tenantId }) {
  return apiFetch("/gallery/public", { params: { subdomain, tenantId } });
}

// Admin: Upload a new gallery image (multipart/form-data)
export async function uploadGalleryImage(token, file, caption) {
  const formData = new FormData();
  formData.append("image", file);
  if (caption) formData.append("caption", caption);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";
  const res = await fetch(API_BASE_URL + "/gallery", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw { status: res.status, ...error };
  }
  return res.json();
}

// Admin: Delete a gallery image
export function deleteGalleryImage(token, id) {
  return apiFetch(`/gallery/${id}`, { method: "DELETE", token });
}
