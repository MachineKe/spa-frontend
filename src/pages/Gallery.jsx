import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";

const fallbackImages = [
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1519985176271-adb1088fa94c?auto=format&fit=crop&w=400&q=80"
];

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/pagecontent/gallery")
      .then((res) => {
        // Expecting a JSON array of image URLs in content.content
        let imgs = [];
        try {
          imgs = JSON.parse(res.content?.content || "[]");
        } catch {
          imgs = [];
        }
        setImages(Array.isArray(imgs) && imgs.length > 0 ? imgs : fallbackImages);
        setLoading(false);
      })
      .catch(() => {
        setImages(fallbackImages);
        setLoading(false);
      });
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-black text-gold px-4 py-12">
      <h1 className="text-4xl md:text-5xl font-serif font-bold mb-8 text-center">Gallery</h1>
      {loading ? (
        <div className="text-gold">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {images.map((src, idx) => (
            <div key={idx} className="rounded-lg overflow-hidden border-2 border-gold shadow-lg bg-black">
              <img
                src={src}
                alt={`Gallery ${idx + 1}`}
                className="w-full h-56 object-cover hover:scale-105 transition-transform duration-200"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}