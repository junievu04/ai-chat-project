import { existsSync, readFileSync } from "fs";
import mongoose, { Schema, Types } from "mongoose";
import { resolve } from "path";

const MESSAGE_PAGE_SIZE = 20;

function loadEnv() {
  const candidates = [
    resolve(__dirname, "../.env"),
    resolve(__dirname, "../../.env"),
  ];
  for (const file of candidates) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
    break;
  }
}

const SessionSchema = new Schema(
  {
    title: { type: String, default: "New Chat" },
    messageCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const MessageSchema = new Schema(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: "Session", required: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    attachments: { type: Array, default: [] },
  },
  { timestamps: true },
);

const Session =
  mongoose.models.Session || mongoose.model("Session", SessionSchema);
const Message =
  mongoose.models.Message || mongoose.model("Message", MessageSchema);

interface Turn {
  user: string;
  assistant: string;
}

const DEMO_SESSIONS: { title: string; turns: Turn[] }[] = [
  {
    title: "Long chat — lazy loading demo",
    turns: buildTurns(28, (i) => ({
      user: `Demo question #${i + 1}: How does cursor pagination work with page size ${MESSAGE_PAGE_SIZE}?`,
      assistant: `**Answer ${i + 1}:** Each request returns up to ${MESSAGE_PAGE_SIZE} messages. Scroll to the top to load older pages via the \`next\` cursor.\n\n- Page 1: newest messages\n- Page 2+: older batches`,
    })),
  },
  {
    title: "React hooks refresher",
    turns: [
      {
        user: "When should I use useCallback?",
        assistant:
          "Use `useCallback` when you pass a function to a memoized child or when the function is a dependency of `useEffect` / `useMemo` and you want to avoid unnecessary re-runs.",
      },
      {
        user: "What about useMemo?",
        assistant:
          "`useMemo` caches a **computed value**. Prefer it for expensive calculations, not for every primitive.",
      },
      {
        user: "Give a tiny example.",
        assistant:
          "```tsx\nconst sorted = useMemo(\n  () => [...items].sort((a, b) => a.localeCompare(b)),\n  [items],\n);\n```",
      },
      ...buildTurns(9, (i) => ({
        user: `Follow-up ${i + 1}: explain dependency arrays briefly.`,
        assistant: `Dependencies tell React when to recompute. If \`[items]\` changes, the memo recalculates (turn ${i + 1}).`,
      })),
    ],
  },
  {
    title: "MongoDB indexing",
    turns: [
      {
        user: "Best index for messages by session, sorted by time?",
        assistant:
          "A compound index `{ sessionId: 1, createdAt: -1 }` matches `find({ sessionId }).sort({ createdAt: -1 })` used in chat history pagination.",
      },
      {
        user: "Why compound instead of only sessionId?",
        assistant:
          "Single-field `sessionId` helps the filter; adding `createdAt` lets MongoDB return results already sorted without an in-memory sort.",
      },
      ...buildTurns(4, (i) => ({
        user: `Extra Mongo question ${i + 1}`,
        assistant: `Demo reply ${i + 1} about indexes and query patterns.`,
      })),
    ],
  },
  {
    title: "NestJS REST vs SSE",
    turns: [
      {
        user: "Can streaming still be REST?",
        assistant:
          "Yes. `POST /api/chat` can return `text/event-stream` while other routes stay JSON. History remains `GET /sessions/:id/messages`.",
      },
      {
        user: "What events do you send?",
        assistant:
          "`meta` (session + user message), `chunk` (AI tokens), `done` (saved assistant message), and `error` on failure.",
      },
    ],
  },
  {
    title: "File upload in chat",
    turns: [
      {
        user: "How are attachments stored?",
        assistant:
          "Files upload to Cloudinary; the message stores `url`, `publicId`, `type`, and `name` in the `attachments` array.",
      },
    ],
  },
  {
    title: "TypeScript tips",
    turns: [
      {
        user: "Prefer interface or type for API models?",
        assistant:
          "Either works. Use `interface` for object shapes you may extend; use `type` for unions and mapped types.",
      },
      {
        user: "Example of a union for message roles?",
        assistant: "`type Role = 'user' | 'assistant';`",
      },
    ],
  },
  {
    title: "Quick hello",
    turns: [
      {
        user: "Hi!",
        assistant: "Hello! This is a short demo thread for the sidebar list.",
      },
    ],
  },
  {
    title: "Markdown showcase",
    turns: [
      {
        user: "Show lists and code.",
        assistant:
          "**Features:**\n\n1. Ordered list\n2. Second item\n\n```js\nconsole.log('demo');\n```\n\n> Blockquote for emphasis.",
      },
      {
        user: "Add a table.",
        assistant:
          "| Feature | Status |\n|--------|--------|\n| Stream | ✅ |\n| Lazy load | ✅ |",
      },
    ],
  },
];

function buildTurns(count: number, fn: (index: number) => Turn): Turn[] {
  return Array.from({ length: count }, (_, i) => fn(i));
}

function turnsToMessages(
  sessionId: Types.ObjectId,
  turns: Turn[],
  baseTime: Date,
  minutesApart: number,
) {
  const docs: {
    sessionId: Types.ObjectId;
    role: string;
    content: string;
    attachments: [];
    createdAt: Date;
    updatedAt: Date;
  }[] = [];

  const totalMessages = turns.length * 2;
  const start = new Date(
    baseTime.getTime() - totalMessages * minutesApart * 60_000,
  );

  let t = 0;
  for (const turn of turns) {
    const userAt = new Date(start.getTime() + t++ * minutesApart * 60_000);
    const assistantAt = new Date(start.getTime() + t++ * minutesApart * 60_000);

    docs.push({
      sessionId,
      role: "user",
      content: turn.user,
      attachments: [],
      createdAt: userAt,
      updatedAt: userAt,
    });
    docs.push({
      sessionId,
      role: "assistant",
      content: turn.assistant,
      attachments: [],
      createdAt: assistantAt,
      updatedAt: assistantAt,
    });
  }

  return docs;
}

async function main() {
  loadEnv();
  const reset = process.argv.includes("--reset");
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("Missing MONGODB_URI. Set it in backend/.env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  if (reset) {
    const [s, m] = await Promise.all([
      Session.deleteMany({}),
      Message.deleteMany({}),
    ]);
    console.log(
      `Cleared ${s.deletedCount} sessions, ${m.deletedCount} messages`,
    );
  }

  const now = new Date();
  let sessionCount = 0;
  let messageCount = 0;

  for (let i = 0; i < DEMO_SESSIONS.length; i++) {
    const spec = DEMO_SESSIONS[i];
    const turns = spec.turns;
    const msgCount = turns.length * 2;
    const lastActivity = new Date(now.getTime() - i * 3_600_000);

    const session = await Session.create({
      title: spec.title,
      messageCount: msgCount,
      createdAt: new Date(lastActivity.getTime() - msgCount * 120_000),
      updatedAt: lastActivity,
    });

    const messages = turnsToMessages(session._id, turns, lastActivity, 2);
    await Message.insertMany(messages);

    sessionCount++;
    messageCount += messages.length;
    console.log(
      `  ✓ ${spec.title} — ${messages.length} messages (${turns.length} turns)`,
    );
  }

  console.log(`\nDone: ${sessionCount} sessions, ${messageCount} messages.`);
  console.log(
    `Open a chat and scroll up in "${DEMO_SESSIONS[0].title}" to test lazy loading (>${MESSAGE_PAGE_SIZE} messages).`,
  );

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
