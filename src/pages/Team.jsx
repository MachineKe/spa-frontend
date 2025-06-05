import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";

export default function Team() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/pagecontent/team")
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
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-center">Meet the Team</h1>
          <div className="max-w-xl w-full bg-black/80 rounded-lg shadow-lg p-6 mb-8 flex flex-col items-center">
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="James Mwangi"
              className="w-24 h-24 rounded-full mb-4 border-2 border-gold object-cover"
            />
            <div className="font-sans text-lg font-bold">James Mwangi</div>
            <div className="font-sans text-gold/80 text-sm mb-2">Lead Barber</div>
            <div className="font-sans text-gold/70 text-sm text-center">
              With 15+ years of experience, James is a master of classic and modern cuts.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
