import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { getStoredApiKey } from "@/lib/llmByo";

interface Props {
  endpointUrl: string;
}

export default function LLMUsageInstructions({ endpointUrl }: Props) {
  const [copied, setCopied] = useState<"curl" | "python" | null>(null);
  const storedKey = getStoredApiKey();
  const keyForDisplay = storedKey
    ? `${storedKey.slice(0, 8)}...${storedKey.slice(-4)}`
    : "$YOUR_KEY";
  const keyForCopy = storedKey ?? "$YOUR_KEY";

  const curlExample = `curl -X POST ${endpointUrl} \\
  -H "X-Player-API-Key: ${keyForCopy}" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Hello, parrot."}'`;

  const curlDisplay = `curl -X POST ${endpointUrl} \\
  -H "X-Player-API-Key: ${keyForDisplay}" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Hello, parrot."}'`;

  const pythonExample = `import requests

resp = requests.post(
    "${endpointUrl}",
    headers={"X-Player-API-Key": ${storedKey ? `"${keyForCopy}"` : '"$YOUR_KEY"'}},
    json={"message": "Hello, parrot."},
)
print(resp.json())`;

  const copy = async (text: string, which: "curl" | "python") => {
    await navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <section className="mb-6 rounded-lg border border-amber-700/40 bg-stone-900/40 p-4 backdrop-blur-md">
      <h3 className="mb-2 font-display text-lg text-amber-200">
        How to Commune With the Familiar
      </h3>
      <p className="mb-3 font-body text-sm text-amber-300/80">
        Send POST requests to the challenge&apos;s{" "}
        <code className="text-amber-200">/chat</code> endpoint with your provider API key in the{" "}
        <code className="text-amber-200">X-Player-API-Key</code> header. The flag is hidden in the
        system prompt - only the right incantation will reveal it.
      </p>

      {!storedKey && (
        <p className="mb-3 font-body text-xs italic text-amber-500/70">
          (Provide a key above to see it pre-filled in the examples below.)
        </p>
      )}

      <div className="space-y-3">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="font-body text-xs uppercase tracking-wider text-amber-400/60">
              curl
            </span>
            <button
              onClick={() => copy(curlExample, "curl")}
              className="rounded border border-amber-700/40 px-2 py-0.5 font-body text-xs text-amber-300 hover:bg-amber-900/30"
            >
              <AnimatePresence mode="wait">
                {copied === "curl" ? (
                  <motion.span
                    key="ok"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Copied
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Copy
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
          <pre className="overflow-x-auto whitespace-pre rounded border border-amber-800/30 bg-stone-950/70 p-3 font-mono text-xs text-amber-100">
            {curlDisplay}
          </pre>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="font-body text-xs uppercase tracking-wider text-amber-400/60">
              Python
            </span>
            <button
              onClick={() => copy(pythonExample, "python")}
              className="rounded border border-amber-700/40 px-2 py-0.5 font-body text-xs text-amber-300 hover:bg-amber-900/30"
            >
              {copied === "python" ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="overflow-x-auto whitespace-pre rounded border border-amber-800/30 bg-stone-950/70 p-3 font-mono text-xs text-amber-100">
            {pythonExample}
          </pre>
        </div>
      </div>

      <p className="mt-3 font-body text-xs text-amber-500/50">
        Your key is never sent to this site&apos;s server, never logged, and is cleared when you close
        this tab.
      </p>
    </section>
  );
}
