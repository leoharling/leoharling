"use client";

import { useEffect, useState } from "react";
import { MapPin, Clock, Rocket } from "lucide-react";

interface LaunchCardProps {
  name: string;
  provider: string;
  vehicle: string;
  padName: string;
  padLocation: string;
  launchDate: string;
  status: string;
  imageUrl?: string;
  missionDescription?: string;
}

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft("Launched");
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

export default function LaunchCard({
  name,
  provider,
  vehicle,
  padName,
  padLocation,
  launchDate,
  status,
  imageUrl,
  missionDescription,
}: LaunchCardProps) {
  const countdown = useCountdown(launchDate);
  const isPast = new Date(launchDate).getTime() < Date.now();

  return (
    <div className="glass-card overflow-hidden transition-all duration-300 hover:scale-[1.01]">
      {imageUrl && (
        <div
          className="h-40 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
        >
          <div className="h-full w-full bg-gradient-to-t from-card to-transparent" />
        </div>
      )}
      <div className="p-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            {provider}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              isPast
                ? "bg-muted/20 text-muted-foreground"
                : status === "Go for Launch"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-amber-500/10 text-amber-400"
            }`}
          >
            {status}
          </span>
        </div>

        <h3 className="text-lg font-semibold leading-tight">{name}</h3>

        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Rocket size={14} className="text-accent" />
            {vehicle}
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-accent" />
            {padName}, {padLocation}
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-accent" />
            {new Date(launchDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>

        {missionDescription && (
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {missionDescription}
          </p>
        )}

        {!isPast && countdown && (
          <div className="mt-4 rounded-lg bg-accent/5 px-4 py-2 text-center">
            <p className="text-xs text-muted-foreground">T-minus</p>
            <p className="font-mono text-lg font-semibold text-accent">
              {countdown}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
