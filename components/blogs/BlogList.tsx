"use client";

import { useMemo, useState } from "react";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Search } from "lucide-react";
import { BlogCard } from "@/components/blogs/BlogCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { AnimatedCTAButton } from "@/components/ui/AnimatedCTAButton";
import { BLOG_POSTS, BLOG_CATEGORIES } from "@/lib/mock-data/blogs";
import { getBlogs } from "@/lib/services/api";
import type { BlogPost } from "@/lib/types";
import { formatDate, cn } from "@/lib/utils";

export function BlogList() {
  const [category, setCategory] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<BlogPost[]>(BLOG_POSTS);

  useEffect(() => {
    let mounted = true;
    getBlogs()
      .then((response) => {
        if (!mounted || !response.data.length) return;
        setPosts(response.data);
      })
      .catch(() => {
        // Keep mock fallback if API is unavailable.
      });
    return () => {
      mounted = false;
    };
  }, []);

  const featured = useMemo(
    () => posts.find((p) => p.featured) ?? posts[0],
    [posts]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      if (post.id === featured.id) return false;
      const matchesCategory = category === "All" || post.category === category;
      const matchesQuery =
        q === "" ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [category, query, featured.id, posts]);

  const categories = useMemo(() => {
    const fromPosts = Array.from(new Set(posts.map((post) => post.category))).filter(Boolean);
    return ["All", ...(fromPosts.length ? fromPosts : BLOG_CATEGORIES.filter((cat) => cat !== "All"))];
  }, [posts]);

  if (!featured) {
    return null;
  }

  return (
    <>
      {/* Header */}
      <section className="container-wide pt-16 md:pt-24">
        <SectionHeading
          align="left"
          eyebrow="Journal"
          title="Design ideas & AI insights"
          description="Trends, practical guides, and a peek behind the curtain of AI-assisted interior design — curated by the Auralis studio."
          className="mx-0"
        />
      </section>

      {/* Featured */}
      <section className="container-wide mt-12 md:mt-16">
        <Reveal>
          <Link
            href={`/blogs/${featured.slug}`}
            className="group grid overflow-hidden rounded-3xl border border-sand-200 bg-white/80 shadow-soft focus-ring md:grid-cols-2"
          >
            <div className="relative aspect-[16/10] overflow-hidden md:aspect-auto md:h-full">
              <Image
                src={featured.coverImage}
                alt={featured.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              <span className="absolute left-4 top-4 rounded-full bg-ink-950/80 px-3 py-1 text-xs font-medium text-sand-50 backdrop-blur">
                {featured.category}
              </span>
            </div>
            <div className="flex flex-col justify-center p-8 md:p-12">
              <span className="eyebrow mb-4">Featured</span>
              <h3 className="text-2xl font-semibold leading-tight text-ink-900 sm:text-3xl">
                {featured.title}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-ink-500">
                {featured.excerpt}
              </p>
              <p className="mt-6 text-xs text-ink-400">
                {featured.author} · {formatDate(featured.date)} ·{" "}
                {featured.readTime}
              </p>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-gold-dark transition-colors group-hover:text-ink-900">
                Read article
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </Link>
        </Reveal>
      </section>

      {/* Filters */}
      <section className="container-wide mt-16 md:mt-20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const active = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  aria-pressed={active}
                  className={cn(
                    "focus-ring rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "border-ink-900 bg-ink-900 text-sand-50"
                      : "border-sand-200 bg-white text-ink-600 hover:border-ink-900/40 hover:text-ink-900"
                  )}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <label className="relative w-full lg:w-72">
            <span className="sr-only">Search articles</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles"
              className="h-11 w-full rounded-full border border-sand-200 bg-white pl-10 pr-4 text-sm text-ink-800 focus-ring placeholder:text-ink-400"
            />
          </label>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post, i) => (
              <BlogCard key={post.id} post={post} index={i} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16 rounded-3xl border border-dashed border-sand-300 bg-white/60 py-20 text-center"
          >
            <p className="text-base text-ink-500">
              No articles match your search.
            </p>
          </motion.div>
        )}
      </section>

      {/* Closing CTA */}
      <section className="container-wide py-20 md:py-28">
        <Reveal className="relative overflow-hidden rounded-4xl bg-ink-950 px-6 py-16 text-center text-sand-50 md:px-16 md:py-20">
          <div className="pointer-events-none absolute inset-0 bg-luxury-radial opacity-80" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold/25 blur-3xl" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-semibold text-sand-50 sm:text-4xl md:text-5xl">
              Stop reading, start designing
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-sand-100/75">
              Turn inspiration into a real plan. Your first set of personalized
              concepts is completely free — no card required.
            </p>
            <div className="mt-9 flex justify-center">
              <AnimatedCTAButton label="Try Us — It's Free" />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
