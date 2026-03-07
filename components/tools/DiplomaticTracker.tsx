"use client";

import { Gavel, Package, Flag, Handshake, Shield, MessageSquare } from "lucide-react";
import type { DiplomaticLandscape } from "@/lib/conflicts";

const TYPE_ICONS: Record<string, typeof Gavel> = {
  sanction: Gavel,
  "arms-delivery": Package,
  "un-action": Flag,
  negotiation: Handshake,
  "ceasefire-attempt": Shield,
  statement: MessageSquare,
};

const STATUS_STYLES: Record<string, string> = {
  active: "text-green-400 bg-green-500/10",
  stalled: "text-yellow-400 bg-yellow-500/10",
  failed: "text-red-400 bg-red-500/10",
  succeeded: "text-blue-400 bg-blue-500/10",
};

export default function DiplomaticTracker({ data }: { data: DiplomaticLandscape }) {
  return (
    <div>
      {/* Peace status */}
      <div className="rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 mb-4">
        <p className="text-xs font-semibold">{data.peaceStatus.label}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{data.peaceStatus.detail}</p>
        {data.peaceStatus.lastTalkDate && (
          <p className="text-[10px] text-muted-foreground/70 mt-1">
            Last talks: {new Date(data.peaceStatus.lastTalkDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          </p>
        )}
      </div>

      {/* Entries */}
      <div className="space-y-1.5">
        {data.entries.map((e, i) => {
          const Icon = TYPE_ICONS[e.type] || MessageSquare;
          return (
            <div key={i} className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5">
              <Icon size={13} className="mt-0.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(e.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                  {e.status && (
                    <span className={`rounded px-1.5 py-0.5 text-[9px] font-medium ${STATUS_STYLES[e.status] || ""}`}>
                      {e.status}
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium mt-0.5">{e.title}</p>
                <p className="text-[11px] text-muted-foreground leading-snug">{e.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
