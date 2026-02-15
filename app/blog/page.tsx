import { Metadata } from "next";
import { PenLine, Rocket, Shield, Cpu, ArrowRight } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights on New Space, defence strategy, and technology — coming soon.",
};

const topics = [
  {
    icon: <Rocket size={20} />,
    title: "New Space Analysis",
    description:
      "Deep dives into the evolving space economy — from launch economics to satellite constellations and commercial space stations.",
  },
  {
    icon: <Shield size={20} />,
    title: "Defence Strategy",
    description:
      "European defence procurement, NATO capability development, and the intersection of commercial tech with military applications.",
  },
  {
    icon: <Cpu size={20} />,
    title: "Tech & AI Insights",
    description:
      "Thoughts on AI in regulated industries, vibe coding, deep tech startups, and the tools shaping the future of work.",
  },
];

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      <SectionHeading
        title="Blog"
        subtitle="A space for analysis, strategy insights, and thoughts on the industries shaping our future."
      />

      {/* Coming Soon */}
      <FadeIn>
        <div className="mb-12 rounded-2xl border border-white/5 bg-card p-8 text-center sm:p-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
            <PenLine size={28} className="text-accent" />
          </div>
          <h3 className="text-2xl font-bold">Coming Soon</h3>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            I&apos;m preparing in-depth articles on the New Space ecosystem,
            defence strategy, and technology trends. Sign up to get notified
            when the first post goes live.
          </p>
          <div className="mt-8">
            <Button
              href="https://www.linkedin.com/in/leo-harling/"
              external
              variant="secondary"
            >
              Follow on LinkedIn for Updates
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </FadeIn>

      {/* Topic Previews */}
      <FadeIn>
        <h3 className="mb-6 text-xl font-semibold">What to Expect</h3>
      </FadeIn>
      <div className="grid gap-4 sm:grid-cols-3">
        {topics.map((topic, i) => (
          <FadeIn key={topic.title} delay={i * 0.1}>
            <div className="glass-card p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                {topic.icon}
              </div>
              <h4 className="font-semibold">{topic.title}</h4>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {topic.description}
              </p>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
