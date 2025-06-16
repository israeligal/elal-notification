export function createStagehandConfig() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is required');
  }

  return {
    env: "LOCAL" as const,
    modelName: "claude-3-5-sonnet-latest",
    modelClientOptions: { apiKey },
    verbose: 1 as 0 | 1 | 2,
    headless: true,
    disablePino: true
  };
} 