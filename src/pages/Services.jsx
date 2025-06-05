import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";

export default function Services() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/pagecontent/services")
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
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-center">Our Services</h1>
          <div className="max-w-xl w-full bg-black/80 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-serif font-semibold mb-4">Spa Treatments</h2>
            <div className="mb-4 p-4 rounded bg-black/60 border border-gold">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div>
                  <div className="font-sans text-lg font-bold">Deep Tissue Massage</div>
                  <div className="font-sans text-gold/80 text-sm mb-2">60 min &middot; Ksh 4,000</div>
                  <div className="font-sans text-gold/70 text-sm">Relieve muscle tension and stress with our signature massage.</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
