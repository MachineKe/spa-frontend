import { useState } from "react";
import { apiFetch } from "../services/api";

export default function GiftCards() {
  const [form, setForm] = useState({
    recipient: "",
    sender: "",
    amount: "",
    message: "",
    email: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      await apiFetch("/giftcard/public", {
        method: "POST",
        body: {
          recipientEmail: form.email,
          senderName: form.sender,
          amount: form.amount,
          message: form.message,
          tenantId: window.__TENANT_ID__ || 1, // Replace with actual tenant context
        },
      });
      setMessage("Gift card sent! The recipient will receive an email shortly.");
      setForm({
        recipient: "",
        sender: "",
        amount: "",
        message: "",
        email: "",
      });
    } catch {
      setMessage("Failed to send gift card. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-black text-gold px-4 py-12">
      <h1 className="text-4xl md:text-5xl font-serif font-bold mb-8 text-center">Gift Cards & Promotions</h1>
      {/* Promotions Section */}
      <div className="w-full max-w-3xl bg-black/80 rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-serif font-semibold mb-4">Current Offers</h2>
        <ul className="list-disc pl-6 font-sans text-gold/90">
          <li className="mb-2">Buy a Ksh 5,000 gift card, get a free Ksh 500 bonus!</li>
          <li className="mb-2">10% off all Teen Treatments with any gift card purchase.</li>
        </ul>
      </div>
      {/* Gift Card Form */}
      <form
        className="w-full max-w-lg bg-black/80 rounded-lg shadow-lg p-6 flex flex-col gap-4"
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl font-serif font-semibold mb-2">Buy or Send a Gift Card</h2>
        <input
          className="bg-black border border-gold rounded px-3 py-2 text-gold placeholder-gold/60 font-sans"
          type="text"
          name="recipient"
          placeholder="Recipient Name"
          value={form.recipient}
          onChange={handleChange}
          required
        />
        <input
          className="bg-black border border-gold rounded px-3 py-2 text-gold placeholder-gold/60 font-sans"
          type="email"
          name="email"
          placeholder="Recipient Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          className="bg-black border border-gold rounded px-3 py-2 text-gold placeholder-gold/60 font-sans"
          type="text"
          name="sender"
          placeholder="Your Name"
          value={form.sender}
          onChange={handleChange}
          required
        />
        <input
          className="bg-black border border-gold rounded px-3 py-2 text-gold placeholder-gold/60 font-sans"
          type="number"
          name="amount"
          placeholder="Amount (Ksh)"
          value={form.amount}
          onChange={handleChange}
          min="500"
          required
        />
        <textarea
          className="bg-black border border-gold rounded px-3 py-2 text-gold placeholder-gold/60 font-sans"
          name="message"
          placeholder="Personal Message (optional)"
          value={form.message}
          onChange={handleChange}
          rows={3}
        />
        <button
          type="submit"
          className="bg-gold text-black font-bold py-2 px-4 rounded hover:bg-yellow-400 transition-colors"
          disabled={submitting}
        >
          {submitting ? "Sending..." : "Send Gift Card"}
        </button>
        {message && (
          <div className={`mt-2 ${message.includes("fail") ? "text-red-500" : "text-green-500"}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
