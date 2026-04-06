import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects | Leo Harling",
  description:
    "Tools and applications built around real-world problems in aerospace, space, defence, and IT compliance.",
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
