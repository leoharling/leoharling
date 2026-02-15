import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
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
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Message:</strong></p>
              <p>${message}</p>
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
