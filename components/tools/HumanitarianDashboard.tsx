"use client";

import type { HumanitarianData } from "@/lib/conflicts";

const SEVERITY_STYLES: Record<string, string> = {
  crisis: "text-yellow-400 bg-yellow-500/10",
  emergency: "text-orange-400 bg-orange-500/10",
  famine: "text-red-400 bg-red-500/10 animate-pulse",
};

function Stat({ label, value, subtext }: { label: string; value: string; subtext?: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-xl font-bold font-mono">{value}</p>
      {subtext && <p className="text-[10px] text-muted-foreground">{subtext}</p>}
    </div>
  );
}

export default function HumanitarianDashboard({ data }: { data: HumanitarianData }) {
  return (
    <div className="space-y-5">
      {/* Casualties */}
      <div>
        <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Casualties
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {data.casualties.military && (
            <Stat label="Military" value={data.casualties.military.value} subtext={data.casualties.military.subtext} />
          )}
          {data.casualties.civilian && (
            <Stat label="Civilian" value={data.casualties.civilian.value} subtext={data.casualties.civilian.subtext} />
          )}
        </div>
      </div>

      {/* Displacement */}
      <div>
        <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Displacement
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {data.displacement.internal && (
            <Stat label="Internal" value={data.displacement.internal.value} subtext={data.displacement.internal.subtext} />
          )}
          {data.displacement.refugees && (
            <Stat label="Refugees" value={data.displacement.refugees.value} subtext={data.displacement.refugees.subtext} />
          )}
        </div>
      </div>

      {/* Food Security */}
      {data.foodSecurity && (
        <div>
          <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Food Security
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold font-mono">{data.foodSecurity.value}</span>
            {data.foodSecurity.severity && (
              <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${SEVERITY_STYLES[data.foodSecurity.severity] || ""}`}>
                {data.foodSecurity.severity}
              </span>
            )}
          </div>
          {data.foodSecurity.subtext && (
            <p className="text-[10px] text-muted-foreground">{data.foodSecurity.subtext}</p>
          )}
        </div>
      )}

      {/* Aid Access */}
      {data.aidAccess && (
        <div>
          <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Aid Access
          </h4>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${
              data.aidAccess.status === "open" ? "bg-green-500" :
              data.aidAccess.status === "restricted" ? "bg-yellow-500" : "bg-red-500"
            }`} />
            <span className="text-xs font-medium capitalize">{data.aidAccess.status}</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">{data.aidAccess.detail}</p>
        </div>
      )}

      <p className="text-[9px] text-muted-foreground/50">Last updated: {data.lastUpdated}</p>
    </div>
  );
}
