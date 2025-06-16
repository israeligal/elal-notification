"use client";

import { useState } from "react";
import { checkStagehandConfig } from "@/app/stagehand/main";

interface StagehandConfig {
  success: boolean;
  modelInfo?: {
        modelName: string;
    provider: string;
    hasApiKey: boolean;
  };
  config?: {
    modelName: string;
    env: string;
    hasBrowserbase: boolean;
    verbose: number;
  };
  error?: string;
  timestamp: string;
}

export function StagehandStatus() {
  const [config, setConfig] = useState<StagehandConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkConfig = async () => {
    setIsLoading(true);
    try {
      const result = await checkStagehandConfig();
      setConfig(result);
    } catch (error) {
      setConfig({
        success: false,
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">🎬 Stagehand Status</h3>
        <button 
          onClick={checkConfig}
          disabled={isLoading}
          className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50 text-sm"
        >
          {isLoading ? 'Checking...' : 'Check Config'}
        </button>
      </div>

      {config && (
        <div className="space-y-3">
          <div className={`flex items-center gap-2 ${config.success ? 'text-green-600' : 'text-red-600'}`}>
            <span>{config.success ? '✅' : '❌'}</span>
            <span className="font-medium">
              {config.success ? 'Configuration Valid' : 'Configuration Error'}
            </span>
          </div>

          {config.success && config.modelInfo && config.config && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>LLM Provider:</strong> {config.modelInfo.provider}
              </div>
              <div>
                <strong>Model:</strong> {config.modelInfo.modelName}
              </div>
              <div>
                <strong>Environment:</strong> {config.config.env}
              </div>
              <div>
                <strong>Browserbase:</strong> {config.config.hasBrowserbase ? 'Available' : 'Not configured'}
              </div>
            </div>
          )}

          {config.error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              <strong>Error:</strong> {config.error}
            </div>
          )}

          <div className="text-xs text-gray-500">
            Last checked: {new Date(config.timestamp).toLocaleString()}
          </div>
        </div>
      )}

      {!config && !isLoading && (
        <p className="text-gray-600 text-sm">
          Click &quot;Check Config&quot; to verify your Stagehand setup
        </p>
      )}
    </div>
  );
} 