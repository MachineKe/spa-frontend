import React, { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../services/api";

export default function SendNotification() {
  const [form, setForm] = useState({
    to: "",
    subject: "",
    html: "",
  });
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      await apiFetch("/notify/email", {
        method: "POST",
        token,
        body: form,
      });
      setMessage("Email sent successfully!");
    } catch (err) {
      setMessage("Failed to send email.");
    }
    setSending(false);
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">Send Test Notification</h1>
        <form className="max-w-lg bg-black/80 border border-gold rounded-lg p-8 shadow-lg flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            className="bg-black border border-gold rounded px-3 py-2 text-gold placeholder-gold/60 font-sans"
            type="email"
            name="to"
            placeholder="Recipient Email"
            value={form.to}
            onChange={handleChange}
            required
          />
          <input
            className="bg-black border border-gold rounded px-3 py-2 text-gold placeholder-gold/60 font-sans"
            type="text"
            name="subject"
            placeholder="Subject"
            value={form.subject}
            onChange={handleChange}
            required
          />
          <textarea
            className="bg-black border border-gold rounded px-3 py-2 text-gold placeholder-gold/60 font-sans"
            name="html"
            placeholder="HTML Content"
            value={form.html}
            onChange={handleChange}
            rows={5}
            required
          />
          <button
            type="submit"
            className="bg-gold text-black font-bold py-2 px-4 rounded hover:bg-yellow-400 transition-colors"
            disabled={sending}
          >
            {sending ? "Sending..." : "Send Email"}
          </button>
          {message && (
            <div className={`mt-2 ${message.includes("success") ? "text-green-500" : "text-red-500"}`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </DashboardLayout>
  );
}
