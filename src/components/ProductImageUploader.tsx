import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, Trash2, GripVertical, Star } from "lucide-react";
import { cropImageToSquare, blobToBase64 } from "../lib/imageUtils";
import { squareImageUrl } from "../lib/productImage";
import { uploadProductImage } from "../lib/uploadImage";
import { NbProgressBar } from "./NbProgressBar";

export type ImageUploadItem = {
  id: string;
  preview: string;
  url?: string;
  status: "cropping" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
  isPrimary?: boolean;
};

type ProductImageUploaderProps = {
  token: string;
  images: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
};

function newId() {
  return crypto.randomUUID();
}

export function ProductImageUploader({ token, images, onChange, disabled }: ProductImageUploaderProps) {
  const [items, setItems] = useState<ImageUploadItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const blobUrls = useRef<Set<string>>(new Set());

  useEffect(() => {
    setItems(
      images.map((url, i) => ({
        id: newId(),
        preview: url,
        url,
        status: "done" as const,
        progress: 100,
        isPrimary: i === 0,
      })),
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps — only hydrate on mount

  const syncUrls = useCallback(
    (next: ImageUploadItem[]) => {
      const urls = next.filter((i) => i.status === "done" && i.url).map((i) => i.url!);
      onChange(urls);
    },
    [onChange],
  );

  const updateItem = (id: string, patch: Partial<ImageUploadItem>) => {
    setItems((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...patch } : item));
      syncUrls(next);
      return next;
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const removed = prev.find((i) => i.id === id);
      if (removed?.preview.startsWith("blob:")) {
        URL.revokeObjectURL(removed.preview);
        blobUrls.current.delete(removed.preview);
      }
      const next = prev.filter((i) => i.id !== id).map((item, idx) => ({ ...item, isPrimary: idx === 0 }));
      syncUrls(next);
      return next;
    });
  };

  const setPrimary = (id: string) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx <= 0) return prev;
      const reordered = [...prev];
      const [picked] = reordered.splice(idx, 1);
      reordered.unshift({ ...picked, isPrimary: true });
      const next = reordered.map((item, i) => ({ ...item, isPrimary: i === 0 }));
      syncUrls(next);
      return next;
    });
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    const id = newId();
    setItems((prev) => [
      ...prev,
      { id, preview: "", status: "cropping", progress: 5, isPrimary: prev.length === 0 },
    ]);

    try {
      updateItem(id, { progress: 15 });
      const { blob } = await cropImageToSquare(file);
      const blobPreview = URL.createObjectURL(blob);
      blobUrls.current.add(blobPreview);

      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, preview: blobPreview, status: "uploading" as const, progress: 20 }
            : item,
        ),
      );

      const base64 = await blobToBase64(blob);
      const url = await uploadProductImage(token, base64, (pct) => {
        updateItem(id, { progress: 20 + Math.round(pct * 0.8) });
      });

      setItems((prev) => {
        const next = prev.map((item) =>
          item.id === id
            ? { ...item, preview: url, url, status: "done" as const, progress: 100 }
            : item,
        );
        syncUrls(next);
        return next;
      });

      URL.revokeObjectURL(blobPreview);
      blobUrls.current.delete(blobPreview);
    } catch (err) {
      updateItem(id, {
        status: "error",
        progress: 0,
        error: err instanceof Error ? err.message : "Upload failed",
      });
    }
  };

  const handleFiles = (files: FileList | File[]) => {
    Array.from(files).forEach((file) => processFile(file));
  };

  useEffect(() => {
    return () => {
      blobUrls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const uploading = items.some((i) => i.status === "cropping" || i.status === "uploading");

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <label className="text-[10px] font-extrabold uppercase tracking-widest">Product Images</label>
        <span className="font-mono text-[10px] uppercase opacity-60">
          {items.filter((i) => i.status === "done").length} uploaded · square crop auto
        </span>
      </div>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!disabled) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`
          nb-upload-zone cursor-pointer
          ${dragOver ? "nb-upload-zone-active" : ""}
          ${disabled ? "opacity-50 pointer-events-none" : ""}
        `}
      >
        <ImagePlus size={28} className="mx-auto mb-2 opacity-70" />
        <p className="font-extrabold text-xs uppercase tracking-wide">Drop images or click to browse</p>
        <p className="font-mono text-[10px] uppercase mt-1 opacity-60">
          Square images only · center-cropped to 1:1
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {uploading && (
        <div className="nb-card p-3 bg-cyan/30 space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-wider">Uploading...</p>
          {items
            .filter((i) => i.status === "cropping" || i.status === "uploading")
            .map((item) => (
              <NbProgressBar
                key={item.id}
                value={item.progress}
                label={item.status === "cropping" ? "Cropping..." : "Uploading..."}
                accent="cyan"
              />
            ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 min-w-0">
          {items.map((item) => (
            <div
              key={item.id}
              className={`nb-card overflow-hidden min-w-0 ${item.isPrimary ? "ring-2 ring-pink ring-offset-2 ring-offset-paper" : ""}`}
            >
              <div className="relative aspect-square bg-yellow/40 border-b-[3px] border-ink">
                {item.preview ? (
                  <img
                    src={item.preview.startsWith("blob:") ? item.preview : squareImageUrl(item.preview, 400)}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center font-mono text-[10px] uppercase opacity-50">
                    Processing
                  </div>
                )}

                {item.isPrimary && item.status === "done" && (
                  <span className="absolute top-2 left-2 nb-tag bg-pink text-[9px] py-0.5 px-2 flex items-center gap-1">
                    <Star size={10} fill="currentColor" /> Cover
                  </span>
                )}

                {item.status !== "uploading" && item.status !== "cropping" && (
                  <div className="absolute top-2 right-2 flex gap-1">
                    {!item.isPrimary && item.status === "done" && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPrimary(item.id);
                        }}
                        className="nb-btn nb-btn-sm p-1.5 bg-yellow"
                        title="Set as cover"
                      >
                        <Star size={12} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(item.id);
                      }}
                      className="nb-btn nb-btn-sm p-1.5 bg-yellow hover:bg-pink/30"
                      title="Remove"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>

              <div className="p-2 min-h-[2.5rem]">
                {item.status === "error" && (
                  <p className="font-mono text-[10px] text-orange uppercase">{item.error}</p>
                )}
                {(item.status === "cropping" || item.status === "uploading") && (
                  <NbProgressBar value={item.progress} accent="lime" />
                )}
                {item.status === "done" && (
                  <p className="font-mono text-[10px] uppercase opacity-50 truncate flex items-center gap-1">
                    <GripVertical size={10} /> Ready
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
