import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <span className="text-[11px] uppercase tracking-[0.3em] text-amber-700 font-semibold mb-2">
        404 • Silhouette Not Located
      </span>
      <h1 className="font-serif text-3xl sm:text-5xl font-light text-stone-900 mb-4">
        Page Not Found
      </h1>
      <p className="text-xs sm:text-sm text-stone-600 max-w-md font-sans leading-relaxed mb-8">
        The archive page or silhouette you are looking for has been retired or moved to a different department.
      </p>
      <Link href="/">
        <Button variant="primary" size="md" className="text-xs uppercase tracking-wider flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Atelier</span>
        </Button>
      </Link>
    </div>
  );
}
