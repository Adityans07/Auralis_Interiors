import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BlogCard } from "@/components/blogs/BlogCard";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { AnimatedCTAButton } from "@/components/ui/AnimatedCTAButton";
import {
  BLOG_POSTS,
  getBlogBySlug,
} from "@/lib/mock-data/blogs";
import type { BlogPost } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface BlogDetailPageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: BlogDetailPageProps): Metadata {
  const post = getBlogBySlug(params.slug);
  if (!post) {
    return { title: "Article Not Found" };
  }
  return {
    title: post.title,
    description: post.excerpt,
  };
}

async function fetchBlogBySlug(slug: string): Promise<BlogPost | null> {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
  try {
    const response = await fetch(`${base}/api/blogs/${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (!response.ok) return null;
    const payload = (await response.json()) as { success: boolean; data?: any };
    if (!payload.success || !payload.data) return null;
    return {
      id: String(payload.data.id),
      slug: String(payload.data.slug),
      title: String(payload.data.title ?? "Untitled"),
      excerpt: String(payload.data.excerpt ?? ""),
      category: String(payload.data.category ?? "General"),
      author: String(payload.data.author ?? payload.data.authorName ?? "Auralis Team"),
      authorRole: "Auralis Design Team",
      date: String(payload.data.date ?? new Date().toISOString()),
      readTime: String(payload.data.readTime ?? "5 min read"),
      coverImage: String(payload.data.coverImage ?? payload.data.coverImageUrl ?? ""),
      content: Array.isArray(payload.data.content) ? payload.data.content.map(String) : [],
      featured: false,
    };
  } catch {
    return null;
  }
}

async function fetchPublicBlogs(): Promise<BlogPost[]> {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
  try {
    const response = await fetch(`${base}/api/blogs`, { cache: "no-store" });
    if (!response.ok) return [];
    const payload = (await response.json()) as { success: boolean; data?: any[] };
    if (!payload.success || !Array.isArray(payload.data)) return [];
    return payload.data.map((item) => ({
      id: String(item.id),
      slug: String(item.slug),
      title: String(item.title ?? "Untitled"),
      excerpt: String(item.excerpt ?? ""),
      category: String(item.category ?? "General"),
      author: String(item.author ?? item.authorName ?? "Auralis Team"),
      authorRole: "Auralis Design Team",
      date: String(item.date ?? new Date().toISOString()),
      readTime: String(item.readTime ?? "5 min read"),
      coverImage: String(item.coverImage ?? item.coverImageUrl ?? ""),
      content: Array.isArray(item.content) ? item.content.map(String) : [],
      featured: Boolean(item.featured),
    }));
  } catch {
    return [];
  }
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const post = (await fetchBlogBySlug(params.slug)) ?? getBlogBySlug(params.slug);
  if (!post) {
    notFound();
  }

  const publicBlogs = await fetchPublicBlogs();
  const relatedSource = publicBlogs.length ? publicBlogs : BLOG_POSTS;
  const related = relatedSource.filter((item) => item.slug !== post.slug).slice(0, 3);
  const authorAvatar = `https://picsum.photos/seed/author-${post.id}/96/96`;

  return (
    <article className="pb-8">
      {/* Header */}
      <header className="container-wide pt-16 md:pt-24">
        <Link
          href="/blogs"
          className="focus-ring inline-flex items-center gap-1.5 rounded text-sm font-medium text-ink-500 transition-colors hover:text-ink-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Journal
        </Link>

        <div className="mt-8 max-w-3xl">
          <span className="inline-flex rounded-full bg-ink-950/80 px-3 py-1 text-xs font-medium text-sand-50">
            {post.category}
          </span>
          <h1 className="mt-5 text-3xl font-semibold leading-tight text-ink-900 sm:text-4xl md:text-5xl">
            {post.title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-ink-500">
            {post.excerpt}
          </p>

          <div className="mt-8 flex items-center gap-4">
            <span className="relative h-11 w-11 overflow-hidden rounded-full border border-sand-200">
              <Image
                src={authorAvatar}
                alt={`${post.author} portrait`}
                fill
                sizes="44px"
                className="object-cover"
              />
            </span>
            <div className="text-sm">
              <p className="font-medium text-ink-900">
                {post.author}
                <span className="font-normal text-ink-400">
                  {" "}
                  · {post.authorRole}
                </span>
              </p>
              <p className="text-ink-400">
                {formatDate(post.date)} · {post.readTime}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Cover */}
      <div className="container-wide mt-10">
        <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-sand-200 shadow-soft">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Body */}
      <div className="container-wide mt-12 md:mt-16">
        <div className="mx-auto max-w-3xl space-y-6 text-base leading-relaxed text-ink-700 sm:text-lg">
          {post.content.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>

      {/* Related reading */}
      {related.length > 0 && (
        <section className="container-wide mt-24">
          <h2 className="text-2xl font-semibold text-ink-900 sm:text-3xl">
            Related reading
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {related.map((rel, i) => (
              <BlogCard key={rel.id} post={rel} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Closing CTA */}
      <section className="container-wide py-20 md:py-28">
        <Reveal className="relative overflow-hidden rounded-4xl bg-ink-950 px-6 py-16 text-center text-sand-50 md:px-16 md:py-20">
          <div className="pointer-events-none absolute inset-0 bg-luxury-radial opacity-80" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold/25 blur-3xl" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-semibold text-sand-50 sm:text-4xl md:text-5xl">
              Ready to see your space reimagined?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-sand-100/75">
              Bring these ideas to life with a design tailored to your room,
              your budget, and your location. Your first generation is free.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <AnimatedCTAButton label="Try Us — It's Free" />
              <Button
                href="/booking"
                variant="outline"
                size="lg"
                className="border-sand-50/30 text-sand-50 hover:border-sand-50/60 hover:bg-white/10"
              >
                Book a consultation
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </article>
  );
}
