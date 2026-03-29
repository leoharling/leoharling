export type Industry =
  | "Finance"
  | "Healthcare"
  | "Logistics"
  | "Retail"
  | "Legal"
  | "Manufacturing"
  | "Media"
  | "Energy";

export type TaskType =
  | "Forecasting"
  | "Automation"
  | "Content Generation"
  | "Decisioning"
  | "Search / Retrieval"
  | "Code Generation"
  | "Analysis"
  | "Customer Service";

export type ROIPotential = "low" | "medium" | "high" | "transformative";

export interface AppExample {
  company: string;
  description: string;
}

export interface ApplicationCase {
  industry: Industry;
  task: TaskType;
  summary: string;
  modelTypes: string[];
  examples: AppExample[];
  roiPotential: ROIPotential;
  risks: string[];
  recommendedModelIds: string[];
}

export interface IndustryMeta {
  icon: string;
  color: string;
  description: string;
}

export const INDUSTRY_META: Record<Industry, IndustryMeta> = {
  Finance:       { icon: "TrendingUp", color: "#10b981", description: "Trading, risk, compliance" },
  Healthcare:    { icon: "Heart",      color: "#ef4444", description: "Diagnostics, care, admin" },
  Logistics:     { icon: "Truck",      color: "#f97316", description: "Routes, supply chains, demand" },
  Retail:        { icon: "ShoppingBag",color: "#a855f7", description: "Pricing, personalisation, inventory" },
  Legal:         { icon: "Scale",      color: "#3b82f6", description: "Research, contracts, discovery" },
  Manufacturing: { icon: "Cog",        color: "#f59e0b", description: "QA, maintenance, optimisation" },
  Media:         { icon: "Film",       color: "#ec4899", description: "Content, localisation, ads" },
  Energy:        { icon: "Zap",        color: "#22c55e", description: "Grid, renewables, infrastructure" },
};

export const ALL_INDUSTRIES: Industry[] = [
  "Finance", "Healthcare", "Logistics", "Retail", "Legal", "Manufacturing", "Media", "Energy",
];

export const ALL_TASKS: TaskType[] = [
  "Forecasting", "Automation", "Content Generation", "Decisioning",
  "Search / Retrieval", "Code Generation", "Analysis", "Customer Service",
];

export const ROI_COLORS: Record<ROIPotential, string> = {
  transformative: "#3b82f6",
  high:           "#22c55e",
  medium:         "#f59e0b",
  low:            "#71717a",
};

export const APPLICATION_CASES: ApplicationCase[] = [
  {
    industry: "Finance",
    task: "Forecasting",
    summary: "AI synthesises earnings calls, macro signals, and market data into structured forecasts — accelerating alpha generation and risk assessment at scale.",
    modelTypes: [
      "Frontier LLMs for narrative synthesis and earnings analysis",
      "Time-series models for quantitative signal generation",
      "Reasoning models (o3, Claude Opus) for complex scenario planning",
    ],
    examples: [
      { company: "Bloomberg",    description: "BloombergGPT for financial NLP, earnings call analysis, and news summarisation" },
      { company: "JPMorgan",     description: "LOXM for equities execution; CoT reasoning for research summaries" },
      { company: "Two Sigma",    description: "ML-driven systematic trading across 1,000+ signals" },
      { company: "Bridgewater",  description: "AI-assisted macro scenario modelling and daily briefings" },
    ],
    roiPotential: "transformative",
    risks: [
      "Hallucination in numerical outputs",
      "Regulatory scrutiny (MiFID II, SEC AI guidance)",
      "Tail-risk blind spots in training data",
      "Over-fitting to historical regimes",
    ],
    recommendedModelIds: ["claude-opus-46", "gemini-31-pro", "o3"],
  },
  {
    industry: "Finance",
    task: "Automation",
    summary: "Automating KYC/AML workflows, contract review, and reconciliation at scale — reducing operational cost 40–70% while improving accuracy.",
    modelTypes: [
      "Document processing LLMs for unstructured data extraction",
      "Agent frameworks for multi-step workflow orchestration",
      "Smaller fast models for high-volume screening tasks",
    ],
    examples: [
      { company: "HSBC",           description: "AI-driven AML transaction monitoring — 60% reduction in false positives" },
      { company: "Goldman Sachs",  description: "AI document review in M&A due diligence, 80% time reduction" },
      { company: "Stripe",         description: "ML fraud detection processing millions of transactions per second" },
    ],
    roiPotential: "high",
    risks: [
      "Bias in credit decisioning (Fair Lending Act)",
      "Model drift in fraud detection patterns",
      "Audit trail and explainability requirements",
    ],
    recommendedModelIds: ["claude-sonnet-46", "gemini-25-flash", "deepseek-v4"],
  },
  {
    industry: "Healthcare",
    task: "Analysis",
    summary: "AI-assisted diagnostics and clinical note synthesis reduce physician admin burden up to 50%, with vision-language models showing FDA-cleared performance in radiology and pathology.",
    modelTypes: [
      "Medical fine-tuned LLMs for clinical reasoning",
      "Vision-language models for imaging analysis",
      "RAG pipelines over clinical literature",
    ],
    examples: [
      { company: "Google DeepMind",    description: "Med-Gemini for medical Q&A and diagnostic support, exceeds specialist accuracy on USMLE" },
      { company: "Microsoft / Nuance", description: "Dragon Ambient eXperience — AI-generated SOAP notes, saving 2+ hrs/physician/day" },
      { company: "Paige AI",           description: "FDA-cleared AI pathology for prostate cancer detection" },
      { company: "Tempus",             description: "LLM-powered genomic and clinical data integration for oncology" },
    ],
    roiPotential: "transformative",
    risks: [
      "FDA regulatory approval for clinical decision support",
      "HIPAA data residency and privacy requirements",
      "Physician liability when AI is wrong",
      "Training data bias across demographics",
    ],
    recommendedModelIds: ["gemini-31-pro", "claude-opus-46", "gpt-54"],
  },
  {
    industry: "Healthcare",
    task: "Customer Service",
    summary: "AI patient intake and symptom triage reduces ER wait times and routes patients to appropriate care levels — with measurable impact on outcomes at scale.",
    modelTypes: [
      "RAG-augmented LLMs over medical knowledge bases",
      "Fast, cheap models for high-volume triage queries",
      "Escalation classifiers for emergency routing",
    ],
    examples: [
      { company: "Babylon Health",      description: "AI symptom checker with GP triage escalation across 3M+ users" },
      { company: "Kaiser Permanente",   description: "MyChart AI assistant for scheduling, Rx queries, and care navigation" },
      { company: "Suki",                description: "AI voice assistant for clinical documentation and EHR queries" },
    ],
    roiPotential: "high",
    risks: [
      "Misdiagnosis liability",
      "Patient trust and data privacy",
      "Emergency escalation protocol failures",
    ],
    recommendedModelIds: ["gemini-25-flash", "gemini-20-flash", "claude-sonnet-46"],
  },
  {
    industry: "Legal",
    task: "Search / Retrieval",
    summary: "AI legal research and contract review cuts associate hours 70%+ on routine discovery and due diligence — a generational shift in the economics of legal services.",
    modelTypes: [
      "RAG pipelines over legal corpora (case law, statutes, contracts)",
      "Frontier LLMs for contract drafting and redlining",
      "Reasoning models for adversarial argument generation",
    ],
    examples: [
      { company: "Harvey AI",          description: "LLM-native legal research and drafting for Am Law 100 firms" },
      { company: "Thomson Reuters",    description: "CoCounsel (GPT-4) for case research and deposition preparation" },
      { company: "Kira Systems",       description: "ML contract analysis for M&A due diligence — acquired by Litera" },
      { company: "EY / KPMG",          description: "AI-driven contract review in Big 4 legal advisory practices" },
    ],
    roiPotential: "high",
    risks: [
      "Bar association guidelines on AI-generated work product",
      "Hallucinated case citations (Mata v. Avianca precedent)",
      "Client confidentiality and data security",
      "Jurisdictional variation in acceptable AI use",
    ],
    recommendedModelIds: ["claude-opus-46", "claude-sonnet-46", "o3"],
  },
  {
    industry: "Media",
    task: "Content Generation",
    summary: "AI content pipelines reduce production costs 60–80% for localisation, ad creative testing, and long-tail content — reshaping media economics at every tier.",
    modelTypes: [
      "Multimodal frontier models for text, image, video generation",
      "Fine-tuned models for brand voice and style consistency",
      "Agentic pipelines for end-to-end content workflows",
    ],
    examples: [
      { company: "WPP",          description: "AI creative studio for personalised ad generation across 50+ languages" },
      { company: "Axel Springer", description: "AI-assisted journalism for earnings reports and breaking news summaries" },
      { company: "Stability AI", description: "Image generation replacing stock photography for editorial and marketing" },
      { company: "ElevenLabs",   description: "AI voice cloning for podcast localisation and audiobook production" },
    ],
    roiPotential: "high",
    risks: [
      "Copyright and IP ownership of AI-generated content",
      "Misinformation and deepfake risk at scale",
      "Union and labour relations (SAG-AFTRA, NUJ)",
      "Brand safety and off-brand outputs",
    ],
    recommendedModelIds: ["gpt-54", "gemini-31-pro", "claude-sonnet-46"],
  },
  {
    industry: "Logistics",
    task: "Forecasting",
    summary: "AI demand forecasting and route optimisation reduce logistics costs 15–25% while improving on-time delivery — critical as supply chains grow in complexity.",
    modelTypes: [
      "Time-series models for demand and inventory forecasting",
      "LLMs for disruption narrative synthesis (news + geopolitics signals)",
      "Optimisation models for routing and load planning",
    ],
    examples: [
      { company: "UPS ORION",      description: "AI route optimisation saving 100M+ miles/year and $400M annually" },
      { company: "Amazon Robotics", description: "AI warehouse picking and sortation at 1,000+ fulfilment centres" },
      { company: "Flexport",        description: "LLM-powered supply chain visibility and disruption alerting" },
      { company: "DHL",             description: "Predictive analytics for parcel volume forecasting across 220+ countries" },
    ],
    roiPotential: "high",
    risks: [
      "Model failure during demand shocks (COVID-type events)",
      "Integration with legacy ERP/WMS systems",
      "Labour displacement concerns",
    ],
    recommendedModelIds: ["gemini-25-flash", "gemini-20-flash", "llama4-maverick"],
  },
  {
    industry: "Manufacturing",
    task: "Automation",
    summary: "AI-powered visual inspection and predictive maintenance reduce unplanned downtime 30–50%, with edge-deployed models enabling real-time quality control on the production line.",
    modelTypes: [
      "Computer vision models for defect detection",
      "Small efficient models (Phi-4) for edge deployment",
      "Digital twin models for predictive maintenance",
    ],
    examples: [
      { company: "Siemens",      description: "Industrial Copilot for factory operations, equipment diagnostics, and worker guidance" },
      { company: "BMW",          description: "AI visual quality inspection at assembly lines — 100% coverage vs 10% manual sampling" },
      { company: "GE Aerospace", description: "Predictive maintenance on engine sensors with digital twin integration" },
      { company: "Foxconn",      description: "AI-driven defect detection in electronics manufacturing at scale" },
    ],
    roiPotential: "transformative",
    risks: [
      "Edge deployment constraints (limited compute, connectivity)",
      "Safety-critical failure modes requiring human oversight",
      "OT/IT integration complexity",
    ],
    recommendedModelIds: ["phi-4", "gemini-25-flash", "claude-sonnet-46"],
  },
  {
    industry: "Energy",
    task: "Forecasting",
    summary: "AI grid load forecasting and renewable yield prediction are critical to decarbonisation economics — improving asset utilisation and enabling smarter grid balancing.",
    modelTypes: [
      "Time-series and physics-informed neural networks",
      "LLMs for policy and regulatory document analysis",
      "Optimisation models for grid dispatch and storage",
    ],
    examples: [
      { company: "Google DeepMind", description: "Wind farm output prediction improving energy value by 20% in UK and US" },
      { company: "Siemens Energy",  description: "AI-based gas turbine optimisation and fault detection" },
      { company: "AutoGrid",        description: "AI demand response and distributed energy resource optimisation" },
      { company: "National Grid",   description: "ML forecasting for load balancing across the UK transmission network" },
    ],
    roiPotential: "high",
    risks: [
      "Grid stability implications if predictions are wrong",
      "Critical infrastructure cybersecurity requirements",
      "Regulatory approval timelines for grid-connected AI systems",
    ],
    recommendedModelIds: ["gemini-31-pro", "claude-opus-46", "llama33-70b"],
  },
  {
    industry: "Retail",
    task: "Decisioning",
    summary: "AI personalisation and dynamic pricing lift revenue 10–20% and reduce inventory waste 30% — Amazon's recommendation engine alone drives 35% of its revenue.",
    modelTypes: [
      "Recommendation engines for personalisation",
      "LLMs for pricing strategy and markdown optimisation",
      "Real-time inference models for in-session personalisation",
    ],
    examples: [
      { company: "Amazon",     description: "Real-time personalised recommendations driving 35% of revenue" },
      { company: "Stitch Fix", description: "AI-human hybrid styling — model recommends, stylist curates" },
      { company: "Target",     description: "AI inventory optimisation and markdown prediction across 2,000+ stores" },
      { company: "Zalando",    description: "AI-driven visual search and outfit completion engine" },
    ],
    roiPotential: "high",
    risks: [
      "Algorithmic price discrimination regulation (EU AI Act, FTC)",
      "Customer privacy under CCPA/GDPR",
      "Filter bubble effects on product discovery",
    ],
    recommendedModelIds: ["gemini-20-flash", "qwen35-397b", "llama33-70b"],
  },
];
