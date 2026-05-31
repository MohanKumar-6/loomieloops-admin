import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { cropImageForHero, blobToBase64 } from "../lib/imageUtils";
import { uploadProductImage } from "../lib/uploadImage";
import { NbProgressBar } from "./NbProgressBar";

type HeroImageFieldProps = {
  token: string;
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
};

export function HeroImageField({ token, value, onChange, disabled }: HeroImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    setError("");
    setProgress(10);
    try {
      const { blob } = await cropImageForHero(file);
      setProgress(30);
      const base64 = await blobToBase64(blob);
      const url = await uploadProductImage(token, base64, setProgress);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-3 min-w-0">
      <label className="block text-xs font-extrabold uppercase">Hero Image</label>
      <p className="font-mono text-[10px] uppercase opacity-60">
        Landscape 4:3 crop for the homepage hero card.
      </p>

      <div className="flex flex-wrap items-start gap-4">
        <div className="relative w-full max-w-xs aspect-[4/3] shrink-0 nb-border bg-yellow/30 overflow-hidden">
          {value ? (
            <img
              src={value}
              alt="Hero preview"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-mono text-[10px] uppercase opacity-40">
              No image
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 min-w-0">
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => inputRef.current?.click()}
            className="nb-btn nb-btn-sm bg-cyan gap-2 w-fit"
          >
            <ImagePlus size={14} />
            {value ? "Replace" : "Upload"}
          </button>
          {value && (
            <button
              type="button"
              disabled={disabled || uploading}
              onClick={() => onChange("")}
              className="nb-btn nb-btn-sm bg-orange/30 gap-2 w-fit"
            >
              <Trash2 size={14} /> Remove
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {uploading && <NbProgressBar value={progress} label="Uploading..." accent="cyan" />}
      {error && <p className="font-mono text-[10px] uppercase text-orange">{error}</p>}
    </div>
  );
}
