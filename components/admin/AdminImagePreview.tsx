import Image from "next/image";

export function AdminImagePreview({ src, alt }: { src?: string | null; alt?: string }) {
  if (!src) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-sand-300 bg-sand-50 text-sm text-ink-500">
        No image available
      </div>
    );
  }

  return (
    <div className="relative h-56 overflow-hidden rounded-2xl border border-sand-200">
      <Image src={src} alt={alt ?? "Preview"} fill className="object-cover" />
    </div>
  );
}
