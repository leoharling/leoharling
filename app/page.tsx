"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowDown, Briefcase, GraduationCap, Rocket } from "lucide-react";
import Button from "@/components/ui/Button";
import FadeIn from "@/components/ui/FadeIn";

const Globe = dynamic(() => import("@/components/hero/Globe"), { ssr: false });

const highlights = [
  {
    icon: <Briefcase size={20} />,
    title: "Strategy&",
    description: "Strategy consulting in Aerospace, Space & Defence",
  },
  {
    icon: <GraduationCap size={20} />,
    title: "TU Darmstadt & UC Berkeley",
    description: "M.Sc. Business Administration & Electrical Engineering",
  },
  {
    icon: <Rocket size={20} />,
    title: "New Space",
    description: "Business development, partnerships & ecosystem building",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden">
        <Globe />

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <p className="mb-4 font-mono text-sm tracking-widest text-accent uppercase">
              Strategy &middot; Space &middot; Technology
            </p>
            <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
              Leo Harling
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl">
              Strategy &amp; operations in aerospace, space and defence.
              Building tools and insights for the industries shaping our future.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Button href="/tools">View My Work</Button>
            <Button href="/contact" variant="secondary">
              Get in Touch
            </Button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ArrowDown size={20} className="text-muted" />
          </motion.div>
        </motion.div>
      </section>

      {/* Highlights Section */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            {highlights.map((item, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <div className="glass-card p-8">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
