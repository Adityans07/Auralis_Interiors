import type { Metadata } from "next";
import { BlogList } from "@/components/blogs/BlogList";

export const metadata: Metadata = {
  title: "Blogs",
  description:
    "Trends, practical guides, and behind-the-scenes insights on AI-assisted interior and exterior design from the Auralis Interiors studio.",
};

export default function BlogsPage() {
  return <BlogList />;
}
