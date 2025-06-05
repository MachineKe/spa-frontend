import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";

export default function About() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/pagecontent/about")
      .then((res) => {
        setContent(res.content?.content || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-black text-gold px-4 py-12">
      {loading ? (
        <div className="text-gold">Loading...</div>
      ) : content ? (
        <div
          className="w-full max-w-2xl"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-center">Our Story</h1>
          <p className="max-w-2xl text-lg md:text-xl font-sans text-gold/90 mb-8 text-center">
            Fellas Spa & Barbershop was founded with a vision to redefine luxury grooming and wellness for the modern man. Our mission is to provide a sanctuary where you can relax, rejuvenate, and experience world-class treatments in an elegant, welcoming environment.
          </p>
          <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-4 mt-8 text-center">Mission</h2>
          <p className="max-w-2xl text-base md:text-lg font-sans text-gold/80 mb-8 text-center">
            To deliver exceptional spa and grooming services, blending tradition with innovation, and to foster a community of confidence, style, and well-being.
          </p>
          <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-4 mt-8 text-center">Our Facility</h2>
          <p className="max-w-2xl text-base md:text-lg font-sans text-gold/80 mb-8 text-center">
            Step into our state-of-the-art facility, designed with a black and gold theme, luxurious finishes, and serene spaces. From private treatment rooms to a vibrant barbershop floor, every detail is crafted for your comfort and relaxation.
          </p>
        </>
      )}
    </div>
  );
}
