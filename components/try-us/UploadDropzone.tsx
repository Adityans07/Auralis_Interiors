"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { UploadCloud, X, ImageIcon } from "lucide-react";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_MB } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  /** Current local preview URL (object URL), if any. */
  previewUrl?: string;
  fileName?: string;
  onChange: (data: { previewUrl?: string; fileName?: string; file?: File }) => void;
}

/**
 * Image upload with drag & drop, browse, preview and remove.
 * Shows a local preview immediately and passes the raw file to parent state.
 * The parent flow can upload the file to backend storage when needed.
 */
export function UploadDropzone({ previewUrl, fileName, onChange }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File | undefined) => {
      setError(null);
      if (!file) return;

      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setError("Please upload a JPG, PNG or WEBP image.");
        return;
      }
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        setError(`Image must be under ${MAX_IMAGE_SIZE_MB} MB.`);
        return;
      }

      // Revoke a previous object URL to avoid leaks.
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(file);
      onChange({ previewUrl: url, fileName: file.name, file });
    },
    [onChange, previewUrl]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const remove = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    onChange({ previewUrl: undefined, fileName: undefined, file: undefined });
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      {previewUrl ? (
        <div className="relative overflow-hidden rounded-3xl border border-sand-200">
          <div className="relative aspect-video w-full">
            <Image src={previewUrl} alt={fileName ?? "Uploaded space"} fill className="object-cover" unoptimized />
          </div>
          <div className="flex items-center justify-between gap-3 bg-white/80 px-4 py-3">
            <span className="flex items-center gap-2 truncate text-sm text-ink-600">
              <ImageIcon className="h-4 w-4 shrink-0" />
              <span className="truncate">{fileName}</span>
            </span>
            <button
              type="button"
              onClick={remove}
              className="focus-ring inline-flex items-center gap-1 rounded-full bg-ink-900/5 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-900/10"
            >
              <X className="h-3.5 w-3.5" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <motion.button
          type="button"
          whileHover={{ scale: 1.005 }}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "focus-ring flex w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed px-6 py-12 text-center transition-colors",
            dragging
              ? "border-gold bg-gold/5"
              : "border-sand-300 bg-white/50 hover:border-gold/60 hover:bg-white/70"
          )}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-900 text-gold-light">
            <UploadCloud className="h-7 w-7" />
          </span>
          <span className="text-base font-medium text-ink-900">
            Drag & drop a photo of your space
          </span>
          <span className="text-sm text-ink-500">
            or <span className="font-medium text-gold-dark underline">browse files</span> · JPG, PNG, WEBP · up to {MAX_IMAGE_SIZE_MB} MB
          </span>
        </motion.button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="sr-only"
        aria-label="Upload an image of your space"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
