import { Linkedin, Instagram, Mail } from "lucide-react";
import { SOCIAL_LINKS, SITE_CONFIG } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {SITE_CONFIG.name}. All rights
          reserved.
        </p>
        <div className="flex items-center gap-4">
          <a
            href={SOCIAL_LINKS.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-accent"
            aria-label="LinkedIn"
          >
            <Linkedin size={18} />
          </a>
          <a
            href={SOCIAL_LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-accent"
            aria-label="Instagram"
          >
            <Instagram size={18} />
          </a>
          <a
            href={`mailto:${SITE_CONFIG.email}`}
            className="text-muted-foreground transition-colors hover:text-accent"
            aria-label="Email"
          >
            <Mail size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
