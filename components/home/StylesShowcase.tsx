"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DESIGN_STYLES } from "@/lib/mock-data/designStyles";

export function StylesShowcase() {
  return (
    <section className="container-wide py-20 md:py-28">
      <SectionHeading
        eyebrow="Design styles"
        title="Find the aesthetic that feels like home"
        description="Explore the styles our AI can compose — from serene minimalism to layered luxury."
      />

      <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {DESIGN_STYLES.map((style, i) => (
          <motion.div
            key={style.value}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
          >
            <Link
              href={`/try-us?style=${style.value}`}
              className="group relative block aspect-[3/4] overflow-hidden rounded-3xl focus-ring"
            >
              <Image
                src={style.image}
                alt={`${style.name} interior style`}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="text-lg font-semibold text-sand-50">{style.name}</h3>
                <p className="mt-1 max-h-0 overflow-hidden text-xs text-sand-100/80 opacity-0 transition-all duration-300 group-hover:max-h-12 group-hover:opacity-100">
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
