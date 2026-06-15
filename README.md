# Crunchbase company tracker

Tracks a list of companies on Crunchbase and shows each one's key fields on a dashboard. This is the runnable version of **Use case 4** from the [brightdata-scrape Kiro Power](https://github.com/brightdata/kiro-powers) guide.

One MCP call to Bright Data's [Web MCP server](https://brightdata.com/ai/mcp-server) returns around 90 fields per company, such as rank, employee count, and growth and funding signals.

## Run it

```bash
npm install
cp .env.example .env.local   # paste your Bright Data token into BRIGHTDATA_API_KEY
npm run dev                  # open http://localhost:3000
```

You need a Bright Data token with **Pro mode** on ([pricing](https://brightdata.com/pricing/mcp-server)); the `web_data_*` tools aren't free. Pro is already wired into the code, so it works as soon as your account has it. The first scrape takes up to a minute.

## Good to know

- Your token stays local. `.env*` is gitignored, so it's never committed.
- Crunchbase data is licensed. Check that your use follows their terms, and prefer the official API where you can.
