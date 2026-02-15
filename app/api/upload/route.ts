import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import exifr from "exifr";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Verify admin password
    const password = formData.get("password") as string;
    console.log("[upload] Password provided:", !!password);
    console.log("[upload] Password matches:", password === process.env.ADMIN_PASSWORD);
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const files = formData.getAll("files") as File[];
    const category = (formData.get("category") as string) || "";
    console.log("[upload] Files received:", files.length, "Category:", category);

    // Auth-only check (no files = just validating password)
    if (!files.length || !files[0].size) {
      return NextResponse.json({ authenticated: true });
    }

    // Log Supabase config
    console.log("[upload] Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("[upload] Supabase key starts with:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 10) + "...");

    const results: { success: boolean; title: string; error?: string }[] = [];

    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        // Extract EXIF metadata from image
        let latitude: number | null = null;
        let longitude: number | null = null;
        let takenAt: string | null = null;
        let locationName: string | null = null;

        try {
          const exif = await exifr.parse(buffer, {
            gps: true,
            pick: [
              "DateTimeOriginal",
              "CreateDate",
              "GPSLatitude",
              "GPSLongitude",
              "ImageDescription",
              "ObjectName",
            ],
          });

          if (exif) {
            if (exif.latitude != null) latitude = exif.latitude;
            if (exif.longitude != null) longitude = exif.longitude;
            if (exif.DateTimeOriginal) {
              takenAt = new Date(exif.DateTimeOriginal).toISOString();
            } else if (exif.CreateDate) {
              takenAt = new Date(exif.CreateDate).toISOString();
            }
          }
        } catch {
          // EXIF parsing failed silently -- still upload the photo
        }

        // Reverse geocode if we have GPS coordinates
        if (latitude != null && longitude != null) {
          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`,
              { headers: { "User-Agent": "LeoHarlingWebsite/1.0" } }
            );
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              const addr = geoData.address;
              // Build a nice short location name
              const city =
                addr?.city || addr?.town || addr?.village || addr?.municipality;
              const country = addr?.country;
              if (city && country) {
                locationName = `${city}, ${country}`;
              } else if (country) {
                locationName = country;
              }
            }
          } catch {
            // Geocoding failed silently
          }
        }

        // Generate title from filename
        const rawName = file.name.replace(/\.[^/.]+$/, "");
        const title = rawName
          .replace(/[-_]/g, " ")
          .replace(/IMG\s*\d+/i, "")
          .replace(/DSC\s*\d+/i, "")
          .replace(/^\s+|\s+$/g, "")
          || `Photo ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

        // Unique filename for storage
        const ext = file.name.split(".").pop() || "jpg";
        const timestamp = Date.now();
        const rand = Math.random().toString(36).slice(2, 8);
        const fileName = `${timestamp}-${rand}.${ext}`;

        // Upload to Supabase Storage
        console.log(`[upload] Uploading "${file.name}" (${(buffer.length / 1024).toFixed(0)}KB) as "${fileName}" to bucket "photos"...`);
        const { data: storageData, error: uploadError } = await supabase.storage
          .from("photos")
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          console.error(`[upload] Storage error for "${file.name}":`, JSON.stringify(uploadError));
          results.push({
            success: false,
            title: file.name,
            error: `Storage: ${uploadError.message}`,
          });
          continue;
        }
        console.log(`[upload] Storage success for "${file.name}":`, JSON.stringify(storageData));

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("photos").getPublicUrl(fileName);
        console.log(`[upload] Public URL:`, publicUrl);

        // Insert into photos table
        const insertPayload = {
          title,
          url: publicUrl,
          thumbnail_url: publicUrl,
          category: category || "other",
          latitude,
          longitude,
          location_name: locationName,
          taken_at: takenAt,
        };
        console.log(`[upload] Inserting into DB:`, JSON.stringify(insertPayload));

        const { data: dbData, error: dbError } = await supabase.from("photos").insert([insertPayload]).select();

        if (dbError) {
          console.error(`[upload] DB error for "${file.name}":`, JSON.stringify(dbError));
          results.push({
            success: false,
            title: file.name,
            error: `Database: ${dbError.message}`,
          });
          continue;
        }
        console.log(`[upload] DB success:`, JSON.stringify(dbData));

        results.push({ success: true, title: file.name });
      } catch (err) {
        results.push({
          success: false,
          title: file.name,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    return NextResponse.json({
      success: true,
      uploaded: successCount,
      total: files.length,
      results,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 }
    );
  }
}

// Delete a photo
export async function DELETE(request: NextRequest) {
  try {
    const { id, password } = await request.json();

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: photo } = await supabase
      .from("photos")
      .select("url")
      .eq("id", id)
      .single();

    if (photo) {
      const url = new URL(photo.url);
      const pathParts = url.pathname.split("/");
      const fileName = pathParts[pathParts.length - 1];
      await supabase.storage.from("photos").remove([fileName]);
    }

    const { error } = await supabase.from("photos").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: `Delete failed: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}
