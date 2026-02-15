"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Grid3X3, Map, Camera, Loader2 } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import Gallery from "@/components/photography/Gallery";
import FadeIn from "@/components/ui/FadeIn";
import { supabase, type Photo } from "@/lib/supabase";

const PhotoMap = dynamic(() => import("@/components/photography/PhotoMap"), {
  ssr: false,
});

const CATEGORIES = ["All", "Aerial", "Adventure", "Travel", "Other"];

export default function PhotographyPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "map">("grid");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    async function fetchPhotos() {
      try {
        const { data, error } = await supabase
          .from("photos")
          .select("*")
          .order("taken_at", { ascending: false });

        if (error) throw error;
        setPhotos(data || []);
      } catch (err) {
        console.error("Failed to load photos:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPhotos();
  }, []);

  const filtered =
    category === "All"
      ? photos
      : photos.filter(
          (p) => p.category.toLowerCase() === category.toLowerCase()
        );

  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        title="Photography"
        subtitle="Moments captured from travels, drone flights, and adventures around the world."
      />

      {/* Controls */}
      <FadeIn>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  category === cat
                    ? "bg-accent text-white"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex gap-1 rounded-lg bg-white/5 p-1">
            <button
              onClick={() => setView("grid")}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all ${
                view === "grid"
                  ? "bg-accent text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Grid3X3 size={14} />
              Grid
            </button>
            <button
              onClick={() => setView("map")}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all ${
                view === "map"
                  ? "bg-accent text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Map size={14} />
              Map
            </button>
          </div>
        </div>
      </FadeIn>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={24} className="animate-spin text-accent" />
          <span className="ml-3 text-muted-foreground">
            Loading gallery...
          </span>
        </div>
      ) : photos.length === 0 ? (
        <FadeIn>
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
              <Camera size={28} className="text-accent" />
            </div>
            <h3 className="text-xl font-semibold">Gallery Coming Soon</h3>
            <p className="mt-2 max-w-md text-muted-foreground">
              The photo gallery is being set up. Check back soon for aerial
              drone photography, travel snapshots, and adventure moments from
              around the world.
            </p>
          </div>
        </FadeIn>
      ) : view === "grid" ? (
        <Gallery photos={filtered} />
      ) : (
        <PhotoMap photos={filtered} />
      )}
    </div>
  );
}
