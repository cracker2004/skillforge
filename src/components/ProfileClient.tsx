"use client";

import { useState } from "react";

interface Props {
  user: { name: string; bio: string; email: string };
}

export default function ProfileClient({ user }: Props) {
  const [form, setForm] = useState({ name: user.name, bio: user.bio });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch("/api/users/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError("Failed to update profile");
    }
  };

  return (
    <div className="card p-6">
      <h2 className="font-semibold text-stone-900 mb-5">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="px-4 py-3 rounded-lg text-sm text-red-700 bg-red-50 border border-red-200">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Full Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            minLength={2}
            maxLength={50}
            className="w-full px-4 py-2.5 text-sm input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-400 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={3}
            maxLength={500}
            placeholder="Tell us about yourself..."
            className="w-full px-4 py-2.5 text-sm input-field resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className={`px-6 py-2.5 rounded-xl font-medium text-white text-sm transition-all ${
            saved ? "bg-green-600 hover:bg-green-700" : "btn-primary"
          }`}
        >
          {saving ? "Saving..." : saved ? "Saved! ✓" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
