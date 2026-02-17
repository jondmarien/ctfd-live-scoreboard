import { createHmac } from "crypto";

const CTFD_BASE_URL = "https://issessionsctf.ctfd.io";

interface FirstBloodPayload {
  id: number;
  challenge_id: number;
  challenge: unknown;
  team: unknown;
  user: unknown;
  date: string;
  type: string;
}

interface CTFdSubmission {
  success: boolean;
  data: {
    id: number;
    challenge_id: number;
    challenge: { id: number; name: string; category: string; value: number };
    user: { id: number; name: string };
    team: { id: number; name: string } | null;
    date: string;
    type: string;
  };
}

interface CTFdChallenge {
  success: boolean;
  data: {
    id: number;
    name: string;
    category: string;
    value: number;
    solves: number;
    description: string;
  };
}

// Maximum payload size (64 KB)
const MAX_PAYLOAD_BYTES = 64 * 1024;

// Maximum age for webhook timestamps (5 minutes)
const MAX_TIMESTAMP_AGE_S = 300;

/**
 * Verify the CTFd webhook signature from the CTFd-Webhook-Signature header.
 * Format: t=<timestamp>,v1=<hmac_hex>
 * Also validates the timestamp is within MAX_TIMESTAMP_AGE_S of now.
 */
function verifySignature(
  secret: string,
  payload: string,
  signatureHeader: string,
): { valid: boolean; reason?: string } {
  try {
    const parts = signatureHeader.split(",");
    const timestamp = parts.find((p) => p.startsWith("t="))?.slice(2);
    const signature = parts.find((p) => p.startsWith("v1="))?.slice(3);

    if (!timestamp || !signature) {
      return { valid: false, reason: "Malformed signature header" };
    }

    // Replay protection: reject timestamps outside the allowed window
    const ts = parseInt(timestamp, 10);
    if (isNaN(ts)) {
      return { valid: false, reason: "Invalid timestamp" };
    }
    const nowS = Math.floor(Date.now() / 1000);
    if (Math.abs(nowS - ts) > MAX_TIMESTAMP_AGE_S) {
      return { valid: false, reason: `Timestamp too old or too far in the future (delta=${nowS - ts}s)` };
    }

    const signedPayload = `${timestamp}.${payload}`;
    const expected = createHmac("sha256", secret)
      .update(signedPayload)
      .digest("hex");

    // Constant-time comparison via buffer equality
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(signature, "hex");
    if (a.length !== b.length || !a.equals(b)) {
      return { valid: false, reason: "Signature mismatch" };
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: "Signature verification error" };
  }
}

/**
 * Fetch submission details from CTFd API.
 */
async function fetchSubmission(
  submissionId: number,
  token: string,
): Promise<CTFdSubmission["data"] | null> {
  try {
    const res = await fetch(
      `${CTFD_BASE_URL}/api/v1/submissions/${submissionId}`,
      {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as CTFdSubmission;
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

/**
 * Fetch challenge details from CTFd API.
 */
async function fetchChallenge(
  challengeId: number,
  token: string,
): Promise<CTFdChallenge["data"] | null> {
  try {
    const res = await fetch(
      `${CTFD_BASE_URL}/api/v1/challenges/${challengeId}`,
      {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as CTFdChallenge;
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

/**
 * Send a fantasy-themed First Blood announcement to Discord via webhook.
 */
async function sendDiscordFirstBlood(
  webhookUrl: string,
  solverName: string,
  teamName: string | null,
  challengeName: string,
  challengeCategory: string,
  challengeValue: number,
  solveDate: string,
) {
  const solverDisplay = teamName
    ? `**${solverName}** of party **${teamName}**`
    : `**${solverName}**`;

  const embed = {
    title: "🩸 FIRST BLOOD! ⚔️",
    description: `${solverDisplay} has drawn **First Blood** on a quest!`,
    color: 0xffd700, // gold
    fields: [
      {
        name: "🗡️ Quest",
        value: challengeName,
        inline: true,
      },
      {
        name: "📜 Category",
        value: challengeCategory,
        inline: true,
      },
      {
        name: "💰 Gold Pieces",
        value: `${challengeValue} GP`,
        inline: true,
      },
    ],
    footer: {
      text: "ISSessions Fantasy CTF 2026 — Guild Quest Board",
    },
    timestamp: solveDate,
    thumbnail: {
      url: "https://cdn.discordapp.com/emojis/1070168841814675507.webp",
    },
  };

  const body = {
    username: "The Quest Giver",
    avatar_url:
      "https://iss-ctfd-live-scoreboard.vercel.app/fantasy_ctf.png",
    content: `🏆 A hero has claimed **First Blood**!`,
    embeds: [embed],
  };

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Discord webhook failed (${res.status}):`, text);
  }

  return res.ok;
}

export default {
  async fetch(request: Request) {
    const secret = process.env.WEBHOOK_SECRET;
    const apiToken = process.env.CTFD_API_TOKEN;
    const discordWebhookUrl = process.env.WEBHOOK_URL;

    // ── GET: CTFd endpoint validation ──
    if (request.method === "GET") {
      if (!secret) {
        return Response.json({ error: "WEBHOOK_SECRET is not configured" }, { status: 500 });
      }

      const url = new URL(request.url);
      const token = url.searchParams.get("token");
      if (!token) {
        return Response.json({ error: "Missing token parameter" }, { status: 400 });
      }

      const response = createHmac("sha256", secret)
        .update(token)
        .digest("hex");

      return Response.json({ response });
    }

    // ── POST: First Blood event ──
    if (request.method === "POST") {
      // WEBHOOK_SECRET is required — refuse to process unsigned webhooks
      if (!secret) {
        return Response.json({ error: "WEBHOOK_SECRET is not configured" }, { status: 500 });
      }
      if (!apiToken) {
        return Response.json({ error: "CTFD_API_TOKEN is not configured" }, { status: 500 });
      }
      if (!discordWebhookUrl) {
        return Response.json({ error: "WEBHOOK_URL is not configured" }, { status: 500 });
      }

      // Enforce payload size limit
      const contentLength = request.headers.get("content-length");
      if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
        return Response.json({ error: "Payload too large" }, { status: 413 });
      }

      const rawBody = await request.text();
      if (rawBody.length > MAX_PAYLOAD_BYTES) {
        return Response.json({ error: "Payload too large" }, { status: 413 });
      }

      // Verify webhook signature (required)
      const signatureHeader = request.headers.get("ctfd-webhook-signature");
      if (!signatureHeader) {
        console.warn("Missing CTFd-Webhook-Signature header");
        return Response.json({ error: "Missing signature" }, { status: 401 });
      }

      const verification = verifySignature(secret, rawBody, signatureHeader);
      if (!verification.valid) {
        console.warn(`Webhook signature verification failed: ${verification.reason}`);
        return Response.json({ error: "Invalid signature" }, { status: 401 });
      }

      const payload = JSON.parse(rawBody) as FirstBloodPayload;

      if (!payload.id) {
        return Response.json({ error: "Missing submission id" }, { status: 400 });
      }

      console.log(
        `First Blood event received: submission=${payload.id}, challenge=${payload.challenge_id}`,
      );

      // Fetch full submission + challenge details from CTFd
      const [submission, challenge] = await Promise.all([
        fetchSubmission(payload.id, apiToken),
        fetchChallenge(payload.challenge_id, apiToken),
      ]);

      if (!submission) {
        console.error(`Failed to fetch submission ${payload.id}`);
        return Response.json({ error: "Failed to fetch submission" }, { status: 502 });
      }

      const challengeName =
        challenge?.name ?? submission.challenge?.name ?? "Unknown Quest";
      const challengeCategory =
        challenge?.category ?? submission.challenge?.category ?? "Unknown";
      const challengeValue =
        challenge?.value ?? submission.challenge?.value ?? 0;

      const solverName = submission.user?.name ?? "Unknown Adventurer";
      const teamName = submission.team?.name ?? null;
      const solveDate = submission.date ?? payload.date;

      const sent = await sendDiscordFirstBlood(
        discordWebhookUrl,
        solverName,
        teamName,
        challengeName,
        challengeCategory,
        challengeValue,
        solveDate,
      );

      return Response.json({
        success: true,
        discord_sent: sent,
        challenge: challengeName,
        solver: solverName,
      });
    }

    // ── Other methods ──
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  },
};
