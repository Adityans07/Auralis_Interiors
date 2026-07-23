"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DESIGN_STYLES } from "@/lib/mock-data/designStyles";

export function StylesShowcase() {
  return (
    <section className="container-wide py-20 md:py-32">
      <SectionHeading
        eyebrow="Aesthetics"
        title="Find the style that speaks to you"
        description="Explore the aesthetics our AI can compose — from serene minimalism to layered luxury."
      />

      <div className="mt-20 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {DESIGN_STYLES.map((style, i) => (
          <motion.div
            key={style.value}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href={`/try-us?style=${style.value}`}
              className="group relative block aspect-[3/4] overflow-hidden rounded-[2rem] focus-ring ring-offset-void border border-white/5"
            >
              <Image
                src={style.image}
                alt={`${style.name} interior style`}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void via-void/20 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-90" />
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                <h3 className="font-serif text-2xl font-light text-foreground">{style.name}</h3>
                <p className="mt-2 max-h-0 overflow-hidden text-sm font-light leading-relaxed text-muted-foreground opacity-0 transition-all duration-500 group-hover:max-h-20 group-hover:opacity-100">
                  {style.blurb}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
