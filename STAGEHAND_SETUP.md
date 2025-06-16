# 🎬 Stagehand Setup

Simple AI browser automation for El Al scraping.

## Quick Setup

### 1. Add OpenAI API Key

Add to your `.env.local`:

```env
OPENAI_API_KEY="sk-..."
```

### 2. Enable Stagehand

```env
USE_STAGEHAND_SCRAPER=true
```

That's it! 🎉

## How It Works

- **Local Browser**: Runs Playwright locally (no external services)
- **OpenAI GPT-4o**: Powers the AI scraping
- **Hebrew Support**: Optimized for RTL content
- **Simple**: No complex configuration needed

## Usage

The monitoring service will automatically use Stagehand when `USE_STAGEHAND_SCRAPER=true`.

## Troubleshooting

**"OPENAI_API_KEY is required"**
- Add your OpenAI API key to `.env.local`

**Slow performance**
- Normal for first run (browser startup)
- Subsequent runs are faster

**Hebrew text issues**
- Stagehand handles RTL automatically
- No additional configuration needed 