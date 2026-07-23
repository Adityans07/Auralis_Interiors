import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && <span className="eyebrow mb-6">{eyebrow}</span>}
      <h2 className="text-4xl font-light leading-[1.1] tracking-tight sm:text-5xl md:text-[3.5rem] text-foreground">
        {title}
      </h2>
      {description && (
        <p className="mt-6 text-lg font-light leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </Reveal>
  );
}
