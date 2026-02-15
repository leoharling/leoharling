"use client";

import { useState } from "react";
import { Send, Linkedin, Mail, CheckCircle, AlertCircle } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import FadeIn from "@/components/ui/FadeIn";
import Button from "@/components/ui/Button";
import { SOCIAL_LINKS, SITE_CONFIG } from "@/lib/constants";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to send");
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      <SectionHeading
        title="Get in Touch"
        subtitle="Have an idea, opportunity, or just want to connect? I'd love to hear from you."
      />

      <div className="grid gap-12 lg:grid-cols-5">
        {/* Contact Form */}
        <FadeIn className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-muted-foreground"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-foreground placeholder-muted transition-colors focus:border-accent focus:outline-none"
                placeholder="Your name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-muted-foreground"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-foreground placeholder-muted transition-colors focus:border-accent focus:outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-medium text-muted-foreground"
              >
                Message
              </label>
              <textarea
                id="message"
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-foreground placeholder-muted transition-colors focus:border-accent focus:outline-none"
                placeholder="Tell me what's on your mind..."
              />
            </div>

            <Button
              type="submit"
              disabled={status === "loading"}
              className="w-full sm:w-auto"
            >
              {status === "loading" ? (
                "Sending..."
              ) : (
                <>
                  <Send size={16} />
                  Send Message
                </>
              )}
            </Button>

            {status === "success" && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                <CheckCircle size={16} />
                Message sent successfully! I&apos;ll get back to you soon.
              </div>
            )}

            {status === "error" && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <AlertCircle size={16} />
                Something went wrong. Please try again or email me directly.
              </div>
            )}
          </form>
        </FadeIn>

        {/* Sidebar */}
        <FadeIn delay={0.2} className="lg:col-span-2">
          <div className="glass-card p-6">
            <h3 className="mb-4 text-lg font-semibold">
              Let&apos;s Connect
            </h3>
            <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
              Whether it&apos;s about aerospace strategy, a potential
              collaboration, or an interesting opportunity in the space &amp;
              defence sector — I&apos;m always happy to chat.
            </p>

            <div className="space-y-4">
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              >
                <Mail size={18} className="text-accent" />
                {SITE_CONFIG.email}
              </a>
              <a
                href={SOCIAL_LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              >
                <Linkedin size={18} className="text-accent" />
                LinkedIn Profile
              </a>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
