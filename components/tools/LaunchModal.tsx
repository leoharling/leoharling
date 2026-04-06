"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Rocket, MapPin, Clock, Calendar, Globe, Target } from "lucide-react";

interface Launch {
  id: string;
  name: string;
  net: string;
  status: { name: string };
  launch_service_provider: { name: string };
  rocket: { configuration: { name: string } };
  pad: {
    name: string;
    location: { name: string };
  };
  image?: { image_url?: string } | null;
  mission?: {
    description?: string;
    type?: string;
    orbit?: { name?: string; abbrev?: string };
  } | null;
}

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Launched");
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-accent">{icon}</span>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
          {label}
        </p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export default function LaunchModal({
  launch,
  onClose,
}: {
  launch: Launch;
  onClose: () => void;
}) {
  const isPast = new Date(launch.net).getTime() < Date.now();
  const countdown = useCountdown(launch.net);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const statusColor = isPast
    ? "bg-muted/20 text-muted-foreground"
    : launch.status.name === "Go for Launch"
      ? "bg-emerald-500/10 text-emerald-400"
      : "bg-amber-500/10 text-amber-400";

  const launchDate = new Date(launch.net);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-white/[0.08] bg-card shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-lg bg-black/30 text-white/60 backdrop-blur-sm transition-colors hover:bg-black/50 hover:text-white"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col sm:flex-row">
          {/* Image side */}
          <div className="relative h-48 sm:h-auto sm:w-2/5 shrink-0">
            {launch.image?.image_url ? (
              <div
                className="h-full sm:min-h-[280px] bg-cover bg-center"
                style={{
                  backgroundImage: `url(${launch.image.image_url})`,
                }}
              >
                <div className="h-full w-full bg-gradient-to-r from-transparent to-card/80 sm:block hidden" />
                <div className="h-full w-full bg-gradient-to-t from-card to-transparent sm:hidden" />
              </div>
            ) : (
              <div className="flex h-full sm:min-h-[280px] items-center justify-center bg-white/[0.02]">
                <Rocket size={40} className="text-muted-foreground/20" />
              </div>
            )}
            <div className="absolute left-3 top-3">
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold backdrop-blur-sm ${statusColor}`}
              >
                {launch.status.name}
              </span>
            </div>
          </div>

          {/* Data side */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[70vh]">
            <div className="mb-1">
              <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-medium text-accent">
                {launch.launch_service_provider.name}
              </span>
            </div>
            <h2 className="mt-2 text-xl font-bold leading-tight">
              {launch.name}
            </h2>

            {/* Countdown */}
            {!isPast && countdown && (
              <div className="mt-3 rounded-lg bg-accent/5 px-4 py-2.5 text-center">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  T-minus
                </p>
                <p className="font-mono text-lg font-semibold text-accent">
                  {countdown}
                </p>
              </div>
            )}

            {/* Mission description */}
            {launch.mission?.description && (
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {launch.mission.description}
              </p>
            )}

            {/* Key info grid */}
            <div className="mt-5 grid grid-cols-1 gap-y-3 sm:grid-cols-2 sm:gap-x-6">
              <Stat
                icon={<Rocket size={13} />}
                label="Vehicle"
                value={launch.rocket.configuration.name}
              />
              <Stat
                icon={<Calendar size={13} />}
                label="Date"
                value={launchDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              />
              <Stat
                icon={<Clock size={13} />}
                label="Time (UTC)"
                value={launchDate.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "UTC",
                })}
              />
              <Stat
                icon={<MapPin size={13} />}
                label="Launch Pad"
                value={launch.pad.name}
              />
              <Stat
                icon={<Globe size={13} />}
                label="Location"
                value={launch.pad.location.name}
              />
              {launch.mission?.orbit?.name && (
                <Stat
                  icon={<Target size={13} />}
                  label="Target Orbit"
                  value={`${launch.mission.orbit.name}${
                    launch.mission.orbit.abbrev
                      ? ` (${launch.mission.orbit.abbrev})`
                      : ""
                  }`}
                />
              )}
            </div>

            {/* Mission type */}
            {launch.mission?.type && (
              <div className="mt-4 rounded-lg bg-white/[0.03] px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1">
                  Mission Type
                </p>
                <p className="text-sm font-medium">{launch.mission.type}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
