import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const conflictId = req.nextUrl.searchParams.get("id");
  if (!conflictId) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("conflict_territories")
    .select("date, label, geojson")
    .eq("conflict_id", conflictId)
    .order("date", { ascending: true });

  if (error) {
    console.error("Supabase error fetching territories:", error);
    return NextResponse.json({ snapshots: [] });
  }

  return NextResponse.json(
    { snapshots: data || [] },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    }
  );
}
