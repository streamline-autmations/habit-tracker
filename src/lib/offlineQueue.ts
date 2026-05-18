import { supabase } from "./supabase";

// Minimal write-ahead log. Mutations that fail (offline / network error) are
// parked in localStorage and replayed when connectivity returns.
const KEY = "baseline:waql";

type Op =
  | { kind: "insert"; table: string; payload: Record<string, unknown> }
  | { kind: "update"; table: string; payload: Record<string, unknown>; match: Record<string, unknown> }
  | { kind: "upsert"; table: string; payload: Record<string, unknown>; onConflict?: string };

function read(): Op[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(ops: Op[]) {
  localStorage.setItem(KEY, JSON.stringify(ops));
}

export function enqueue(op: Op) {
  const ops = read();
  ops.push(op);
  write(ops);
}

async function apply(op: Op): Promise<boolean> {
  try {
    if (op.kind === "insert") {
      const { error } = await supabase.from(op.table).insert(op.payload);
      return !error;
    }
    if (op.kind === "update") {
      let q = supabase.from(op.table).update(op.payload);
      for (const [k, v] of Object.entries(op.match)) q = q.eq(k, v as never);
      const { error } = await q;
      return !error;
    }
    const { error } = await supabase
      .from(op.table)
      .upsert(op.payload, op.onConflict ? { onConflict: op.onConflict } : undefined);
    return !error;
  } catch {
    return false;
  }
}

let flushing = false;

export async function flushQueue(): Promise<void> {
  if (flushing) return;
  flushing = true;
  try {
    let ops = read();
    while (ops.length) {
      const ok = await apply(ops[0]);
      if (!ok) break;
      ops = ops.slice(1);
      write(ops);
    }
  } finally {
    flushing = false;
  }
}

/**
 * Run a write; if it throws or errors, park it for later replay so the UI can
 * stay optimistic. Returns true if it reached the server.
 */
export async function writeThrough(
  fn: () => Promise<{ error: unknown }>,
  fallback: Op,
): Promise<boolean> {
  if (!navigator.onLine) {
    enqueue(fallback);
    return false;
  }
  try {
    const { error } = await fn();
    if (error) {
      enqueue(fallback);
      return false;
    }
    return true;
  } catch {
    enqueue(fallback);
    return false;
  }
}

export function initOfflineSync() {
  window.addEventListener("online", () => void flushQueue());
  if (navigator.onLine) void flushQueue();
}
