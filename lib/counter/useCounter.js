'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Live frames-created counter (D4).
 *
 * Every failure mode here is silence: a null count renders nothing and the
 * page is otherwise unaffected. Nothing in this hook is ever awaited by
 * Download or Share (app-flow.md — the counter must never gate them).
 */
export function useCounter() {
  const [count, setCount] = useState(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Once on load.
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/counter');
        if (!res.ok) return; // stays null → ribbon never appears
        const data = await res.json();
        if (mounted.current && Number.isFinite(data.count)) setCount(data.count);
      } catch {
        // Offline or blocked. Silence is the designed behaviour.
      }
    })();
  }, []);

  const bump = useCallback(() => {
    // Optimistic: the UI moves on this tick, before any request goes out. If
    // the count was never fetched it stays hidden rather than appearing as a
    // lone "1" with no basis.
    setCount((c) => (c === null ? null : c + 1));

    (async () => {
      try {
        const res = await fetch('/api/counter/increment', { method: 'POST' });
        if (!res.ok) return; // keep the optimistic value, including on 429
        const data = await res.json();
        // Reconcile to the authoritative total, which also picks up increments
        // from everyone else since page load.
        if (mounted.current && Number.isFinite(data.count)) setCount(data.count);
      } catch {
        // Keep the optimistic value.
      }
    })();
  }, []);

  return { count, bump };
}
