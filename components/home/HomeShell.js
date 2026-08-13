'use client';

import { useRef } from 'react';
import BackdropDoodles from '@/components/BackdropDoodles';
import GeneratorTool from '@/components/GeneratorTool';
import MotionProvider from '@/components/MotionProvider';
import Hero from './Hero';
import { useCounter } from '@/lib/counter/useCounter';

export default function HomeShell() {
  const { count, bump } = useCounter();
  const heroRef = useRef(null);

  return (
    <MotionProvider>
      <BackdropDoodles />

      <main>
        <Hero ref={heroRef} count={count} />
        <GeneratorTool as="section" id="generator" brandTag="h2" count={count} onBump={bump} />
      </main>
    </MotionProvider>
  );
}
