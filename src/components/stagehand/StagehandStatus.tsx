"use client";

import { useState } from "react";

export function StagehandStatus() {
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState<'ready' | 'missing-key' | null>(null);

  const checkStatus = () => {
    setIsChecking(true);
    const hasLLM = !!process.env.ANTHROPIC_API_KEY || 
                     typeof window !== 'undefined' && 
                     document.cookie.includes('anthropic-configured=true');
    
    setTimeout(() => {
      setStatus(hasLLM ? 'ready' : 'missing-key');
      setIsChecking(false);
    }, 500);
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">🎬 Stagehand Status</h3>
        <button 
          onClick={checkStatus}
          disabled={isChecking}
          className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50 text-sm"
        >
          {isChecking ? 'Checking...' : 'Check Status'}
        </button>
      </div>

      {status && (
        <div className={`flex items-center gap-2 ${status === 'ready' ? 'text-green-600' : 'text-red-600'}`}>
          <span>{status === 'ready' ? '✅' : '❌'}</span>
          <span className="font-medium">
            {status === 'ready' ? 'Ready to use' : 'OpenAI API key required'}
          </span>
        </div>
      )}

      {!status && !isChecking && (
        <p className="text-gray-600 text-sm">
          Click &quot;Check Status&quot; to verify setup
        </p>
      )}
    </div>
  );
} 