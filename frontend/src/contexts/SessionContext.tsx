"use client";

import { fetchSessions } from "@/lib/api";
import { loadPersisted, savePersisted } from "@/lib/storage";
import type { Session } from "@/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface SessionCtx {
  sessions: Session[];
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
  refreshSessions: () => Promise<void>;
}

const SessionContext = createContext<SessionCtx | null>(null);

export function SessionProvider({
  children,
  initialSessions,
}: {
  children: ReactNode;
  initialSessions: Session[];
}) {
  const [sessions, setSessions] = useState<Session[]>(initialSessions);

  useEffect(() => {
    const cached = loadPersisted()?.sessionList;
    if (cached?.length) {
      setSessions(cached);
    } else if (initialSessions.length) {
      const cur = loadPersisted();
      savePersisted({
        chatState: cur?.chatState ?? { messages: {} },
        sessionList: initialSessions,
      });
    }
  }, [initialSessions]);

  const refreshSessions = useCallback(async () => {
    try {
      const fresh = await fetchSessions();
      setSessions(fresh);
      const cur = loadPersisted();
      savePersisted({
        chatState: cur?.chatState ?? { messages: {} },
        sessionList: fresh,
      });
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    const handler = () => refreshSessions();
    window.addEventListener("session:created", handler);
    return () => window.removeEventListener("session:created", handler);
  }, [refreshSessions]);

  return (
    <SessionContext.Provider
      value={{ sessions, setSessions, refreshSessions }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionContext() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSessionContext must be inside SessionProvider");
  return ctx;
}
