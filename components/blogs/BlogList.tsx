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
            className="group grid overflow-hidden rounded-[2rem] glass-dark focus-ring md:grid-cols-2"
          >
            <div className="relative aspect-[16/10] overflow-hidden md:aspect-auto md:h-full">
              <Image
                src={featured.coverImage}
                alt={featured.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105 grayscale hover:grayscale-0"
                priority
              />
              <span className="absolute left-6 top-6 rounded-full border border-white/10 bg-black/50 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-white backdrop-blur">
                {featured.category}
              </span>
            </div>
            <div className="flex flex-col justify-center p-8 md:p-16">
              <span className="eyebrow mb-6">Featured</span>
              <h3 className="font-serif text-3xl font-light leading-tight text-foreground sm:text-5xl">
                {featured.title}
              </h3>
              <p className="mt-6 text-lg font-light leading-relaxed text-muted-foreground">
                {featured.excerpt}
              </p>
              <p className="mt-8 text-[10px] uppercase tracking-widest text-muted-foreground/80">
                {featured.author} · {formatDate(featured.date)} ·{" "}
                {featured.readTime}
              </p>
              <span className="mt-8 inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-widest text-gold transition-colors group-hover:text-gold-light">
                Read article
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </Link>
        </Reveal>
      </section>

      {/* Filters */}
      <section className="container-wide mt-16 md:mt-24">
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
                    "focus-ring rounded-full border px-5 py-2.5 text-[11px] font-medium uppercase tracking-widest transition-colors",
                    active
                      ? "border-white/20 bg-white/10 text-foreground"
                      : "border-white/5 bg-white/5 text-muted-foreground hover:border-white/20 hover:text-foreground"
                  )}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <label className="relative w-full lg:w-80">
            <span className="sr-only">Search articles</span>
            <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles"
              className="h-12 w-full rounded-full border border-white/5 bg-white/5 pl-12 pr-5 text-sm font-light text-foreground focus-ring placeholder:text-muted-foreground/50 focus:border-gold/50 transition-colors"
            />
          </label>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post, i) => (
              <BlogCard key={post.id} post={post} index={i} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16 rounded-[2rem] border border-dashed border-white/10 bg-white/5 py-24 text-center"
          >
            <p className="text-base font-light text-muted-foreground">
              No articles match your search.
            </p>
          </motion.div>
        )}
      </section>

      {/* Closing CTA */}
      <section className="container-wide py-24 md:py-32">
        <Reveal className="glass-dark relative overflow-hidden rounded-[3rem] px-6 py-20 text-center md:px-16 md:py-28">
          <div className="pointer-events-none absolute inset-0 bg-dark-gradient mix-blend-screen opacity-20" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-serif text-4xl font-light text-foreground md:text-6xl">
              Stop reading, start designing
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg font-light text-muted-foreground">
              Turn inspiration into a real plan. Your first set of personalized
              concepts is completely free — no card required.
            </p>
            <div className="mt-10 flex justify-center">
              <AnimatedCTAButton label="Try Us — It's Free" />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
