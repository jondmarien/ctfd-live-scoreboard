export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

export type LogContext = Record<string, unknown>;

interface LoggerConfig {
  service: string;
  environment: string;
  level: LogLevel;
  redactKeys: string[];
}

interface LogPayload {
  timestamp: string;
  level: LogLevel;
  service: string;
  environment: string;
  namespace: string;
  message: string;
  context?: LogContext;
  data?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
    cause?: unknown;
  };
  durationMs?: number;
}

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
};

const DEFAULT_REDACT_KEYS = [
  "authorization",
  "cookie",
  "set-cookie",
  "password",
  "token",
  "apiKey",
  "apikey",
  "secret",
  "provided",
  "flag",
];

const runtimeProcess = (
  globalThis as { process?: { env?: Record<string, string | undefined> } }
).process;
const runtimeEnv = runtimeProcess?.env?.NODE_ENV;
const viteEnv =
  typeof import.meta !== "undefined" &&
  (import.meta as { env?: Record<string, unknown> }).env
    ? ((import.meta as { env?: Record<string, unknown> }).env as Record<
        string,
        unknown
      >)
    : undefined;

const initialLevelValue =
  runtimeProcess?.env?.LOG_LEVEL ||
  runtimeProcess?.env?.CTFD_LOG_LEVEL ||
  (viteEnv?.VITE_LOG_LEVEL as string | undefined) ||
  "info";

const initialLevel = (
  ["trace", "debug", "info", "warn", "error", "fatal"] as LogLevel[]
).includes(initialLevelValue as LogLevel)
  ? (initialLevelValue as LogLevel)
  : "info";

const config: LoggerConfig = {
  service: "ctfd-live-scoreboard",
  environment:
    runtimeProcess?.env?.VERCEL_ENV ||
    runtimeProcess?.env?.NODE_ENV ||
    (viteEnv?.MODE as string | undefined) ||
    "development",
  level: initialLevel,
  redactKeys: [...DEFAULT_REDACT_KEYS],
};

export function configureLogger(partial: Partial<LoggerConfig>): void {
  if (partial.service) config.service = partial.service;
  if (partial.environment) config.environment = partial.environment;
  if (partial.level) config.level = partial.level;
  if (partial.redactKeys) config.redactKeys = [...partial.redactKeys];
}

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[config.level];
}

function redactValue(value: unknown): unknown {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((item) => redactValue(item));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    const key = k.toLowerCase();
    if (config.redactKeys.includes(key)) {
      out[k] = "[REDACTED]";
      continue;
    }
    out[k] = redactValue(v);
  }
  return out;
}

function serializeError(error: unknown): LogPayload["error"] | undefined {
  if (!(error instanceof Error)) return undefined;
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
    cause: redactValue(error.cause),
  };
}

function emit(payload: LogPayload): void {
  const safePayload = redactValue(payload) as LogPayload;
  const isDev =
    config.environment === "development" ||
    runtimeEnv === "development" ||
    viteEnv?.DEV === true;
  const hasBrowserWindow =
    typeof globalThis !== "undefined" && "window" in globalThis;

  if (isDev && hasBrowserWindow) {
    const prefix = `[${safePayload.level.toUpperCase()}][${safePayload.namespace}]`;
    if (safePayload.level === "error" || safePayload.level === "fatal") {
      console.error(prefix, safePayload.message, safePayload);
    } else if (safePayload.level === "warn") {
      console.warn(prefix, safePayload.message, safePayload);
    } else {
      console.log(prefix, safePayload.message, safePayload);
    }
    return;
  }

  const line = JSON.stringify(safePayload);
  if (safePayload.level === "error" || safePayload.level === "fatal") {
    console.error(line);
  } else if (safePayload.level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

class StructuredLogger {
  private readonly namespace: string;
  private readonly baseContext: LogContext;

  constructor(namespace: string, baseContext: LogContext = {}) {
    this.namespace = namespace;
    this.baseContext = baseContext;
  }

  child(namespaceOrContext: string | LogContext, maybeContext?: LogContext) {
    if (typeof namespaceOrContext === "string") {
      return new StructuredLogger(`${this.namespace}:${namespaceOrContext}`, {
        ...this.baseContext,
        ...(maybeContext ?? {}),
      });
    }
    return new StructuredLogger(this.namespace, {
      ...this.baseContext,
      ...namespaceOrContext,
    });
  }

  withContext(context: LogContext) {
    return this.child(context);
  }

  trace(message: string, data?: LogContext) {
    this.log("trace", message, data);
  }
  debug(message: string, data?: LogContext) {
    this.log("debug", message, data);
  }
  info(message: string, data?: LogContext) {
    this.log("info", message, data);
  }
  warn(message: string, data?: LogContext) {
    this.log("warn", message, data);
  }
  error(message: string, error?: unknown, data?: LogContext) {
    this.log("error", message, data, error);
  }
  fatal(message: string, error?: unknown, data?: LogContext) {
    this.log("fatal", message, data, error);
  }

  async measure<T>(
    message: string,
    fn: () => Promise<T>,
    data?: LogContext,
  ): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      this.info(message, { ...(data ?? {}), durationMs: Date.now() - start });
      return result;
    } catch (error) {
      this.error(`${message} failed`, error, {
        ...(data ?? {}),
        durationMs: Date.now() - start,
      });
      throw error;
    }
  }

  private log(
    level: LogLevel,
    message: string,
    data?: LogContext,
    error?: unknown,
  ) {
    if (!shouldLog(level)) return;
    emit({
      timestamp: new Date().toISOString(),
      level,
      service: config.service,
      environment: config.environment,
      namespace: this.namespace,
      message,
      context:
        Object.keys(this.baseContext).length > 0 ? this.baseContext : undefined,
      data,
      error: serializeError(error),
    });
  }
}

export function getLogger(namespace: string, context?: LogContext) {
  return new StructuredLogger(namespace, context);
}
