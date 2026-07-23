"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { BlogPost } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function BlogCard({ post, index = 0 }: { post: BlogPost; index?: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="glass-dark group flex h-full flex-col overflow-hidden rounded-[2rem] p-6 transition-colors hover:bg-white/10"
    >
      <Link href={`/blogs/${post.slug}`} className="relative block aspect-[16/10] overflow-hidden rounded-2xl">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105 grayscale hover:grayscale-0"
        />
        <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/50 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-white backdrop-blur">
          {post.category}
        </span>
      </Link>
      <div className="flex flex-1 flex-col pt-6">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/80">
          {formatDate(post.date)} · {post.readTime}
        </p>
        <h3 className="mt-3 font-serif text-2xl font-light leading-snug text-foreground">
          <Link href={`/blogs/${post.slug}`} className="focus-ring rounded">
            {post.title}
          </Link>
        </h3>
        <p className="mt-3 flex-1 text-sm font-light leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
        <Link
          href={`/blogs/${post.slug}`}
          className="mt-6 inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-widest text-gold transition-colors hover:text-gold-light"
        >
          Read article
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </motion.article>
  );
}
