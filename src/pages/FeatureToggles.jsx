import React, { useEffect, useState } from "react";
import { apiFetch } from "../services/api";

export default function FeatureToggles() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const fetchTenants = () => {
    setLoading(true);
    apiFetch("/superadmin/tenants", { token })
      .then((res) => {
        setTenants(res.tenants || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load tenants");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTenants();
    // eslint-disable-next-line
  }, []);

  const handleToggle = async (tenantId, feature, value) => {
    setMessage("");
    try {
      // Get current features for this tenant
      const res = await apiFetch(`/superadmin/tenants/${tenantId}/features`, { token });
      const features = { ...res.features, [feature]: value };
      await apiFetch(`/superadmin/tenants/${tenantId}/features`, {
        method: "PUT",
        body: { features },
        token,
      });
      setMessage("Feature updated.");
      fetchTenants();
    } catch {
      setMessage("Failed to update feature.");
    }
  };

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">Feature Toggles</h1>
      <div className="bg-black/80 border border-gold rounded-lg p-8 shadow-lg mb-8">
        {loading ? (
          <div className="text-gold">Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <table className="w-full text-gold/90 font-sans">
            <thead>
              <tr>
                <th className="text-left py-2">Tenant</th>
                <th className="text-left py-2">Gift Cards</th>
                <th className="text-left py-2">Promotions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant.id}>
                  <td className="py-2">{tenant.name}</td>
                  <td className="py-2">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-gold"
                        checked={tenant.features?.giftCards || false}
                        onChange={(e) =>
                          handleToggle(tenant.id, "giftCards", e.target.checked)
                        }
                      />
                      <span className="ml-2">
                        {tenant.features?.giftCards ? "Enabled" : "Disabled"}
                      </span>
                    </label>
                  </td>
                  <td className="py-2">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-gold"
                        checked={tenant.features?.promotions || false}
                        onChange={(e) =>
                          handleToggle(tenant.id, "promotions", e.target.checked)
                        }
                      />
                      <span className="ml-2">
                        {tenant.features?.promotions ? "Enabled" : "Disabled"}
                      </span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {message && (
        <div className={`mt-2 ${message.includes("fail") ? "text-red-500" : "text-green-500"}`}>
          {message}
        </div>
      )}
    </div>
  );
}
