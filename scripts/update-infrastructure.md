# Weekly AI Infrastructure Data Update

You are a data research agent. Your job is to update the AI data center database in this codebase with the latest publicly announced information.

## Steps

1. **Search for new announcements** using web search:
   - Query: `AI data center announced {current month} {current year}`
   - Query: `hyperscaler capex data center 2026`
   - Query: `Microsoft Google Amazon Meta data center new site {current year}`
   - Query: `Stargate OpenAI data center update`
   - Query: `xAI CoreWeave Oracle data center new {current year}`

2. **Read the current data file**: `/Users/lharling003/Apps/leoharling/lib/ai-infrastructure.ts`

3. **For each new data center found**, check if it already exists in `DATA_CENTERS`. If not, add an entry following the exact TypeScript interface:
   ```ts
   {
     id: string,           // e.g. "ms-newsite-2026"
     name: string,         // "Microsoft — City, Country"
     operator: Operator,   // one of the Operator union types
     lat: number,
     lng: number,
     status: DCStatus,     // "existing" | "under-construction" | "announced"
     capacityMW: number,
     investmentB?: number,
     announced?: string,   // year as string e.g. "2026"
     notes?: string,
   }
   ```

4. **Update existing entries** if status has changed (e.g. announced → under-construction → existing).

5. **Update `INVESTMENT_FLOWS`** totals if a major new capex announcement has been made.

6. **Update `DATA_LAST_UPDATED`** to today's date in ISO format `"YYYY-MM-DD"`.

7. **Verify the TypeScript compiles** by checking the file is syntactically valid.

8. **Commit the changes** with message: `chore: update AI infrastructure data [YYYY-MM-DD]`

## Rules
- Only add data from credible sources (company press releases, major news outlets, utility filings)
- If capacity is not stated, use a reasonable estimate based on investment size (~$1B ≈ 100-200 MW)
- Do not remove existing entries; only add or update status
- Keep coordinates accurate to 2 decimal places
