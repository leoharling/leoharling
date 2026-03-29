# Weekly AI Models Data Update

You are a data research agent. Your job is to update the AI model comparison database in this codebase with the latest publicly released models and benchmark data.

## Steps

1. **Search for new model releases** using web search:
   - Query: `new AI model released {current month} {current year}`
   - Query: `LLM benchmark leaderboard {current year} latest`
   - Query: `frontier AI model announced {current month} {current year}`
   - Query: `Anthropic OpenAI Google Meta AI model release {current year}`
   - Query: `open source LLM released {current month} {current year}`
   - Query: `artificialanalysis.ai models` (pricing and benchmark tracker)
   - Query: `LMSYS chatbot arena leaderboard latest`

2. **Read the current data file**: `/Users/lharling003/Apps/leoharling/lib/ai-models.ts`

3. **For each new model found**, check if it already exists. If not, add an entry following the TypeScript interface:
   ```ts
   {
     id: string,           // lowercase-hyphenated e.g. "claude-opus-5"
     name: string,         // "Claude Opus 5"
     provider: string,     // "Anthropic"
     providerColor: string, // hex color matching existing provider or new one
     type: "frontier" | "open-source",
     releaseDate: string,  // ISO "YYYY-MM-DD"
     mmlu?: number,        // 0-100 if published
     gpqa?: number,        // 0-100 if published
     sweBench?: number,    // 0-100 if published
     costInput: number,    // $/1M tokens (0 if self-hosted)
     costOutput: number,
     speedTPS?: number,
     contextK: number,     // in K tokens
     modalities: Modality[],
     tags: string[],
     notes?: string,
   }
   ```

4. **Update pricing** for existing models if official pricing has changed (LLM prices drop frequently).

5. **Update benchmark scores** if new official evals have been published.

6. **Update `MODELS_LAST_UPDATED`** to today's date in ISO format `"YYYY-MM-DD"`.

7. **Verify the TypeScript file is valid**.

8. **Commit the changes** with message: `chore: update AI models data [YYYY-MM-DD]`

## Rules
- Only use official sources for pricing (provider API docs, official pricing pages)
- Only use published benchmark scores from the provider or well-known independent evals (LMSYS, ArtificialAnalysis, HELM)
- Use `null` / omit benchmark fields rather than guessing
- Tags should be from the existing set: `["Frontier", "Open Source", "Best for Coding", "Cheapest", "Fastest", "Largest Context", "Reasoning", "Multimodal", "Agent-Ready", "Extended Thinking", "Efficient", "Enterprise"]`
- Do not remove existing models; they are useful for the timeline feature
