import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

const PAGE_OPTIONS = [
  { value: 'home', label: 'Home' },
  { value: 'about', label: 'About' },
  { value: 'services', label: 'Services' },
  { value: 'team', label: 'Team' },
  { value: 'gallery', label: 'Gallery' },
  // Add more as needed
];

export default function CmsEditor() {
  const [selectedPage, setSelectedPage] = useState(PAGE_OPTIONS[0].value);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    apiFetch(`/pagecontent/${selectedPage}`)
      .then((res) => {
        setContent(res.content?.content || '');
        setLoading(false);
      })
      .catch(() => {
        setContent('');
        setLoading(false);
      });
  }, [selectedPage]);

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    try {
      await apiFetch(`/pagecontent/${selectedPage}`, {
        method: 'POST',
        body: { content },
      });
      setMessage('Content saved!');
    } catch (err) {
      setMessage('Failed to save content');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-black border border-gold rounded-lg shadow-lg text-gold">
      <h2 className="text-2xl font-serif mb-4">Edit Public Page Content</h2>
      <label className="block mb-2 font-semibold">Select Page:</label>
      <select
        className="mb-4 p-2 border border-gold rounded w-full bg-black text-gold"
        value={selectedPage}
        onChange={(e) => setSelectedPage(e.target.value)}
      >
        {PAGE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-black text-gold">
            {opt.label}
          </option>
        ))}
      </select>
      <label className="block mb-2 font-semibold">Content (HTML or text):</label>
      <textarea
        className="w-full h-48 p-2 border border-gold rounded mb-4 bg-black text-gold"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={loading}
      />
      <button
        className="bg-gold text-black px-4 py-2 rounded font-bold hover:bg-yellow-400 transition-colors"
        onClick={handleSave}
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Save'}
      </button>
      {message && <div className="mt-2 text-green-500">{message}</div>}
    </div>
  );
}
