import Image from "next/image";
import { Star } from "lucide-react";
import type { Testimonial } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <figure className="glass-dark flex h-full flex-col rounded-[2rem] p-8 transition-colors hover:bg-white/10">
      <div className="flex gap-1" aria-label={`${t.rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-4 w-4",
              i < t.rating ? "fill-gold text-gold" : "text-white/20"
            )}
            aria-hidden
          />
        ))}
      </div>
      <blockquote className="mt-6 flex-1 text-sm font-light leading-relaxed text-muted-foreground">
        &ldquo;{t.quote}&rdquo;
      </blockquote>
      <figcaption className="mt-8 flex items-center gap-4 border-t border-white/10 pt-6">
        <Image
          src={t.avatar}
          alt={t.name}
          width={44}
          height={44}
          className="h-11 w-11 rounded-full object-cover grayscale transition-all duration-300 hover:grayscale-0"
        />
        <div>
          <p className="text-sm font-medium text-foreground">{t.name}</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
            {t.role} · {t.location}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}
