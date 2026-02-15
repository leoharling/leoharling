"use client";

import { useState } from "react";
import Image from "next/image";
import { X, MapPin, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Photo } from "@/lib/supabase";

interface GalleryProps {
  photos: Photo[];
}

export default function Gallery({ photos }: GalleryProps) {
  const [selected, setSelected] = useState<Photo | null>(null);

  if (photos.length === 0) {
    return (
      <div className="py-24 text-center text-muted-foreground">
        <p className="text-lg">No photos yet</p>
        <p className="mt-2 text-sm">
          Photos will appear here once they&apos;re uploaded to the gallery.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Masonry Grid */}
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="mb-4 break-inside-avoid cursor-pointer overflow-hidden rounded-xl border border-white/5 transition-all duration-300 hover:border-accent/30 hover:scale-[1.02]"
            onClick={() => setSelected(photo)}
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={photo.thumbnail_url || photo.url}
                alt={photo.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            <div className="bg-card p-3">
              <p className="text-sm font-medium">{photo.title}</p>
              {photo.location_name && (
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin size={10} />
                  {photo.location_name}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-6 right-6 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <X size={20} />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-h-[85vh] max-w-5xl overflow-hidden rounded-2xl bg-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[16/10] max-h-[65vh]">
                <Image
                  src={selected.url}
                  alt={selected.title}
                  fill
                  className="object-contain"
                  sizes="90vw"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold">{selected.title}</h3>
                {selected.description && (
                  <p className="mt-2 text-muted-foreground">
                    {selected.description}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {selected.location_name && (
                    <span className="flex items-center gap-1">
                      <MapPin size={14} className="text-accent" />
                      {selected.location_name}
                    </span>
                  )}
                  {selected.taken_at && (
                    <span className="flex items-center gap-1">
                      <Calendar size={14} className="text-accent" />
                      {new Date(selected.taken_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  )}
                  <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent capitalize">
                    {selected.category}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
