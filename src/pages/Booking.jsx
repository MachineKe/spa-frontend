import { useState, useEffect } from "react";
import { getPublicEmployees } from "../services/employee";

export default function Booking() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    date: "",
    time: "",
    staff: "",
    notes: "",
  });
  const [employees, setEmployees] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Fetch available employees for staff selection
    getPublicEmployees({}).then((res) => {
      setEmployees(res.employees || res.members || []);
    });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Placeholder: send booking data to backend or third-party API
    // await apiFetch("/bookings", { method: "POST", body: form });
    setTimeout(() => {
      alert("Booking submitted! (Demo only)");
      setSubmitting(false);
    }, 1000);
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-black text-gold px-4 py-12">
      <h1 className="text-4xl md:text-5xl font-serif font-bold mb-8 text-center">Book an Appointment</h1>
      <form
        className="w-full max-w-lg bg-black/80 rounded-lg shadow-lg p-6 flex flex-col gap-4"
        onSubmit={handleSubmit}
      >
        <input
          className="bg-black border border-gold rounded px-3 py-2 text-gold placeholder-gold/60 font-sans"
          type="text"
          name="name"
          placeholder="Your Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          className="bg-black border border-gold rounded px-3 py-2 text-gold placeholder-gold/60 font-sans"
          type="email"
          name="email"
          placeholder="Your Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <div className="flex gap-2">
          <input
            className="bg-black border border-gold rounded px-3 py-2 text-gold placeholder-gold/60 font-sans w-1/2"
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />
          <input
            className="bg-black border border-gold rounded px-3 py-2 text-gold placeholder-gold/60 font-sans w-1/2"
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
            required
          />
        </div>
        <select
          className="bg-black border border-gold rounded px-3 py-2 text-gold font-sans"
          name="staff"
          value={form.staff}
          onChange={handleChange}
        >
          <option value="">Select Staff (optional)</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name} ({emp.role})
            </option>
          ))}
        </select>
        <textarea
          className="bg-black border border-gold rounded px-3 py-2 text-gold placeholder-gold/60 font-sans"
          name="notes"
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={handleChange}
          rows={3}
        />
        <button
          type="submit"
          className="bg-gold text-black font-bold py-2 px-4 rounded hover:bg-yellow-400 transition-colors"
          disabled={submitting}
        >
          {submitting ? "Booking..." : "Book Now"}
        </button>
      </form>
    </div>
  );
}
