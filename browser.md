# Stagehand Browser Automation Integration Plan

## Documentation Analysis Summary

Based on the Stagehand documentation review:

### From Next.js Integration Docs
- **Installation**: `pnpm add @browserbasehq/stagehand @browserbasehq/sdk playwright zod`
- **Server Actions Pattern**: Use `"use server"` for browser automation functions
- **Browserbase Integration**: Optional but recommended for production (10 free sessions)
- **Component Structure**: Server actions + client components for UI
- **Local Mode**: Can run without Browserbase using local browser instances
- **Runtime Requirements**: Node.js 20+ recommended

### From Custom LLMs Docs  
- **Supported Models**: GPT-4o, Claude 3.5 Sonnet, Gemini 2.0 Flash, and more
- **Requirements**: Models must support structured outputs
- **Cost Optimization**: Multiple provider options for different cost/performance needs

## Step-by-Step Implementation Plan

### Phase 1: Setup and Dependencies

#### 1.1 Install Required Packages
```bash
# Core Stagehand packages
pnpm add @browserbasehq/stagehand @browserbasehq/sdk playwright zod

```

#### 1.2 Environment Configuration
```env
# LLM Provider (choose one - REQUIRED)
OPENAI_API_KEY=your_key
ANTHROPIC_API_KEY=your_key  
GOOGLE_API_KEY=your_key

# Browserbase (OPTIONAL - for enhanced features)
BROWSERBASE_API_KEY=your_key  # Optional
BROWSERBASE_PROJECT_ID=your_project_id  # Optional

# Feature flags
USE_STAGEHAND_SCRAPER=false
STAGEHAND_USE_BROWSERBASE=false  # Set to true if you want Browserbase
```

### Phase 2: Core Service Implementation

#### 2.1 Stagehand Configuration Service
**File**: `src/lib/stagehand/config.ts`

#### 2.2 Enhanced Scraper Service  
**File**: `src/services/elal-stagehand-scraper.service.ts`

Key features:
- Natural language element interaction
- Structured data extraction with Zod schemas
- Hebrew content optimization
- Action caching for cost reduction

### Phase 3: Server Actions Integration

#### 3.1 Main Stagehand Functions
**File**: `src/app/stagehand/main.ts`

Following the documented pattern:
- `runStagehandScraper()` - Core scraping logic
- `startBrowserbaseSession()` - Debug session management


### Phase 5: Enhanced Features

#### 5.1 Multi-LLM Support
Based on documentation, implement support for:
- OpenAI GPT-4o (highest accuracy)
- Claude 3.5 Sonnet (excellent reasoning)
- Gemini 2.0 Flash (cost-effective)

#### 5.2 Advanced Stagehand Features
- **Vision Mode**: Use `useVision: true` for complex Hebrew layouts that are hard to parse with DOM alone
- **Action Caching**: Implement `actWithCache()` to avoid redundant LLM calls
- **Observe Pattern**: Use `observe()` to plan actions before executing them
- **Atomic Instructions**: Follow best practices with atomic, single-purpose instructions

## Key Advantages Over Current Playwright Implementation

### 1. Natural Language Resilience
**Current**: Brittle CSS selectors that break with DOM changes
**Stagehand**: Natural language instructions that adapt to UI changes

### 2. Structured Extraction
**Current**: Manual DOM parsing
**Stagehand**: AI-powered structured data extraction with schemas

### 3. Hebrew Content Excellence
**Current**: Basic text extraction
**Stagehand**: Context-aware Hebrew content processing

### 4. Maintenance Reduction
**Current**: Frequent selector updates needed
**Stagehand**: Self-adapting automation logic

### 5. Vercel-Optimized
**Current**: Standard Playwright deployment
**Stagehand**: Built-in Vercel deployment support with optimized serverless functions

### 6. Vision Capabilities
**Current**: Text-only DOM parsing
**Stagehand**: Optional vision mode using `useVision: true` for complex layouts

## Implementation Timeline

- **Week 1**: Core setup, basic scraper implementation
- **Week 2**: Server actions, API integration, testing
- **Week 3**: Feature flags, comparison testing, monitoring
- **Week 4**: Production deployment with gradual rollout

## Success Metrics

1. **Reliability**: Reduced DOM change failures
2. **Quality**: Better Hebrew content extraction
3. **Maintainability**: Less brittle automation code
4. **Performance**: Optimized LLM usage through caching
5. **Cost**: Controlled API usage with monitoring

This plan transforms the current Playwright scraper into a robust, AI-powered solution that's particularly effective for Hebrew content and dynamic web applications.

## Vercel Deployment Considerations

### Runtime and Performance
- **Node.js Runtime**: Stagehand requires Node.js 20+ (Bun not supported due to Playwright dependency)
- **Function Timeout**: Vercel Pro plan recommended for longer scraping operations (up to 5 minutes vs 10 seconds on Hobby)
- **Memory Allocation**: Increase serverless function memory for browser operations (1024MB recommended)

### Deployment Options
```bash
# Option 1: Quick deploy with Stagehand template
npx create-browser-app --example deploy-vercel
npx vercel deploy

# Option 2: Manual integration to existing Next.js project
pnpm add @browserbasehq/stagehand @browserbasehq/sdk playwright zod
```

### Environment Variables for Vercel
```env
# Required: LLM API Key
OPENAI_API_KEY=sk-...
# or
ANTHROPIC_API_KEY=sk-ant-...

# Optional: Browserbase (recommended for production)
BROWSERBASE_API_KEY=bb_...
BROWSERBASE_PROJECT_ID=...

# Feature flags
USE_STAGEHAND_SCRAPER=true
STAGEHAND_USE_BROWSERBASE=true  # Use Browserbase on Vercel for reliability
```

### Serverless Function Optimization
- Keep browser sessions short to avoid timeouts
- Use Browserbase for production to avoid cold start browser initialization
- Implement proper error handling for function timeouts
- Consider caching frequently used actions to reduce execution time

### Best Practices for El Al Scraper on Vercel
- Use Browserbase in production (local browser not reliable in serverless)
- Implement timeout handling for cron jobs
- Monitor function execution time and optimize accordingly
- Use vision mode sparingly to control costs 