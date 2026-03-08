export interface FeedConfig {
  name: string;
  url: string;
  category: string;
}

export const RSS_FEEDS: FeedConfig[] = [
  // ── Aerospace & Transportation ──
  {
    name: "SpaceNews",
    url: "https://spacenews.com/feed/",
    category: "Aerospace",
  },
  {
    name: "NASA Spaceflight",
    url: "https://www.nasaspaceflight.com/feed/",
    category: "Aerospace",
  },
  {
    name: "ESA News",
    url: "https://www.esa.int/rssfeed/Our_Activities/Space_News",
    category: "Aerospace",
  },
  {
    name: "Ars Technica Space",
    url: "https://arstechnica.com/space/feed/",
    category: "Aerospace",
  },

  // ── AI & Compute ──
  {
    name: "TechCrunch AI",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
    category: "AI & Compute",
  },
  {
    name: "The Verge AI",
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
    category: "AI & Compute",
  },
  {
    name: "MIT Tech Review",
    url: "https://www.technologyreview.com/feed/",
    category: "AI & Compute",
  },

  // ── Biotech & Health ──
  {
    name: "STAT News",
    url: "https://www.statnews.com/feed/",
    category: "Biotech",
  },
  {
    name: "FierceBiotech",
    url: "https://www.fiercebiotech.com/rss/xml",
    category: "Biotech",
  },
  {
    name: "Ars Health",
    url: "https://arstechnica.com/health/feed/",
    category: "Biotech",
  },

  // ── Energy ──
  {
    name: "Canary Media",
    url: "https://www.canarymedia.com/feed",
    category: "Energy",
  },
  {
    name: "World Nuclear News",
    url: "https://www.world-nuclear-news.org/rss",
    category: "Energy",
  },

  // ── Defence ──
  {
    name: "Defense One",
    url: "https://www.defenseone.com/rss/",
    category: "Defence",
  },
  {
    name: "Breaking Defense",
    url: "https://breakingdefense.com/feed/",
    category: "Defence",
  },

  // ── Venture & Startups ──
  {
    name: "TechCrunch Startups",
    url: "https://techcrunch.com/category/startups/feed/",
    category: "Venture",
  },
  {
    name: "Hacker News",
    url: "https://hnrss.org/frontpage",
    category: "Venture",
  },
];

export const CATEGORIES = [
  "All",
  "Aerospace",
  "AI & Compute",
  "Biotech",
  "Energy",
  "Defence",
  "Venture",
];
