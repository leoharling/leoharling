"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Menu, X, ChevronDown, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_LINKS, TOOLS_LINKS } from "@/lib/constants";

function ToolsDropdown({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="absolute top-full left-1/2 z-50 mt-2 w-72 -translate-x-1/2 rounded-xl border border-white/10 bg-[#12121a]/95 p-2 shadow-2xl backdrop-blur-xl"
    >
      {TOOLS_LINKS.map((tool) => {
        const isExternal = "external" in tool && tool.external;
        if (isExternal) {
          return (
            <a
              key={tool.href}
              href={tool.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onNavigate}
              className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/5"
            >
              <div className="flex-1">
                <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  {tool.label}
                  <ExternalLink size={11} className="text-muted" />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {tool.description}
                </p>
              </div>
            </a>
          );
        }
        return (
          <Link
            key={tool.href}
            href={tool.href}
            onClick={onNavigate}
            className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/5"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {tool.label}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {tool.description}
              </p>
            </div>
          </Link>
        );
      })}
    </motion.div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setToolsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setToolsOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Leo Harling
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));

            // Tools link with dropdown
            if ("hasDropdown" in link && link.hasDropdown) {
              return (
                <div key={link.href} ref={dropdownRef} className="relative">
                  <button
                    onClick={() => setToolsOpen(!toolsOpen)}
                    className={`flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "text-foreground bg-white/5"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${toolsOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {toolsOpen && (
                      <ToolsDropdown
                        onNavigate={() => setToolsOpen(false)}
                      />
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-foreground bg-white/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-muted-foreground hover:text-foreground md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-b border-white/5 bg-background/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {NAV_LINKS.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));

                // Tools section in mobile: show sub-links directly
                if ("hasDropdown" in link && link.hasDropdown) {
                  return (
                    <div key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors block ${
                          isActive
                            ? "text-foreground bg-white/5"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {link.label}
                      </Link>
                      <div className="ml-4 border-l border-white/10 pl-4">
                        {TOOLS_LINKS.filter((t) => t.href !== "/tools").map(
                          (tool) => {
                            const isExternal =
                              "external" in tool && tool.external;
                            if (isExternal) {
                              return (
                                <a
                                  key={tool.href}
                                  href={tool.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => setMobileOpen(false)}
                                  className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                                >
                                  {tool.label}
                                  <ExternalLink size={11} />
                                </a>
                              );
                            }
                            return (
                              <Link
                                key={tool.href}
                                href={tool.href}
                                onClick={() => setMobileOpen(false)}
                                className="block rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                              >
                                {tool.label}
                              </Link>
                            );
                          }
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "text-foreground bg-white/5"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
