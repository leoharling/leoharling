export const SITE_CONFIG = {
  name: "Leo Harling",
  title: "Leo Harling | Strategy & Operations in Aerospace, Space & Defence",
  description:
    "Strategy consultant specializing in aerospace, space and defence. Building tools and insights for the New Space ecosystem.",
  url: "https://leoharling.com",
  email: "leoharling@gmail.com",
};

export const SOCIAL_LINKS = {
  linkedin: "https://www.linkedin.com/in/leo-harling/",
  instagram: "https://www.instagram.com/leo.harling/",
  github: "https://github.com/leoharling",
};

export interface NavLink {
  href: string;
  label: string;
  children?: { href: string; label: string }[];
}

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/intel", label: "Intel" },
  { href: "/space", label: "Space" },
  { href: "/geopolitics", label: "Geopolitics" },
  {
    href: "#",
    label: "More",
    children: [
      { href: "/ai", label: "AI" },
      { href: "/projects", label: "Projects" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
];
