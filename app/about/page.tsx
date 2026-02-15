import { Metadata } from "next";
import {
  Download,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Languages,
} from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About",
  description:
    "Strategy & operations professional in aerospace, space and defence. Learn about my background, experience and interests.",
};

const experience = [
  {
    role: "Associate, Strategy Consulting",
    company: "Strategy&",
    team: "Corporate & Business Strategy – Technology Strategy / Aerospace, Space & Defence",
    period: "Sep 2024 – Present",
    location: "Berlin, Germany",
    highlights: [
      "Enabling executive decision-making by synthesizing commercial, technical and organizational inputs into strategic recommendations",
      "Built a monitoring tool for engine supply chains at an aerospace OEM, improving bottleneck visibility and delivery readiness",
      "Designed a DevSecOps process for a defence agency, accelerating software delivery with security by design",
      "Driving space sector business development, engaging New Space startups and shaping joint initiatives",
    ],
  },
  {
    role: "Intern, Venture Development",
    company: "Enpal",
    team: "CGO Office",
    period: "Apr 2024 – Jun 2024",
    location: "Berlin, Germany",
    highlights: [
      "Scaled field sales by building a lead steering algorithm for process automation",
      "Supported growth initiatives including sales funnel optimization and commercial performance tracking",
    ],
  },
  {
    role: "Intern, Strategy Consulting",
    company: "Strategy&",
    team: "Corporate & Business Strategy",
    period: "Oct 2022 – Dec 2022",
    location: "Frankfurt, Germany",
    highlights: [
      "Designed an operating model for a leading insurer enabling monitoring and reporting in a sales cooperation",
      "Built a multi-framework compliance register for a European cloud provider, improving audit readiness",
    ],
  },
  {
    role: "Intern, Project Management",
    company: "Oddo BHF",
    team: "COO Corporates & Markets Office",
    period: "Oct 2021 – Dec 2021",
    location: "Frankfurt, Germany",
    highlights: [
      "Conducted company and market analyses for a new startup financing initiative",
      "Optimized processes across COO Office and Corporate & Investment Banking interfaces",
    ],
  },
];

const education = [
  {
    degree: "M.Sc. Business Administration & Electrical Engineering / IT",
    school: "Technical University Darmstadt",
    period: "2021 – 2024",
    details: "Focus: Finance, Entrepreneurship, Machine Learning & Automation",
    grade: "1.5",
    thesis:
      "A Comparative View on Exit Options Choice for VC-Backed Startups (1.0)",
  },
  {
    degree: "Semester Abroad, Industrial Engineering",
    school: "Universidad Politecnica de Valencia",
    period: "Feb – Jun 2023",
    details: "Valencia, Spain",
  },
  {
    degree: "Semester Abroad, Business & Electrical Engineering",
    school: "University of California, Berkeley",
    period: "Jan – May 2022",
    details: "Berkeley, United States",
  },
  {
    degree: "B.Sc. Business Administration & Electrical Engineering / IT",
    school: "Technical University Darmstadt",
    period: "2017 – 2021",
    details:
      "Technical specialization: Automation Systems, Top 15% of graduates",
    grade: "2.1",
    thesis:
      "SPACs Are Back! – On the Characteristics and Performance of Recent SPAC IPOs (1.0)",
  },
];

const focusAreas = [
  "New Space Ecosystem",
  "Defence & Public Procurement",
  "DevSecOps & Security by Design",
  "Scaling Processes & Execution",
  "Deep Tech Startups",
  "AI & Automation",
];

const awards = [
  "Deutschlandstipendium (2023)",
  "ERASMUS+ Scholarship (2023)",
  "DAAD PROMOS Scholarship (2022)",
  "e-fellows Scholarship (2022)",
  "Abitur Award in Physics (2017)",
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      {/* Header */}
      <SectionHeading
        title="About Me"
        subtitle="Strategy consultant turning complex challenges in aerospace, space and defence into actionable outcomes."
      />

      <FadeIn>
        <div className="mb-16 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button href="/CV_LSH.pdf" external>
            <Download size={16} />
            Download CV
          </Button>
        </div>
      </FadeIn>

      {/* Focus Areas */}
      <FadeIn>
        <div className="mb-16">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <Globe size={20} className="text-accent" />
            Focus Areas
          </h3>
          <div className="flex flex-wrap gap-2">
            {focusAreas.map((area) => (
              <span
                key={area}
                className="rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-sm text-accent"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Experience Timeline */}
      <div className="mb-16">
        <FadeIn>
          <h3 className="mb-8 flex items-center gap-2 text-xl font-semibold">
            <Briefcase size={20} className="text-accent" />
            Professional Experience
          </h3>
        </FadeIn>

        <div className="relative space-y-8 border-l border-white/10 pl-8">
          {experience.map((exp, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="relative">
                <div className="absolute -left-[2.55rem] top-1.5 h-3 w-3 rounded-full border-2 border-accent bg-background" />
                <p className="font-mono text-xs text-muted-foreground">
                  {exp.period}
                </p>
                <h4 className="mt-1 text-lg font-semibold">{exp.role}</h4>
                <p className="text-accent">{exp.company}</p>
                <p className="text-sm text-muted-foreground">{exp.team}</p>
                <p className="text-sm text-muted-foreground">{exp.location}</p>
                <ul className="mt-3 space-y-1.5">
                  {exp.highlights.map((h, j) => (
                    <li
                      key={j}
                      className="text-sm text-muted-foreground leading-relaxed"
                    >
                      &bull; {h}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="mb-16">
        <FadeIn>
          <h3 className="mb-8 flex items-center gap-2 text-xl font-semibold">
            <GraduationCap size={20} className="text-accent" />
            Education
          </h3>
        </FadeIn>

        <div className="relative space-y-8 border-l border-white/10 pl-8">
          {education.map((edu, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="relative">
                <div className="absolute -left-[2.55rem] top-1.5 h-3 w-3 rounded-full border-2 border-accent bg-background" />
                <p className="font-mono text-xs text-muted-foreground">
                  {edu.period}
                </p>
                <h4 className="mt-1 text-lg font-semibold">{edu.degree}</h4>
                <p className="text-accent">{edu.school}</p>
                <p className="text-sm text-muted-foreground">{edu.details}</p>
                {edu.grade && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Grade: {edu.grade}
                  </p>
                )}
                {edu.thesis && (
                  <p className="mt-1 text-sm text-muted-foreground italic">
                    Thesis: {edu.thesis}
                  </p>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* Awards & Languages */}
      <div className="grid gap-8 sm:grid-cols-2">
        <FadeIn>
          <div className="glass-card p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <Award size={18} className="text-accent" />
              Scholarships & Awards
            </h3>
            <ul className="space-y-2">
              {awards.map((award) => (
                <li key={award} className="text-sm text-muted-foreground">
                  {award}
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="glass-card p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <Languages size={18} className="text-accent" />
              Languages
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>German — Native</li>
              <li>English — C2 (IELTS: 8.0)</li>
              <li>Spanish — B1</li>
            </ul>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
