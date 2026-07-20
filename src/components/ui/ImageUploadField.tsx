"use client";

import { useState } from "react";
import Image from "next/image";
import { FiUpload, FiX } from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";

export default function ImageUploadField({
  name,
  label,
}: {
  name: string;
  label: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setUploading(true);
    setError("");
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `custom-cakes/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("uploads").upload(path, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("uploads").getPublicUrl(path);
      setUrl(data.publicUrl);
    } catch {
      setError("Couldn't upload that image — please try a different file.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="text-xs text-ink/50 mb-1 block px-1">{label}</label>
      <input type="hidden" name={name} value={url ?? ""} />

      {url ? (
        <div className="relative w-32 h-32 rounded-xl overflow-hidden">
          <Image src={url} alt="Inspiration" fill className="object-cover" />
          <button
            type="button"
            onClick={() => setUrl(null)}
            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
            aria-label="Remove image"
          >
            <FiX size={12} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-1.5 w-32 h-32 rounded-xl border-2 border-dashed border-brown/25 text-ink/40 text-xs cursor-pointer hover:border-rose hover:text-rose transition-colors">
          <FiUpload />
          {uploading ? "Uploading..." : "Upload photo"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </label>
      )}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
