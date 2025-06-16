# 🎬 Stagehand Integration Setup

This guide covers setting up Stagehand AI browser automation for the El Al notification scraper.

## Prerequisites

- Node.js 20+
- One of: OpenAI, Anthropic, or Google API key
- (Optional) Browserbase account for production

## Quick Setup

### 1. Environment Configuration

Add to your `.env.local`:

```env
# Required: Choose ONE LLM provider
OPENAI_API_KEY="sk-..."              # Recommended
# OR
ANTHROPIC_API_KEY="sk-ant-..."       # Alternative  
# OR
GOOGLE_API_KEY="..."                 # Alternative

# Optional: Browserbase for production
BROWSERBASE_API_KEY="bb_..."
BROWSERBASE_PROJECT_ID="..."

# Feature flags (gradual rollout)
USE_STAGEHAND_SCRAPER=false          # Set to true to enable
STAGEHAND_USE_BROWSERBASE=false      # Set to true for production
STAGEHAND_FALLBACK=true              # Enable fallback to Playwright
ENABLE_SCRAPER_COMPARISON=false      # Enable A/B testing
ENABLE_STAGEHAND_CACHING=true        # Enable action caching
ENABLE_STAGEHAND_VISION=false        # Enable vision mode for complex layouts
```

### 2. Enable Stagehand

```env
USE_STAGEHAND_SCRAPER=true
```

### 3. Test Configuration

The monitoring service will automatically use Stagehand when enabled. Monitor logs for:

```
🚩 Scraper Feature Flags: { useStagehandScraper: true, ... }
✅ Stagehand scraper initialized successfully
```

## LLM Provider Options

| Provider   | Model                     | Best For              | Cost  |
|------------|---------------------------|-----------------------|-------|
| OpenAI     | gpt-4o                   | Highest accuracy      | $$    |
| Anthropic  | claude-3-5-sonnet-latest | Complex reasoning     | $$    |
| Google     | gemini-2.0-flash         | Speed & cost          | $     |

## Deployment Considerations

### Local Development
- Use `STAGEHAND_USE_BROWSERBASE=false`
- Playwright browser runs locally
- Suitable for development and testing

### Production (Vercel)
- Use `STAGEHAND_USE_BROWSERBASE=true`
- Requires Browserbase account (10 free sessions)
- More reliable in serverless environment
- Better stealth mode and captcha handling

### Feature Flag Strategy

1. **Development**: `USE_STAGEHAND_SCRAPER=false` (Playwright only)
2. **Testing**: `ENABLE_SCRAPER_COMPARISON=true` (A/B test both)
3. **Gradual Rollout**: `USE_STAGEHAND_SCRAPER=true` + `STAGEHAND_FALLBACK=true`
4. **Full Deployment**: `USE_STAGEHAND_SCRAPER=true` + `STAGEHAND_FALLBACK=false`

## Key Features

### Natural Language Automation
- Adapts to website changes automatically
- Better Hebrew content handling
- Reduced maintenance overhead

### Enhanced Data Extraction
- Structured data with importance levels
- Category classification
- Better metadata collection

### Vision Mode (Optional)
- Use `ENABLE_STAGEHAND_VISION=true`
- Helpful for complex Hebrew layouts
- Higher cost but better accuracy

### Action Caching
- Reduces LLM API calls
- Improves performance
- Automatically enabled

## Monitoring and Logs

Look for these log entries:
- `Using Stagehand scraper` - Feature flag activated
- `Stagehand scraper initialized successfully` - Configuration valid
- `Successfully extracted El Al updates with Stagehand` - Scraping completed
- `Falling back to Playwright scraper` - Fallback triggered

## Troubleshooting

### Common Issues

1. **"No LLM API key found"**
   - Set one of: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`

2. **Timeout in production**
   - Enable Browserbase: `STAGEHAND_USE_BROWSERBASE=true`
   - Increase Vercel function timeout (Pro plan)

3. **High costs**
   - Disable vision mode: `ENABLE_STAGEHAND_VISION=false`
   - Use cheaper model (Gemini)
   - Ensure caching is enabled

4. **Inconsistent results**
   - Enable comparison mode: `ENABLE_SCRAPER_COMPARISON=true`
   - Check logs for discrepancies
   - Consider vision mode for complex layouts

### Debug Steps

1. Check configuration:
   ```bash
   # Look for Stagehand status in logs
   tail -f logs/app.log | grep -i stagehand
   ```

2. Test cron job:
   ```bash
   npm run test:cron
   ```

3. Enable fallback if issues:
   ```env
   STAGEHAND_FALLBACK=true
   ```

## Production Checklist

- [ ] LLM API key configured
- [ ] Browserbase credentials set (recommended)
- [ ] `USE_STAGEHAND_SCRAPER=true`
- [ ] `STAGEHAND_USE_BROWSERBASE=true` (production)
- [ ] `STAGEHAND_FALLBACK=true` (safety)
- [ ] Monitor logs for proper functioning
- [ ] Verify cron job execution
- [ ] Check costs and usage

## Cost Management

- **Action Caching**: Automatically reduces repeat LLM calls
- **Vision Mode**: Use sparingly (higher cost)
- **Model Selection**: Gemini < Claude < GPT-4o (cost/quality)
- **Monitoring**: Track API usage in provider dashboards

This integration provides a more robust, AI-powered scraping solution that's particularly effective for Hebrew content and dynamic websites. 