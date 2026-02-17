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

/**
 * Verify the CTFd webhook signature from the CTFd-Webhook-Signature header.
 * Format: t=<timestamp>,v1=<hmac_hex>
 */
function verifySignature(
  secret: string,
  payload: string,
  signatureHeader: string,
): boolean {
  try {
    const parts = signatureHeader.split(",");
    const timestamp = parts.find((p) => p.startsWith("t="))?.slice(2);
    const signature = parts.find((p) => p.startsWith("v1="))?.slice(3);

    if (!timestamp || !signature) return false;

    const signedPayload = `${timestamp}.${payload}`;
    const expected = createHmac("sha256", secret)
      .update(signedPayload)
      .digest("hex");

    return expected === signature;
  } catch {
    return false;
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

export default async function handler(request: Request): Promise<Response> {
  const secret = process.env.WEBHOOK_SECRET;
  const apiToken = process.env.CTFD_API_TOKEN;
  const discordWebhookUrl = process.env.WEBHOOK_URL;

  // ── GET: CTFd endpoint validation ──
  if (request.method === "GET") {
    if (!secret) {
      return new Response(JSON.stringify({ error: "WEBHOOK_SECRET is not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    if (!token) {
      return new Response(JSON.stringify({ error: "Missing token parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const response = createHmac("sha256", secret)
      .update(token)
      .digest("hex");

    return new Response(JSON.stringify({ response }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // ── POST: First Blood event ──
  if (request.method === "POST") {
    if (!apiToken) {
      return new Response(JSON.stringify({ error: "CTFD_API_TOKEN is not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!discordWebhookUrl) {
      return new Response(JSON.stringify({ error: "WEBHOOK_URL is not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Verify webhook signature if secret is set
    if (secret) {
      const signatureHeader = request.headers.get("ctfd-webhook-signature");
      if (!signatureHeader) {
        console.warn("Missing CTFd-Webhook-Signature header");
        return new Response(JSON.stringify({ error: "Missing signature" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }

      const rawBody = await request.text();
      if (!verifySignature(secret, rawBody, signatureHeader)) {
        console.warn("Invalid webhook signature");
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    const payload = await request.json() as FirstBloodPayload;

    if (!payload.id) {
      return new Response(JSON.stringify({ error: "Missing submission id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
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
      return new Response(JSON.stringify({ error: "Failed to fetch submission" }), {
        status: 502,
        headers: { "Content-Type": "application/json" }
      });
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

    return new Response(JSON.stringify({
      success: true,
      discord_sent: sent,
      challenge: challengeName,
      solver: solverName,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // ── Other methods ──
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" }
  });
}
