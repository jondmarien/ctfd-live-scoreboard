import { useEffect, useMemo, useState } from "react";
import {
  clearStoredApiKey,
  getStoredApiKey,
  getStoredModel,
  getStoredProvider,
  setStoredApiKey,
  setStoredModel,
  setStoredProvider,
} from "@/lib/llmByo";

const PROVIDERS = [
  { id: "openai", label: "OpenAI", defaultModel: "gpt-4o-mini" },
  { id: "anthropic", label: "Anthropic", defaultModel: "claude-haiku-4-5" },
  { id: "gemini", label: "Google Gemini", defaultModel: "gemini-2.5-flash" },
  {
    id: "openrouter",
    label: "OpenRouter",
    defaultModel: "openrouter/anthropic/claude-haiku-4-5",
  },
];

export default function BYOKeyForm() {
  const [provider, setProvider] = useState(() => getStoredProvider() ?? "openai");
  const providerDefaultModel = useMemo(
    () => PROVIDERS.find((p) => p.id === provider)?.defaultModel ?? "",
    [provider],
  );
  const [model, setModel] = useState(() => getStoredModel() ?? providerDefaultModel);
  const [apiKey, setApiKey] = useState(() => getStoredApiKey() ?? "");

  useEffect(() => setStoredProvider(provider), [provider]);
  useEffect(() => setStoredModel(model), [model]);
  useEffect(() => setStoredApiKey(apiKey), [apiKey]);

  const clear = () => {
    clearStoredApiKey();
    setApiKey("");
  };

  return (
    <div className="mb-4 rounded-lg border-2 border-amber-700/40 bg-stone-900/40 p-4 backdrop-blur-md">
      <h3 className="mb-2 font-quintessential text-lg text-amber-200">Provide a Familiar's Key</h3>
      <p className="mb-3 font-medievalsharp text-xs text-amber-500/70">
        Your API key stays in this browser tab only. Cleared when you close the tab.
        Never logged, never persisted, never echoed.
      </p>

      <div className="grid gap-3">
        <label className="block">
          <span className="mb-1 block font-medievalsharp text-xs uppercase tracking-wider text-amber-400/70">
            Provider
          </span>
          <select
            value={provider}
            onChange={(e) => {
              const nextProvider = e.target.value;
              setProvider(nextProvider);
              setModel((current) => {
                if (current.trim()) return current;
                return PROVIDERS.find((p) => p.id === nextProvider)?.defaultModel ?? "";
              });
            }}
            className="w-full rounded border border-amber-700/40 bg-stone-950/70 px-3 py-2 font-medievalsharp text-amber-100"
          >
            {PROVIDERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block font-medievalsharp text-xs uppercase tracking-wider text-amber-400/70">
            Model
          </span>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full rounded border border-amber-700/40 bg-stone-950/70 px-3 py-2 font-mono text-sm text-amber-100"
            placeholder={providerDefaultModel}
          />
        </label>

        <label className="block">
          <span className="mb-1 block font-medievalsharp text-xs uppercase tracking-wider text-amber-400/70">
            API Key
          </span>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1 rounded border border-amber-700/40 bg-stone-950/70 px-3 py-2 font-mono text-sm text-amber-100"
              placeholder="sk-..."
              autoComplete="off"
              spellCheck={false}
            />
            {apiKey && (
              <button
                type="button"
                onClick={clear}
                className="rounded border border-amber-700/30 px-3 py-2 font-medievalsharp text-xs text-amber-400/70 hover:text-amber-300"
              >
                Clear
              </button>
            )}
          </div>
        </label>
      </div>
    </div>
  );
}
