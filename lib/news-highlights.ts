export type SignalType =
  | "breakthrough"
  | "launch"
  | "ai-launch"
  | "biotech"
  | "energy"
  | "funding"
  | "defence";

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
  // ── Breakthrough: transformational, first-of-kind achievements ──
  {
    type: "breakthrough",
    label: "Breakthrough",
    titlePatterns: [
      /\b(first[\s-]ever|world[\s']?s?\s+first|historic|unprecedented)\b.*\b(achiev|demonstrat|flight|test|mission|mileston)/i,
      /\bbreakthrough\b.*\b(technolog|discover|achiev|demonstrat|result|fusion|quantum)/i,
      /\b(technolog|discover|achiev|demonstrat|result)\b.*\bbreakthrough\b/i,
      /\bfirst[\s-]of[\s-]its[\s-]kind\b/i,
      /\bworld[\s-]record\b/i,
      /\b(proof[\s-]of[\s-]concept|first[\s-]successful)\b/i,
      /\bNobel\s+Prize\b/i,
    ],
    keywords: [
      /\b(breakthrough|revolutionary|transformational|paradigm[\s-]shift|game[\s-]chang)/i,
      /\b(first[\s-]time|never[\s-]before|unprecedented|milestone)\b/i,
      /\b(discover|demonstrat|achiev|pioneer|invent)[a-z]*\b/i,
      /\b(novel|groundbreaking|state[\s-]of[\s-]the[\s-]art|SOTA)\b/i,
    ],
  },

  // ── Space Launch / Mission ──
  {
    type: "launch",
    label: "Launch / Mission",
    titlePatterns: [
      /\b(launch|liftoff|lift[\s-]off)\b.*\b(success|orbit|ISS|moon|Mars|mission)/i,
      /\b(success|orbit|ISS|moon|Mars|mission)\b.*\b(launch|liftoff)\b/i,
      /\b(SpaceX|Falcon|Starship|SLS|Ariane|Soyuz|Long\s+March|Electron|New\s+Glenn)\b.*\b(launch|flight|mission)\b/i,
      /\bfirst[\s-]flight\b/i,
      /\bmaiden[\s-](flight|voyage|launch)\b/i,
      /\b(land|dock|berth|splashdown|reentry|re[\s-]entry)\b.*\b(success|ISS|moon|capsule|booster)\b/i,
      /\b(Artemis|Apollo|Chandrayaan|Chang'?e|Europa\s+Clipper|JWST|Webb)\b.*\b(launch|mission|arriv|orbit)\b/i,
      /\bcrewed?\s+(mission|flight|launch)\b/i,
    ],
    keywords: [
      /\b(launch|orbit|payload|booster|rocket|spacecraft)\b/i,
      /\b(NASA|ESA|ISRO|JAXA|CNSA|SpaceX|Blue\s+Origin|Rocket\s+Lab)\b/i,
      /\b(LEO|GTO|GEO|cislunar|lunar|interplanetary)\b/i,
      /\b(satellite|constellation|deploy|docking|rendezvous)\b/i,
    ],
  },

  // ── AI Model / Capability Launch ──
  {
    type: "ai-launch",
    label: "AI Milestone",
    titlePatterns: [
      /\b(launch|release|announc|unveil|introduc|debut|open[\s-]?source)[a-z]*\b.*\b(model|AI|GPT|Claude|Gemini|Llama|Mistral|LLM|chatbot)\b/i,
      /\b(GPT|Claude|Gemini|Llama|Mistral|LLM|chatbot|model)\b.*\b(launch|release|announc|unveil|introduc|debut|open[\s-]?source)[a-z]*\b/i,
      /\bGPT[\s-]?\d/i,
      /\bClaude\s+\d/i,
      /\bGemini\s+(Ultra|Pro|Nano|Flash|\d)/i,
      /\bLlama\s+\d/i,
      /\bGrok[\s-]+\d/i,
      /\bnew\s+(AI|language)\s+model\b/i,
      /\bfoundation\s+model\b/i,
      /\bopen[\s-]?weights?\b/i,
      /\bAGI\b/i,
      /\b(general|artificial)\s+intelligence\b.*\b(achiev|demonstrat|milestone)\b/i,
      /\b(humanoid|autonomous)\s+robot\b.*\b(debut|launch|demonstrat|first)\b/i,
    ],
    keywords: [
      /\b(benchmark|parameter|token|context[\s-]?window|fine[\s-]?tun|inference|training)\b/i,
      /\b(multimodal|vision|reasoning|agent|transformer)\b/i,
      /\b(state[\s-]of[\s-]the[\s-]art|SOTA|breakthrough)\b/i,
      /\b(robotics?|locomotion|manipulation|autonomous)\b/i,
      /\b(machine[\s-]learning|neural|deep[\s-]learning)\b/i,
    ],
  },

  // ── Biotech / Health ──
  {
    type: "biotech",
    label: "Biotech Signal",
    titlePatterns: [
      /\bFDA\b.*\b(approv|clear|authoriz|fast[\s-]?track|breakthrough[\s-]?therap)/i,
      /\b(approv|clear|authoriz)\b.*\bFDA\b/i,
      /\bPhase\s+(I{1,3}|[123])\b.*\b(result|data|success|trial|positive|met[\s-]?endpoint)\b/i,
      /\b(result|data|success|trial|positive)\b.*\bPhase\s+(I{1,3}|[123])\b/i,
      /\b(gene[\s-]?therap|gene[\s-]?edit|CRISPR|mRNA|CAR[\s-]?T)\b.*\b(approv|cure|success|breakthrough|first)\b/i,
      /\bfirst[\s-]?(in[\s-]?human|in[\s-]?class|ever)\b.*\b(drug|therap|treatment|cure|vaccin)\b/i,
      /\b(cure|eradicat|eliminat)[a-z]*\b.*\b(disease|cancer|virus|infection)\b/i,
      /\bnew\s+drug\b/i,
      /\b(longevity|life[\s-]?extension|aging|ageing)\b.*\b(breakthrough|trial|result|drug)\b/i,
    ],
    keywords: [
      /\b(genomic|sequencing|proteomics?|CRISPR|mRNA|antibod|biosimilar)\b/i,
      /\b(clinical[\s-]?trial|endpoint|efficacy|biomarker|therapeutic)\b/i,
      /\b(FDA|EMA|NIH|pharma|biopharm|drug[\s-]?discovery)\b/i,
      /\b(cancer|oncology|immuno[\s-]?therapy|neurodegenerative|rare[\s-]?disease)\b/i,
      /\b(gene[\s-]?therap|cell[\s-]?therap|precision[\s-]?medicine|personali[sz]ed)\b/i,
      /\b(longevity|senescent|telomere|epigenetic|healthspan|lifespan)\b/i,
    ],
  },

  // ── Energy ──
  {
    type: "energy",
    label: "Energy Signal",
    titlePatterns: [
      /\bfusion\b.*\b(breakthrough|ignition|net[\s-]?energy|milestone|first|record|achiev|power)\b/i,
      /\b(breakthrough|ignition|net[\s-]?energy|milestone|first|record)\b.*\bfusion\b/i,
      /\bnuclear\b.*\b(reactor|plant|approv|licens|SMR|commission|first[\s-]?power)\b/i,
      /\b(solar|wind|battery|storage)\b.*\b(record|breakthrough|cheapest|milestone)\b/i,
      /\b(grid[\s-]?scale|utility[\s-]?scale)\b.*\b(battery|storage|first)\b/i,
      /\b(hydrogen|geothermal|thorium)\b.*\b(breakthrough|plant|first|commercial)\b/i,
      /\b(small[\s-]?modular|SMR)\s+reactor\b/i,
      /\benergy\s+cost\b.*\b(record|lowest|decline|plummet|drop)\b/i,
    ],
    keywords: [
      /\b(fusion|fission|nuclear|reactor|enrichment|isotope)\b/i,
      /\b(solar|photovoltaic|wind|geothermal|hydrogen|thorium)\b/i,
      /\b(battery|energy[\s-]?storage|grid|megawatt|gigawatt|terawatt)\b/i,
      /\b(clean[\s-]?energy|renewable|decarboni[sz]|net[\s-]?zero|emission)\b/i,
      /\b(LCOE|levelized|capacity[\s-]?factor|efficiency)\b/i,
    ],
  },

  // ── Funding / Venture ──
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
      /\bSPAC\b.*\b(merg|deal|acqui)/i,
      /\bdecacorn\b/i,
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

  // ── Defence ──
  {
    type: "defence",
    label: "Defence Activity",
    titlePatterns: [
      /\b(contract|deal|procurement|order)\b.*\$[\d,.]+/i,
      /\$[\d,.]+.*\b(contract|deal|procurement|order)\b/i,
      /\b(NATO|Pentagon|DOD|DARPA|AUKUS)\b.*\b(award|approv|sign|announc)[a-z]*\b/i,
      /\bmissile\s+(test|launch|defense|defence|strike|deploy)/i,
      /\barms\s+(deal|sale|transfer|shipment)\b/i,
      /\bhypersonic\b.*\b(test|flight|weapon|missile)\b/i,
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
