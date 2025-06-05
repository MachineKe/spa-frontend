import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder: send contact data to backend or email service
    alert("Message sent! (Demo only)");
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-black text-gold px-4 py-12">
      <h1 className="text-4xl md:text-5xl font-serif font-bold mb-8 text-center">Contact Us</h1>
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8">
        {/* Contact Form */}
        <form
          className="flex-1 bg-black/80 rounded-lg shadow-lg p-6 flex flex-col gap-4"
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
          <textarea
            className="bg-black border border-gold rounded px-3 py-2 text-gold placeholder-gold/60 font-sans"
            name="message"
            placeholder="Your Message"
            value={form.message}
            onChange={handleChange}
            rows={4}
            required
          />
          <button
            type="submit"
            className="bg-gold text-black font-bold py-2 px-4 rounded hover:bg-yellow-400 transition-colors"
          >
            Send Message
          </button>
        </form>
        {/* Contact Info & Map */}
        <div className="flex-1 flex flex-col gap-6 items-center justify-center">
          <div className="bg-black/80 rounded-lg shadow-lg p-6 w-full">
            <h2 className="text-2xl font-serif font-semibold mb-2">Fellas Spa & Barbershop</h2>
            <div className="font-sans text-gold/80 mb-2">
              <span className="block">123 Luxury Ave, Nairobi, Kenya</span>
              <span className="block">Phone: +254 700 000 000</span>
              <span className="block">Email: info@fellasspa.com</span>
            </div>
            <div className="w-full h-48 mt-4 rounded overflow-hidden border-2 border-gold">
              {/* Google Maps Embed Placeholder */}
              <iframe
                title="Fellas Spa & Barbershop Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1994.0000000000002!2d36.821946!3d-1.292066!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10d4c6b0b0b1%3A0x0!2sNairobi!5e0!3m2!1sen!2ske!4v1680000000000!5m2!1sen!2ske"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
