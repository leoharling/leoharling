import { ExternalLink } from "lucide-react";
import type { SignalType } from "@/lib/news-highlights";

interface NewsFeedItemProps {
  title: string;
  link: string;
  pubDate: string;
  snippet: string;
  source: string;
  highlight?: {
    type: SignalType;
    label: string;
  };
  variant?: "default" | "signal";
}

const SIGNAL_STYLES: Record<
  SignalType,
  { border: string; badge: string; glow: string }
> = {
  "ai-launch": {
    border: "border-l-violet-500",
    badge: "bg-violet-500/15 text-violet-400",
    glow: "hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]",
  },
  funding: {
    border: "border-l-emerald-500",
    badge: "bg-emerald-500/15 text-emerald-400",
    glow: "hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]",
  },
  defence: {
    border: "border-l-amber-500",
    badge: "bg-amber-500/15 text-amber-400",
    glow: "hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]",
  },
};

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function NewsFeedItem({
  title,
  link,
  pubDate,
  snippet,
  source,
  highlight,
  variant = "default",
}: NewsFeedItemProps) {
  const styles = highlight ? SIGNAL_STYLES[highlight.type] : null;
  const isSignalCard = variant === "signal";

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={`glass-card group block transition-all duration-300 hover:scale-[1.01] ${
        styles
          ? `border-l-2 ${styles.border} ${styles.glow}`
          : ""
      } ${isSignalCard ? "p-4 min-w-[300px] max-w-[340px] flex-shrink-0" : "p-5"}`}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-md bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
          {source}
        </span>
        {highlight && styles && (
          <span
            className={`rounded-md px-2 py-0.5 text-xs font-medium ${styles.badge}`}
          >
            {highlight.label}
          </span>
        )}
        <span className="ml-auto text-xs text-muted">{timeAgo(pubDate)}</span>
      </div>
      <h3
        className={`font-semibold leading-snug group-hover:text-accent transition-colors ${
          isSignalCard ? "text-sm line-clamp-2" : ""
        }`}
      >
        {title}
      </h3>
      {!isSignalCard && snippet && (
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {snippet}
        </p>
      )}
      <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground group-hover:text-accent transition-colors">
        Read more <ExternalLink size={12} />
      </div>
    </a>
  );
}
