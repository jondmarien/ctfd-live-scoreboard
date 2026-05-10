const KEY_STORAGE = "llm_byo_key";
const PROVIDER_STORAGE = "llm_byo_provider";
const MODEL_STORAGE = "llm_byo_model";

export function getStoredKey(): { provider: string; model: string; apiKey: string } | null {
  const provider = sessionStorage.getItem(PROVIDER_STORAGE);
  const model = sessionStorage.getItem(MODEL_STORAGE);
  const apiKey = sessionStorage.getItem(KEY_STORAGE);
  if (!provider || !model || !apiKey) return null;
  return { provider, model, apiKey };
}

export function setStoredProvider(value: string): void {
  sessionStorage.setItem(PROVIDER_STORAGE, value);
}

export function setStoredModel(value: string): void {
  sessionStorage.setItem(MODEL_STORAGE, value);
}

export function setStoredApiKey(value: string): void {
  if (value) {
    sessionStorage.setItem(KEY_STORAGE, value);
  } else {
    sessionStorage.removeItem(KEY_STORAGE);
  }
}

export function clearStoredApiKey(): void {
  sessionStorage.removeItem(KEY_STORAGE);
}

export function getStoredProvider(): string | null {
  return sessionStorage.getItem(PROVIDER_STORAGE);
}

export function getStoredModel(): string | null {
  return sessionStorage.getItem(MODEL_STORAGE);
}

export function getStoredApiKey(): string | null {
  return sessionStorage.getItem(KEY_STORAGE);
}
