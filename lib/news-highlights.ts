export type SignalType = "ai-launch" | "funding" | "defence";

export interface Highlight {
  type: SignalType;
  label: string;
}

interface SignalRule {
  type: SignalType;
  label: string;
  // High-confidence patterns (matching title alone is enough)
  titlePatterns: RegExp[];
  // Lower-confidence patterns (need title + snippet match, or multiple matches)
  keywords: RegExp[];
}

const SIGNAL_RULES: SignalRule[] = [
  {
    type: "ai-launch",
    label: "AI Model Launch",
    titlePatterns: [
      /\b(launch|release|announc|unveil|introduc|debut|open.?source)[a-z]*\b.*\b(model|AI|GPT|Claude|Gemini|Llama|Mistral|LLM|chatbot)\b/i,
      /\b(GPT|Claude|Gemini|Llama|Mistral|LLM|chatbot|model)\b.*\b(launch|release|announc|unveil|introduc|debut|open.?source)[a-z]*\b/i,
      /\bGPT-?\d/i,
      /\bClaude\s+\d/i,
      /\bGemini\s+(Ultra|Pro|Nano|\d)/i,
      /\bLlama\s+\d/i,
      /\bGrok[\s-]+\d/i,
      /\bnew\s+(AI|language)\s+model\b/i,
      /\bfoundation\s+model\b/i,
      /\bopen[\s-]?weights?\b/i,
    ],
    keywords: [
      /\b(benchmark|parameter|token|context.?window|fine.?tun|inference|training)\b/i,
      /\b(multimodal|vision|reasoning|agent|transformer)\b/i,
      /\b(state[\s-]of[\s-]the[\s-]art|SOTA|breakthrough)\b/i,
    ],
  },
  {
    type: "funding",
    label: "Funding Round",
    titlePatterns: [
      /\braises?\s+\$[\d,.]+\s*[BMK]/i,
      /\$[\d,.]+\s*[BMK]\s+(funding|round|raise|investment)/i,
      /\bSeries\s+[A-F]\b/i,
      /\bIPO\b/i,
      /\bunicorn\b/i,
      /\bacquires?\b.*\bfor\s+\$/i,
      /\b(acqui|merg)[a-z]+\b.*\$[\d,.]+\s*[BMK]/i,
    ],
    keywords: [
      /\bvaluation\b/i,
      /\bseed\s+round\b/i,
      /\bpre[\s-]?seed\b/i,
      /\bventure\s+capital\b/i,
      /\b(investor|funded|backing|capitali)[a-z]*\b/i,
      /\$[\d,.]+\s*(million|billion)\b/i,
    ],
  },
  {
    type: "defence",
    label: "Defence Activity",
    titlePatterns: [
      /\b(contract|deal|procurement|order)\b.*\$[\d,.]+/i,
      /\$[\d,.]+.*\b(contract|deal|procurement|order)\b/i,
      /\b(NATO|Pentagon|DOD|DARPA|AUKUS)\b.*\b(award|approv|sign|announc)[a-z]*\b/i,
      /\bmissile\s+(test|launch|defense|strike|deploy)/i,
      /\barms\s+(deal|sale|transfer|shipment)\b/i,
    ],
    keywords: [
      /\b(missile|drone|fighter|submarine|warship|tank|artillery)\b/i,
      /\b(deploy|mobiliz|escalat|sanction|embargo)[a-z]*\b/i,
      /\b(NATO|Pentagon|DOD|DARPA|AUKUS|military|defense|defence)\b/i,
      /\b(warfare|combat|strike|offensive|deterren)[a-z]*\b/i,
      /\b(weapons?\s+system|munition|ordnance|hypersonic)\b/i,
    ],
  },
];

export function detectHighlight(
  title: string,
  snippet: string
): Highlight | null {
  for (const rule of SIGNAL_RULES) {
    // Strong signal: title pattern match
    const titleMatch = rule.titlePatterns.some((p) => p.test(title));
    if (titleMatch) {
      return { type: rule.type, label: rule.label };
    }

    // Moderate signal: keyword in title + keyword in snippet
    const titleKeywordHits = rule.keywords.filter((p) => p.test(title)).length;
    const snippetKeywordHits = rule.keywords.filter((p) =>
      p.test(snippet)
    ).length;

    if (titleKeywordHits >= 1 && snippetKeywordHits >= 1) {
      return { type: rule.type, label: rule.label };
    }

    // Also match if title has 2+ keyword hits
    if (titleKeywordHits >= 2) {
      return { type: rule.type, label: rule.label };
    }
  }

  return null;
}
