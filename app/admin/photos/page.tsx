"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Upload,
  Trash2,
  Lock,
  Loader2,
  CheckCircle,
  AlertCircle,
  MapPin,
  ImagePlus,
} from "lucide-react";
import { supabase, type Photo } from "@/lib/supabase";

interface UploadResult {
  success: boolean;
  title: string;
  error?: string;
}

export default function AdminPhotosPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [category, setCategory] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [results, setResults] = useState<UploadResult[] | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchPhotos = useCallback(async () => {
    const { data } = await supabase
      .from("photos")
      .select("*")
      .order("created_at", { ascending: false });
    setPhotos(data || []);
  }, []);

  useEffect(() => {
    if (authenticated) fetchPhotos();
  }, [authenticated, fetchPhotos]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(false);
    const formData = new FormData();
    formData.append("password", password);
    formData.append("title", "__auth_check__");
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (res.status === 401) {
      setAuthError(true);
    } else {
      setAuthenticated(true);
    }
  }

  function addFiles(newFiles: FileList | File[]) {
    const imageFiles = Array.from(newFiles).filter((f) =>
      f.type.startsWith("image/")
    );
    setFiles((prev) => [...prev, ...imageFiles]);
    const newPreviews = imageFiles.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
    setResults(null);
  }

  function removeFile(index: number) {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  function clearAll() {
    previews.forEach((p) => URL.revokeObjectURL(p));
    setFiles([]);
    setPreviews([]);
    setResults(null);
  }

  async function handleUpload() {
    if (!files.length) return;
    setUploading(true);
    setResults(null);
    setProgress(`Uploading ${files.length} photo${files.length > 1 ? "s" : ""}...`);

    const formData = new FormData();
    formData.append("password", password);
    if (category) formData.append("category", category);
    files.forEach((file) => formData.append("files", file));

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      setResults(data.results);
      setProgress(`${data.uploaded}/${data.total} uploaded successfully`);
      clearAll();
      fetchPhotos();
    } catch (err) {
      setProgress(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this photo?")) return;
    setDeleting(id);
    try {
      await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password }),
      });
      fetchPhotos();
    } catch {
      alert("Delete failed");
    } finally {
      setDeleting(null);
    }
  }

  // Login gate
  if (!authenticated) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
            <Lock size={28} className="text-accent" />
          </div>
          <h1 className="text-2xl font-bold">Admin Access</h1>
          <p className="text-sm text-muted-foreground">
            Enter the admin password to manage your photo gallery.
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-foreground placeholder-muted focus:border-accent focus:outline-none"
            autoFocus
          />
          {authError && (
            <p className="flex items-center justify-center gap-2 text-sm text-red-400">
              <AlertCircle size={14} /> Wrong password
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-xl bg-accent px-6 py-3 font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Sign In
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-24">
      <h1 className="mb-2 text-3xl font-bold">Photo Gallery Admin</h1>
      <p className="mb-10 text-muted-foreground">
        Drop your photos below. EXIF metadata (GPS, date) is extracted
        automatically.
      </p>

      {/* Upload Area */}
      <div className="mb-12 rounded-2xl border border-white/10 bg-card p-6">
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.multiple = true;
            input.onchange = (e) => {
              const f = (e.target as HTMLInputElement).files;
              if (f) addFiles(f);
            };
            input.click();
          }}
          className={`flex min-h-[160px] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition-all ${
            dragOver
              ? "border-accent bg-accent/5"
              : "border-white/10 hover:border-accent/50"
          }`}
        >
          <div className="text-center">
            <ImagePlus size={32} className="mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium">
              Drop photos here or click to browse
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Select multiple photos at once &middot; EXIF data extracted automatically
            </p>
          </div>
        </div>

        {/* Previews */}
        {previews.length > 0 && (
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium">
                {files.length} photo{files.length > 1 ? "s" : ""} selected
              </p>
              <button
                onClick={clearAll}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Clear all
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
              {previews.map((src, i) => (
                <div key={i} className="group relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={files[i]?.name}
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                    className="absolute -top-1 -right-1 rounded-full bg-red-500 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category + Upload button */}
        {files.length > 0 && (
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                Category (optional)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-foreground focus:border-accent focus:outline-none"
              >
                <option value="">Auto / Other</option>
                <option value="aerial">Aerial / Drone</option>
                <option value="adventure">Adventure</option>
                <option value="travel">Travel</option>
              </select>
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex items-center justify-center gap-2 rounded-xl bg-accent px-8 py-2.5 font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Upload {files.length} Photo{files.length > 1 ? "s" : ""}
                </>
              )}
            </button>
          </div>
        )}

        {/* Status */}
        {progress && !uploading && (
          <div className="mt-4 space-y-2">
            <div
              className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
                results?.some((r) => !r.success)
                  ? "bg-amber-500/10 text-amber-400"
                  : "bg-emerald-500/10 text-emerald-400"
              }`}
            >
              {results?.some((r) => !r.success) ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
              {progress}
            </div>
            {/* Show per-file errors */}
            {results?.filter((r) => !r.success).map((r, i) => (
              <div key={i} className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
                <span className="font-medium">{r.title}:</span> {r.error}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Existing Photos */}
      <h2 className="mb-6 text-lg font-semibold">
        Gallery ({photos.length} photo{photos.length !== 1 ? "s" : ""})
      </h2>

      {photos.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-card py-16 text-center text-muted-foreground">
          No photos uploaded yet.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-xl border border-white/5 bg-card"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.thumbnail_url || photo.url}
                alt={photo.title}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="p-2.5">
                <p className="truncate text-xs font-medium">{photo.title}</p>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="rounded bg-accent/10 px-1.5 py-0.5 text-accent capitalize">
                    {photo.category}
                  </span>
                  {photo.location_name && (
                    <span className="flex items-center gap-0.5 truncate">
                      <MapPin size={8} />
                      {photo.location_name}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(photo.id)}
                disabled={deleting === photo.id}
                className="absolute top-1.5 right-1.5 rounded-full bg-red-500/80 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500"
              >
                {deleting === photo.id ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Trash2 size={12} />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
