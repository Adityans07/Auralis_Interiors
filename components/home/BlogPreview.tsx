import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BlogCard } from "@/components/blogs/BlogCard";
import { Button } from "@/components/ui/Button";
import { BLOG_POSTS } from "@/lib/mock-data/blogs";

export function BlogPreview() {
  const posts = BLOG_POSTS.slice(0, 3);
  return (
    <section className="container-wide py-20 md:py-28">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <SectionHeading
          align="left"
          eyebrow="From the journal"
          title="Ideas, trends & design intelligence"
          className="mx-0"
        />
        <Button href="/blogs" variant="outline" className="shrink-0">
          View all articles <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {posts.map((post, i) => (
          <BlogCard key={post.id} post={post} index={i} />
        ))}
      </div>
    </section>
  );
}
