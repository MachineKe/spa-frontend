import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { getMyBookings } from "../services/booking";
import { getMyPurchases, getMyServiceRequests, createServiceRequest } from "../services/api";
import { getPublicServices } from "../services/services";

export default function CustomerDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [purchases, setPurchases] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [errorPurchases, setErrorPurchases] = useState("");
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [errorRequests, setErrorRequests] = useState("");
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [serviceId, setServiceId] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Not authenticated");
      setLoading(false);
      setErrorPurchases("Not authenticated");
      setLoadingPurchases(false);
      setErrorRequests("Not authenticated");
      setLoadingRequests(false);
      setLoadingServices(false);
      return;
    }
    getMyBookings(token)
      .then((res) => {
        setBookings(res.bookings || []);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load bookings");
        setLoading(false);
      });

    getMyPurchases(token)
      .then((res) => {
        setPurchases(res.sales || []);
        setLoadingPurchases(false);
      })
      .catch((err) => {
        setErrorPurchases("Failed to load purchases");
        setLoadingPurchases(false);
      });

    getMyServiceRequests(token)
      .then((res) => {
        setServiceRequests(res.requests || []);
        setLoadingRequests(false);
      })
      .catch((err) => {
        setErrorRequests("Failed to load service requests");
        setLoadingRequests(false);
      });

    // Fetch available services (try to get tenantId from user info if available)
    let user = null;
    try {
      user = JSON.parse(atob(token.split(".")[1]));
    } catch {}
    const tenantId = user && user.tenantId ? user.tenantId : undefined;
    getPublicServices({ tenantId })
      .then((res) => {
        setServices(res.services || []);
        setLoadingServices(false);
      })
      .catch(() => {
        setLoadingServices(false);
      });
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-serif font-bold text-gold mb-6">Customer Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-black/80 border border-gold rounded-lg p-6 shadow">
            <h2 className="text-xl font-serif font-semibold text-gold mb-4">My Bookings</h2>
            {loading ? (
              <div className="text-gold">Loading...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : bookings.length === 0 ? (
              <div className="text-white/80">No bookings found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                  <thead>
                    <tr className="bg-gold text-black">
                      <th className="px-3 py-2">Service</th>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Time</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id} className="border-b border-gold/30">
                        <td className="px-3 py-2">{b.serviceId}</td>
                        <td className="px-3 py-2">{b.date ? new Date(b.date).toLocaleDateString() : ""}</td>
                        <td className="px-3 py-2">{b.time}</td>
                        <td className="px-3 py-2">{b.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          <section className="bg-black/80 border border-gold rounded-lg p-6 shadow">
            <h2 className="text-xl font-serif font-semibold text-gold mb-4">My Purchases</h2>
            {loadingPurchases ? (
              <div className="text-gold">Loading...</div>
            ) : errorPurchases ? (
              <div className="text-red-500">{errorPurchases}</div>
            ) : purchases.length === 0 ? (
              <div className="text-white/80">No purchases found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                  <thead>
                    <tr className="bg-gold text-black">
                      <th className="px-3 py-2">Product</th>
                      <th className="px-3 py-2">Quantity</th>
                      <th className="px-3 py-2">Total Price</th>
                      <th className="px-3 py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((p) => (
                      <tr key={p.id} className="border-b border-gold/30">
                        <td className="px-3 py-2">{p.Product?.name || p.productId}</td>
                        <td className="px-3 py-2">{p.quantity}</td>
                        <td className="px-3 py-2">{p.totalPrice != null ? `Ksh ${p.totalPrice}` : ""}</td>
                        <td className="px-3 py-2">{p.soldAt ? new Date(p.soldAt).toLocaleDateString() : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          <section className="bg-black/80 border border-gold rounded-lg p-6 shadow md:col-span-2">
            <h2 className="text-xl font-serif font-semibold text-gold mb-4">Service Requests</h2>
            <div className="mb-4">
              <form
                className="flex flex-col md:flex-row gap-2 items-start md:items-end"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSubmitting(true);
                  setSubmitError("");
                  setSubmitSuccess("");
                  const token = localStorage.getItem("token");
                  try {
                    await createServiceRequest(token, { serviceId, notes });
                    setSubmitSuccess("Service request submitted!");
                    setServiceId("");
                    setNotes("");
                    // Refresh requests
                    getMyServiceRequests(token)
                      .then((res) => setServiceRequests(res.requests || []));
                  } catch (err) {
                    setSubmitError(err?.error || "Failed to submit request");
                  }
                  setSubmitting(false);
                }}
              >
                <div>
                  <label className="block text-gold mb-1">Service</label>
                  <select
                    className="bg-black border border-gold rounded px-2 py-1 text-white"
                    value={serviceId}
                    onChange={e => setServiceId(e.target.value)}
                    required
                    disabled={loadingServices}
                  >
                    <option value="">Select a service</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gold mb-1">Notes</label>
                  <input
                    className="bg-black border border-gold rounded px-2 py-1 text-white w-64"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Additional details (optional)"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-gold text-black font-bold px-4 py-2 rounded hover:bg-yellow-400 transition-colors"
                  disabled={submitting || !serviceId}
                >
                  {submitting ? "Submitting..." : "Request Service"}
                </button>
              </form>
              {submitError && <div className="text-red-500 mt-2">{submitError}</div>}
              {submitSuccess && <div className="text-green-500 mt-2">{submitSuccess}</div>}
            </div>
            {loadingRequests ? (
              <div className="text-gold">Loading...</div>
            ) : errorRequests ? (
              <div className="text-red-500">{errorRequests}</div>
            ) : serviceRequests.length === 0 ? (
              <div className="text-white/80">No service requests found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                  <thead>
                    <tr className="bg-gold text-black">
                      <th className="px-3 py-2">Service</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Notes</th>
                      <th className="px-3 py-2">Requested At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceRequests.map((r) => (
                      <tr key={r.id} className="border-b border-gold/30">
                        <td className="px-3 py-2">{r.Service?.name || r.serviceId}</td>
                        <td className="px-3 py-2">{r.status}</td>
                        <td className="px-3 py-2">{r.notes}</td>
                        <td className="px-3 py-2">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
