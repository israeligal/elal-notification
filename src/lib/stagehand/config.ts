// Stagehand configuration types and utilities

export interface StagehandConfig {
  modelName: string;
  modelClientOptions: {
    apiKey?: string;
  };
  env: "BROWSERBASE" | "LOCAL";
  apiKey?: string;
  projectId?: string;
  verbose: 0 | 1 | 2;
  disablePino?: boolean;
}

export function createStagehandConfig(): StagehandConfig {
  // Determine which LLM to use based on available keys
  let modelName = "gpt-4o";
  let apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey && process.env.ANTHROPIC_API_KEY) {
    modelName = "claude-3-haiku-latest";
    apiKey = process.env.ANTHROPIC_API_KEY;
  } else if (!apiKey && process.env.GOOGLE_API_KEY) {
    modelName = "gemini-2.0-flash";
    apiKey = process.env.GOOGLE_API_KEY;
  }

  if (!apiKey) {
    throw new Error(
      'No LLM API key found. Please set OPENAI_API_KEY, ANTHROPIC_API_KEY, or GOOGLE_API_KEY in your environment variables.'
    );
  }

  // Use Browserbase only if explicitly enabled and configured
  const useBrowserbase = process.env.STAGEHAND_USE_BROWSERBASE === 'true' 
    && process.env.BROWSERBASE_API_KEY 
    && process.env.BROWSERBASE_PROJECT_ID;

  return {
    modelName,
    modelClientOptions: { apiKey },
    env: useBrowserbase ? "BROWSERBASE" : "LOCAL",
    ...(useBrowserbase && {
      apiKey: process.env.BROWSERBASE_API_KEY,
      projectId: process.env.BROWSERBASE_PROJECT_ID,
    }),
    verbose: 1,
    disablePino: true,
  };
}

export function getStagehandModelInfo(): {
  modelName: string;
  provider: string;
  hasApiKey: boolean;
} {
  const openAI = !!process.env.OPENAI_API_KEY;
  const anthropic = !!process.env.ANTHROPIC_API_KEY;
  const google = !!process.env.GOOGLE_API_KEY;

  if (openAI) {
    return { modelName: "gpt-4o", provider: "OpenAI", hasApiKey: true };
  } else if (anthropic) {
    return { modelName: "claude-3-5-sonnet-latest", provider: "Anthropic", hasApiKey: true };
  } else if (google) {
    return { modelName: "gemini-2.0-flash", provider: "Google", hasApiKey: true };
  }

  return { modelName: "none", provider: "none", hasApiKey: false };
} 