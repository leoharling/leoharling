export interface FeedConfig {
  name: string;
  url: string;
  category: string;
}

export const RSS_FEEDS: FeedConfig[] = [
  // Space
  {
    name: "SpaceNews",
    url: "https://spacenews.com/feed/",
    category: "Space",
  },
  {
    name: "NASA Spaceflight",
    url: "https://www.nasaspaceflight.com/feed/",
    category: "Space",
  },
  {
    name: "ESA News",
    url: "https://www.esa.int/rssfeed/Our_Activities/Space_News",
    category: "Space",
  },
  {
    name: "Ars Technica Space",
    url: "https://arstechnica.com/space/feed/",
    category: "Space",
  },

  // AI & Tech
  {
    name: "TechCrunch AI",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
    category: "AI & Tech",
  },
  {
    name: "The Verge AI",
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
    category: "AI & Tech",
  },
  {
    name: "Hacker News",
    url: "https://hnrss.org/frontpage",
    category: "AI & Tech",
  },

  // Defence
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

  // Startups & Deep Tech
  {
    name: "TechCrunch Startups",
    url: "https://techcrunch.com/category/startups/feed/",
    category: "Startups",
  },
];

export const CATEGORIES = ["All", "Space", "AI & Tech", "Defence", "Startups"];
