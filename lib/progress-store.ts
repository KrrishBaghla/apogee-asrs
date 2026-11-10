"use client";

import { useSyncExternalStore } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { emptyProgress, type Progress } from "./progress";
import { accountsEnabled, getSupabase } from "./supabase";

// browser: demo mode, saved in this browser. signed-out and signed-in: accounts are switched on.
export type StoreStatus = "loading" | "browser" | "signed-out" | "signed-in";

export type ProgressState = {
  progress: Progress;
  status: StoreStatus;
  name: string | null;
  error: string | null;
};

// Pages only use this interface, so they don't care where progress is saved.
export interface ProgressStore {
  subscribe(listener: () => void): () => void;
  getState(): ProgressState;
  toggleStep(stepId: string): void;
  setDomain(domainId: string): void;
}

const storageKey = "apogee-progress-v1";

function readLocal(): Progress {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null");
    if (!saved || !Array.isArray(saved.done)) return emptyProgress;
    return {
      domain: typeof saved.domain === "string" ? saved.domain : null,
      done: saved.done.filter((id: unknown) => typeof id === "string"),
    };
  } catch {
    return emptyProgress;
  }
}

function writeLocal(progress: Progress | null) {
  try {
    if (progress) localStorage.setItem(storageKey, JSON.stringify(progress));
    else localStorage.removeItem(storageKey);
  } catch {
    // Private windows can refuse storage. Ticks still work until the page closes.
  }
}

const toggled = (done: string[], stepId: string) =>
  done.includes(stepId) ? done.filter((id) => id !== stepId) : [...done, stepId];

function createListeners() {
  const listeners = new Set<() => void>();
  return {
    add(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    emit: () => listeners.forEach((listener) => listener()),
  };
}

function createBrowserStore(): ProgressStore {
  const listeners = createListeners();
  let state: ProgressState | null = null;

  const getState = () => (state ??= { progress: readLocal(), status: "browser", name: null, error: null });

  const save = (progress: Progress) => {
    state = { ...getState(), progress };
    writeLocal(progress);
    listeners.emit();
  };

  return {
    subscribe(listener) {
      const onStorage = (event: StorageEvent) => {
        if (event.key !== storageKey) return;
        state = { ...getState(), progress: readLocal() };
        listener();
      };
      const remove = listeners.add(listener);
      window.addEventListener("storage", onStorage);
      return () => {
        remove();
        window.removeEventListener("storage", onStorage);
      };
    },
    getState,
    toggleStep(stepId) {
      const { progress } = getState();
      save({ ...progress, done: toggled(progress.done, stepId) });
    },
    setDomain(domainId) {
      const { progress } = getState();
      if (progress.domain !== domainId) save({ ...progress, domain: domainId });
    },
  };
}

function createAccountStore(client: SupabaseClient): ProgressStore {
  const listeners = createListeners();
  let state: ProgressState = { progress: emptyProgress, status: "loading", name: null, error: null };
  let userId: string | null = null;
  let started = false;
  // A domain picked while the account is still loading, saved once it has loaded.
  let pendingDomain: string | null = null;

  const saveDomain = (id: string, domainId: string) =>
    void client
      .from("profiles")
      .upsert({ id, selected_domain: domainId, updated_at: new Date().toISOString() })
      .then(({ error }) => error && failed());

  const set = (patch: Partial<ProgressState>) => {
    state = { ...state, ...patch };
    listeners.emit();
  };

  async function load(id: string) {
    // Ticks made in this browser before logging in move into the account once.
    const local = readLocal();
    if (local.done.length > 0) {
      const { error } = await client
        .from("completed_steps")
        .upsert(local.done.map((step_id) => ({ user_id: id, step_id })), { ignoreDuplicates: true });
      if (!error) writeLocal(null);
    }

    const [profile, steps] = await Promise.all([
      client.from("profiles").select("name, selected_domain").eq("id", id).maybeSingle(),
      client.from("completed_steps").select("step_id"),
    ]);
    if (userId !== id) return;
    if (profile.error || steps.error) {
      set({ status: "signed-in", error: "Your progress didn't load. Refresh the page to try again." });
      return;
    }
    const saved = profile.data?.selected_domain ?? null;
    const domain = pendingDomain ?? saved ?? local.domain;
    pendingDomain = null;
    if (domain && domain !== saved) saveDomain(id, domain);
    set({
      status: "signed-in",
      name: profile.data?.name ?? null,
      progress: {
        domain,
        done: steps.data.map((row) => row.step_id as string),
      },
      error: null,
    });
  }

  function start() {
    if (started) return;
    started = true;
    let known = false;
    client.auth.onAuthStateChange((_event, session) => {
      const id = session?.user.id ?? null;
      if (known && id === userId) return;
      known = true;
      userId = id;
      if (id) {
        set({ status: "loading" });
        // Supabase asks for database calls to run after this callback, not inside it.
        setTimeout(() => void load(id), 0);
      } else {
        pendingDomain = null;
        set({ status: "signed-out", progress: emptyProgress, name: null, error: null });
      }
    });
  }

  const failed = () => {
    set({ error: "That didn't save. Check your connection and try again." });
    if (userId) void load(userId);
  };

  return {
    subscribe(listener) {
      start();
      return listeners.add(listener);
    },
    getState: () => state,
    toggleStep(stepId) {
      if (state.status !== "signed-in" || !userId) return;
      const ticking = !state.progress.done.includes(stepId);
      set({ progress: { ...state.progress, done: toggled(state.progress.done, stepId) }, error: null });
      const table = client.from("completed_steps");
      const request = ticking
        ? table.upsert({ user_id: userId, step_id: stepId }, { ignoreDuplicates: true })
        : table.delete().eq("user_id", userId).eq("step_id", stepId);
      void request.then(({ error }) => error && failed());
    },
    setDomain(domainId) {
      if (state.status === "loading") pendingDomain = domainId;
      if (state.progress.domain === domainId) return;
      set({ progress: { ...state.progress, domain: domainId } });
      if (state.status === "signed-in" && userId) saveDomain(userId, domainId);
    },
  };
}

const supabase = getSupabase();
export const progressStore: ProgressStore = supabase ? createAccountStore(supabase) : createBrowserStore();

export async function signOut() {
  await getSupabase()?.auth.signOut();
}

const serverState: ProgressState = {
  progress: emptyProgress,
  status: accountsEnabled ? "loading" : "browser",
  name: null,
  error: null,
};
const never = () => () => {};

// `ready` is false on the server and until saved progress has loaded.
export function useProgress() {
  const state = useSyncExternalStore(progressStore.subscribe, progressStore.getState, () => serverState);
  const hydrated = useSyncExternalStore(never, () => true, () => false);
  return {
    ...state,
    ready: hydrated && state.status !== "loading",
    canTick: state.status === "browser" || state.status === "signed-in",
  };
}
