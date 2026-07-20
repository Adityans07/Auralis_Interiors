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
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-sand-200 bg-white/80 shadow-soft"
    >
      <Link href={`/blogs/${post.slug}`} className="relative block aspect-[16/10] overflow-hidden">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-ink-950/80 px-3 py-1 text-xs font-medium text-sand-50 backdrop-blur">
          {post.category}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs text-ink-400">
          {formatDate(post.date)} · {post.readTime}
        </p>
        <h3 className="mt-2 text-lg font-semibold leading-snug text-ink-900">
          <Link href={`/blogs/${post.slug}`} className="focus-ring rounded">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">
          {post.excerpt}
        </p>
        <Link
          href={`/blogs/${post.slug}`}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gold-dark transition-colors hover:text-ink-900"
        >
          Read article
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </motion.article>
  );
}
