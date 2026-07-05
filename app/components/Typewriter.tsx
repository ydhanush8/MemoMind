'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

export default function Typewriter({
  words,
  className,
  typeSpeed = 80,
  deleteSpeed = 40,
  holdTime = 1700,
}: {
  words: string[];
  className?: string;
  typeSpeed?: number;
  deleteSpeed?: number;
  holdTime?: number;
}) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [sub, setSub] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const current = words[index % words.length];

    if (!deleting && sub === current.length) {
      const t = setTimeout(() => setDeleting(true), holdTime);
      return () => clearTimeout(t);
    }
    if (deleting && sub === 0) {
      setDeleting(false);
      setIndex((i) => (i + 1) % words.length);
      return;
    }
    const t = setTimeout(
      () => setSub((s) => s + (deleting ? -1 : 1)),
      deleting ? deleteSpeed : typeSpeed,
    );
    return () => clearTimeout(t);
  }, [sub, deleting, index, words, reduce, typeSpeed, deleteSpeed, holdTime]);

  const current = words[index % words.length];
  const text = reduce ? current : current.substring(0, sub);

  return (
    <span className={className}>
      {text || '​'}
      <span
        aria-hidden="true"
        className="tw-cursor ml-1 inline-block w-[0.5ch] max-w-[6px] self-stretch rounded-[2px] bg-primary align-baseline"
        style={{ height: '0.74em', transform: 'translateY(0.04em)' }}
      />
    </span>
  );
}
