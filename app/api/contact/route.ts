import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Simple in-memory rate limit (per serverless instance, but still helpful)
const recentSubmissions = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_SUBMISSIONS = 3; // max 3 per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  // Clean old entries
  for (const [key, timestamp] of recentSubmissions) {
    if (now - timestamp > RATE_LIMIT_WINDOW) recentSubmissions.delete(key);
  }
  const count = [...recentSubmissions.entries()].filter(([k]) => k.startsWith(ip)).length;
  if (count >= MAX_SUBMISSIONS) return false;
  recentSubmissions.set(`${ip}_${now}`, now);
  return true;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Save to Supabase
    const { error: dbError } = await supabase
      .from("contact_submissions")
      .insert([{ name, email, message }]);

    if (dbError) {
      console.error("Supabase error:", dbError);
      // Don't fail the whole request if DB save fails
    }

    // Send email via Resend (if API key is configured)
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && resendApiKey !== "your-resend-api-key-here") {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "Leo Harling Website <onboarding@resend.dev>",
            to: "leoharling@gmail.com",
            subject: `New Contact: ${name}`,
            html: `
              <h2>New message from your website</h2>
              <p><strong>Name:</strong> ${escapeHtml(name)}</p>
              <p><strong>Email:</strong> ${escapeHtml(email)}</p>
              <p><strong>Message:</strong></p>
              <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
            `,
          }),
        });
      } catch (emailError) {
        console.error("Email send error:", emailError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
