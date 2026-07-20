import type { BlogPost } from "../types";

export const BLOG_CATEGORIES = [
  "All",
  "AI & Design",
  "Trends",
  "Budgeting",
  "How-To",
  "Exterior",
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "b-1",
    slug: "how-ai-is-reshaping-interior-design",
    title: "How AI Is Reshaping Interior Design in 2026",
    excerpt:
      "From instant concept generation to location-aware product matching, here's how artificial intelligence is changing the way we design our homes.",
    category: "AI & Design",
    author: "Elena Vasquez",
    authorRole: "Head of Design",
    date: "2026-06-28",
    readTime: "6 min read",
    coverImage: "https://picsum.photos/seed/blog-ai/1200/700",
    featured: true,
    content: [
      "For decades, great interior design lived behind a velvet rope — accessible mostly to those with the time, budget, and connections to hire a studio. Artificial intelligence is quietly dismantling that barrier.",
      "At Auralis, our AI begins with your actual space. Upload a photo or describe your room, and the system reads proportion, light, and existing conditions before proposing anything. It's not generic inspiration; it's grounded in your four walls.",
      "The real breakthrough is context. Modern design AI doesn't just generate pretty images — it reasons about your budget, your location, and what's genuinely available near you. A beautiful concept you can't actually buy is just a daydream.",
      "But technology alone isn't the whole story. The most satisfying results still come from pairing machine speed with human taste. Our designers review every proposal before you finalize, adding the nuance that only experience brings.",
      "The future of design isn't AI versus designers. It's both — working together to make thoughtful, personal spaces available to everyone.",
    ],
  },
  {
    id: "b-2",
    slug: "designing-a-living-room-on-any-budget",
    title: "Designing a Living Room on Any Budget",
    excerpt:
      "A room can feel luxurious at almost any price point. Here's how to prioritize spend for maximum impact.",
    category: "Budgeting",
    author: "Marcus Bell",
    authorRole: "Senior Designer",
    date: "2026-06-14",
    readTime: "5 min read",
    coverImage: "https://picsum.photos/seed/blog-budget/1200/700",
    content: [
      "The secret to a room that feels expensive isn't spending more — it's spending deliberately. Every budget has a hierarchy, and knowing it changes everything.",
      "Start with the anchor. In most living rooms that's the sofa: it's the largest object and the one you touch most. Invest here first, even if it means waiting on the accessories.",
      "Lighting is the highest-leverage, lowest-cost upgrade you can make. Swapping a single harsh ceiling fixture for layered warm sources transforms a space for a fraction of the cost of new furniture.",
      "Finally, leave room to breathe. A few well-chosen pieces with space around them always read as more considered than a room crammed with bargains.",
    ],
  },
  {
    id: "b-3",
    slug: "japandi-the-calm-aesthetic-taking-over",
    title: "Japandi: The Calm Aesthetic Taking Over",
    excerpt:
      "Where Japanese minimalism meets Scandinavian warmth — a look at why Japandi resonates so deeply right now.",
    category: "Trends",
    author: "Yuki Tanaka",
    authorRole: "Style Curator",
    date: "2026-05-30",
    readTime: "4 min read",
    coverImage: "https://picsum.photos/seed/blog-japandi/1200/700",
    content: [
      "Japandi is the rare trend that feels less like a fad and more like a homecoming. It marries the restraint of Japanese wabi-sabi with the cozy functionality of Scandinavian design.",
      "The palette is quiet: warm neutrals, muted earth tones, and the occasional deep accent. Materials do the talking — natural wood, linen, stoneware, and paper.",
      "What makes Japandi enduring is its philosophy. It prizes craftsmanship over quantity and calm over clutter, which is exactly what many of us crave in an over-stimulating world.",
    ],
  },
  {
    id: "b-4",
    slug: "exterior-makeovers-that-boost-curb-appeal",
    title: "5 Exterior Makeovers That Boost Curb Appeal",
    excerpt:
      "Your home's exterior is its first impression. These five moves deliver the biggest visual return.",
    category: "Exterior",
    author: "Daniel Osei",
    authorRole: "Landscape Lead",
    date: "2026-05-18",
    readTime: "5 min read",
    coverImage: "https://picsum.photos/seed/blog-exterior/1200/700",
    content: [
      "Curb appeal isn't vanity — it sets the tone for everything inside and can meaningfully affect a home's value. The good news: a few focused changes go a long way.",
      "First, paint. A fresh, considered exterior color is the single most transformative and cost-effective exterior upgrade available.",
      "Second, lighting. Warm pathway and facade lighting extends your home's presence into the evening and adds a sense of safety and welcome.",
      "Third, greenery. Structured planting — repeated forms, generous planters, a defined path — reads as intentional and cared-for.",
      "Layer in comfortable outdoor seating and refreshed hardware, and you have a facade that feels brand new.",
    ],
  },
  {
    id: "b-5",
    slug: "from-photo-to-proposal-the-auralis-flow",
    title: "From Photo to Proposal: How the Auralis Flow Works",
    excerpt:
      "A behind-the-scenes walkthrough of what happens between uploading your space and receiving your designs.",
    category: "How-To",
    author: "Elena Vasquez",
    authorRole: "Head of Design",
    date: "2026-05-02",
    readTime: "4 min read",
    coverImage: "https://picsum.photos/seed/blog-flow/1200/700",
    content: [
      "People often ask what actually happens after they hit 'Generate My Designs.' Here's the honest walkthrough.",
      "It starts with your inputs: your photo or description, the items you want, your style, budget, and location. These become the brief.",
      "Our system analyzes the space, then searches products that fit your budget and are available near you. Only then does it compose three to five complete design concepts.",
      "You review the proposals, toggle products in and out, and watch the total update live. When you select one, a human designer steps in to finalize the details with you.",
    ],
  },
  {
    id: "b-6",
    slug: "small-spaces-big-ideas",
    title: "Small Spaces, Big Ideas",
    excerpt:
      "Compact rooms have their own kind of magic. Here's how to make every square foot work harder.",
    category: "How-To",
    author: "Sofia Marchetti",
    authorRole: "Space Planner",
    date: "2026-04-20",
    readTime: "5 min read",
    coverImage: "https://picsum.photos/seed/blog-small/1200/700",
    content: [
      "Small spaces reward discipline. When square footage is limited, every decision carries more weight — and that constraint often produces the most characterful rooms.",
      "Choose fewer, better pieces and let them multitask. A bench that stores, a table that extends, a mirror that doubles the light.",
      "Verticality is your friend. Draw the eye upward with tall shelving and floor-to-ceiling drapery to make ceilings feel higher.",
      "And don't fear a little boldness — a saturated accent wall or an oversized artwork can make a small room feel confident rather than cramped.",
    ],
  },
];

export function getBlogBySlug(slug: string) {
  return BLOG_POSTS.find((b) => b.slug === slug);
}

export function getRelatedPosts(slug: string, limit = 3) {
  const current = getBlogBySlug(slug);
  if (!current) return BLOG_POSTS.slice(0, limit);
  return BLOG_POSTS.filter(
    (b) => b.slug !== slug && b.category === current.category
  )
    .concat(BLOG_POSTS.filter((b) => b.slug !== slug && b.category !== current.category))
    .slice(0, limit);
}
