import { Metadata } from "next";
import {
  Download,
  Briefcase,
  GraduationCap,
  Award,
  Languages,
  MapPin,
  Calendar,
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
    team: "Corporate & Business Strategy — Technology Strategy / Aerospace, Space & Defence",
    period: "Sep 2024 – Present",
    location: "Berlin",
    current: true,
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
    location: "Berlin",
    current: false,
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
    location: "Frankfurt",
    current: false,
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
    location: "Frankfurt",
    current: false,
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
    details: "Finance, Entrepreneurship, Machine Learning & Automation",
    grade: "1.5",
    thesis:
      "A Comparative View on Exit Options Choice for VC-Backed Startups (1.0)",
  },
  {
    degree: "Semester Abroad",
    school: "Universidad Politecnica de Valencia",
    period: "Feb – Jun 2023",
    details: "Valencia, Spain",
  },
  {
    degree: "Semester Abroad",
    school: "University of California, Berkeley",
    period: "Jan – May 2022",
    details: "Berkeley, United States",
  },
  {
    degree: "B.Sc. Business Administration & Electrical Engineering / IT",
    school: "Technical University Darmstadt",
    period: "2017 – 2021",
    details: "Automation Systems — Top 15% of graduates",
    grade: "2.1",
    thesis:
      "SPACs Are Back! — On the Characteristics and Performance of Recent SPAC IPOs (1.0)",
  },
];

const awards = [
  { name: "Deutschlandstipendium", year: "2023" },
  { name: "ERASMUS+ Scholarship", year: "2023" },
  { name: "DAAD PROMOS Scholarship", year: "2022" },
  { name: "e-fellows Scholarship", year: "2022" },
  { name: "Abitur Award in Physics", year: "2017" },
];

const languages = [
  { lang: "German", level: "Native" },
  { lang: "English", level: "C2 (IELTS 8.0)" },
  { lang: "Spanish", level: "B1" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      {/* Header */}
      <SectionHeading
        title="About Me"
        subtitle="Strategy consultant turning complex challenges in aerospace, space and defence into actionable outcomes."
      />

      {/* Intro + CV */}
      <FadeIn>
        <div className="mb-16 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            I work at the intersection of strategy and technology — helping
            organisations in aerospace, space and defence navigate complexity,
            make better decisions and execute faster. My background bridges
            business and engineering, with degrees in both and experience ranging
            from venture development to defence procurement to New Space business
            development.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button href="/CV_LSH.pdf" external size="sm">
              <Download size={15} />
              Download CV
            </Button>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin size={12} />
              Berlin, Germany
            </span>
          </div>
        </div>
      </FadeIn>

      {/* Experience Timeline */}
      <div className="mb-16">
        <FadeIn>
          <h3 className="mb-8 flex items-center gap-2 text-xl font-semibold">
            <Briefcase size={20} className="text-accent" />
            Experience
          </h3>
        </FadeIn>

        <div className="relative space-y-8 border-l border-white/10 pl-8">
          {experience.map((exp, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="relative">
                <div className="absolute -left-[2.55rem] top-1.5 h-3 w-3 rounded-full border-2 border-accent bg-background" />
                <p className="font-mono text-xs text-muted-foreground">
                  {exp.period} &middot; {exp.location}
                </p>
                <h4 className="mt-1 text-lg font-semibold">{exp.role}</h4>
                <p className="text-accent">{exp.company}</p>
                <p className="text-sm text-muted-foreground">{exp.team}</p>
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
      <div className="grid gap-6 sm:grid-cols-2">
        <FadeIn>
          <div className="h-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Award size={15} className="text-accent" />
              Scholarships & Awards
            </h3>
            <div className="space-y-3">
              {awards.map((award) => (
                <div key={award.name} className="flex items-center justify-between">
                  <span className="text-sm">{award.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">{award.year}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="h-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Languages size={15} className="text-accent" />
              Languages
            </h3>
            <div className="space-y-3">
              {languages.map((l) => (
                <div key={l.lang} className="flex items-center justify-between">
                  <span className="text-sm">{l.lang}</span>
                  <span className="text-xs text-muted-foreground">{l.level}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
