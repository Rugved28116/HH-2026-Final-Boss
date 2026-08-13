'use client';

import BackdropDoodles from '@/components/BackdropDoodles';
import GeneratorTool from '@/components/GeneratorTool';
import MotionProvider from '@/components/MotionProvider';
import { useCounter } from '@/lib/counter/useCounter';

/**
 * The generator on its own, with no hero — the test harness the canvas work is
 * verified against (see the screenshot recipe in CLAUDE.md). The homepage
 * composes the same component under a hero instead.
 */
export default function PreviewRoute() {
  const { count, bump } = useCounter();

  return (
    <MotionProvider>
      <BackdropDoodles />
      <GeneratorTool as="main" brandTag="h1" count={count} onBump={bump} />
    </MotionProvider>
  );
}
