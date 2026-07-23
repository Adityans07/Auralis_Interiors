import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="container-wide flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-gold-light">
        <Compass className="h-8 w-8" aria-hidden />
      </span>
      <p className="mt-8 font-serif text-6xl font-semibold text-foreground">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-foreground">
        This space hasn&apos;t been designed yet
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
        Let&apos;s get you back to something beautiful.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button href="/" className="justify-center">
          Back to Home
        </Button>
        <Button href="/try-us" variant="outline" className="justify-center">
          Try the Design Studio
        </Button>
      </div>
    </div>
  );
}
