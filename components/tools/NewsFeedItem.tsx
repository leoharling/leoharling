import { ExternalLink } from "lucide-react";

interface NewsFeedItemProps {
  title: string;
  link: string;
  pubDate: string;
  snippet: string;
  source: string;
}

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
}: NewsFeedItemProps) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="glass-card group block p-5 transition-all duration-300 hover:scale-[1.01]"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-md bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
          {source}
        </span>
        <span className="text-xs text-muted">{timeAgo(pubDate)}</span>
      </div>
      <h3 className="font-semibold leading-snug group-hover:text-accent transition-colors">
        {title}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">
        {snippet}
      </p>
      <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground group-hover:text-accent transition-colors">
        Read more <ExternalLink size={12} />
      </div>
    </a>
  );
}
