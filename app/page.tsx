'use client';

import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';
import {
  FileText,
  Sparkles,
  BookOpen,
  BarChart3,
  Smartphone,
  Shield,
  Check,
  X,
  ArrowRight,
  Brain,
  TrendingUp,
} from 'lucide-react';

// ─ animation presets ──────────────────────────────────────────────────────────

const ease = [0.25, 0.4, 0.25, 1] as [number, number, number, number];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

// ─ feature card ───────────────────────────────────────────────────────────────

function FeatureCard({
  icon: Icon,
  title,
  description,
  premium,
  index,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  premium?: boolean;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.07, ease }}
      className="group relative rounded-xl border border-border/50 bg-card p-6 overflow-hidden hover:border-primary/30 transition-all duration-300"
    >
      {/* Radial glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 40%, hsl(239 84% 67% / 0.07), transparent 70%)',
        }}
      />
      <div className="flex items-start justify-between mb-4">
        <motion.div
          className="inline-flex items-center justify-center bg-primary/10 rounded-lg p-2"
          whileHover={{ scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          <Icon className="w-5 h-5 text-primary" />
        </motion.div>
        {premium && (
          <span className="text-xs font-semibold text-primary bg-primary/10 border border-primary/20 rounded-full px-2.5 py-0.5">
            Pro
          </span>
        )}
      </div>
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}

// ─ carousel examples data ─────────────────────────────────────────────────────

const carouselExamples = [
  {
    field: 'Biology',
    fieldColor: '#10b981',
    fieldBg: 'rgba(16,185,129,0.1)',
    fieldBorder: 'rgba(16,185,129,0.25)',
    title: 'Photosynthesis',
    content:
      'Plants convert sunlight, water and CO₂ into glucose via light-dependent reactions in the thylakoid membrane…',
    scores: [
      { label: 'Accuracy', pct: 92, cls: 'bg-emerald-500' },
      { label: 'Clarity', pct: 78, cls: 'bg-primary' },
      { label: 'Depth', pct: 65, cls: 'bg-violet-400' },
    ],
    overall: 92,
  },
  {
    field: 'History',
    fieldColor: '#f59e0b',
    fieldBg: 'rgba(245,158,11,0.1)',
    fieldBorder: 'rgba(245,158,11,0.25)',
    title: 'The French Revolution',
    content:
      'Rising inequality under Louis XVI triggered the 1789 uprising. The storming of the Bastille became a defining symbol of revolt…',
    scores: [
      { label: 'Accuracy', pct: 88, cls: 'bg-emerald-500' },
      { label: 'Clarity', pct: 82, cls: 'bg-primary' },
      { label: 'Depth', pct: 75, cls: 'bg-violet-400' },
    ],
    overall: 88,
  },
  {
    field: 'Physics',
    fieldColor: '#3b82f6',
    fieldBg: 'rgba(59,130,246,0.1)',
    fieldBorder: 'rgba(59,130,246,0.25)',
    title: "Newton's Laws of Motion",
    content:
      'An object at rest stays at rest unless a net force acts on it. F = ma. Every action has an equal and opposite reaction…',
    scores: [
      { label: 'Accuracy', pct: 95, cls: 'bg-emerald-500' },
      { label: 'Clarity', pct: 85, cls: 'bg-primary' },
      { label: 'Depth', pct: 72, cls: 'bg-violet-400' },
    ],
    overall: 95,
  },
  {
    field: 'Economics',
    fieldColor: '#f97316',
    fieldBg: 'rgba(249,115,22,0.1)',
    fieldBorder: 'rgba(249,115,22,0.25)',
    title: 'Supply & Demand',
    content:
      'As price rises, demand falls — an inverse relationship. Markets reach equilibrium where the supply curve meets demand…',
    scores: [
      { label: 'Accuracy', pct: 85, cls: 'bg-emerald-500' },
      { label: 'Clarity', pct: 91, cls: 'bg-primary' },
      { label: 'Depth', pct: 68, cls: 'bg-violet-400' },
    ],
    overall: 85,
  },
];

const slideVariants = {
  enter: { opacity: 0, y: 14 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -14 },
};

// ─ carousel preview (hero right column) ───────────────────────────────────────

function CarouselPreview() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % carouselExamples.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const example = carouselExamples[index];

  return (
    <div className="relative flex items-center justify-center py-8 sm:h-[440px] sm:py-0">
      {/* Ambient glow */}
      <div className="absolute inset-x-12 inset-y-8 bg-primary/10 rounded-3xl blur-3xl pointer-events-none" />

      <div className="relative">
        {/* Card container — animates in once on mount */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease }}
          className="bg-card border border-border/70 rounded-2xl p-5 w-[300px] shadow-2xl shadow-black/40"
        >
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                Learning Note
              </span>
            </div>
            {/* Field badge — transitions with each slide */}
            <AnimatePresence mode="wait">
              <motion.span
                key={`field-${index}`}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.2 }}
                className="text-[10px] font-semibold rounded-full px-2 py-0.5"
                style={{
                  color: example.fieldColor,
                  background: example.fieldBg,
                  border: `1px solid ${example.fieldBorder}`,
                }}
              >
                {example.field}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Animated content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${index}`}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <h4 className="font-semibold text-foreground text-sm mb-2">{example.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                {example.content}
              </p>

              {/* AI analysis panel */}
              <div className="bg-secondary/50 rounded-xl p-3 border border-border/30">
                <div className="flex items-center gap-1.5 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-foreground">AI Analysis</span>
                  <span className="ml-auto text-sm font-bold text-primary">{example.overall}%</span>
                </div>
                <div className="space-y-2">
                  {example.scores.map(({ label, pct, cls }, i) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-14 shrink-0">
                        {label}
                      </span>
                      <div className="flex-1 h-1 bg-background rounded-full overflow-hidden">
                        <motion.div
                          key={`${index}-${label}`}
                          className={`h-full ${cls} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground w-7 text-right">
                        {pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dot indicators */}
          <div className="flex justify-center items-center gap-1.5 mt-4">
            {carouselExamples.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === index ? '16px' : '6px',
                  background: i === index ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Floating "Saved" badge — hidden on mobile to prevent overflow */}
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.4, delay: 1.1, ease }}
          className="hidden sm:flex absolute -top-3 -right-6 items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-xs font-medium text-emerald-400 whitespace-nowrap">Saved</span>
        </motion.div>

        {/* Floating practice card — hidden on mobile to prevent overflow */}
        <motion.div
          initial={{ opacity: 0, x: -20, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.4, delay: 1.3, ease }}
          className="hidden sm:block absolute -bottom-6 -left-10 bg-card border border-border/60 rounded-xl p-3 w-40 shadow-xl"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Brain className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-medium text-muted-foreground">Daily Practice</span>
          </div>
          <p className="text-xs text-foreground font-medium">3 cards due today</p>
          <div className="mt-1.5 flex gap-0.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 h-1 bg-primary/40 rounded-full" />
            ))}
            <div className="flex-1 h-1 bg-border rounded-full" />
            <div className="flex-1 h-1 bg-border rounded-full" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─ page ───────────────────────────────────────────────────────────────────────

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── NAV (floating pill) ── */}
      <nav className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto flex items-center justify-between bg-zinc-950/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl px-3 py-2 shadow-xl shadow-black/30 w-full sm:w-auto sm:min-w-[480px]">
          {/* Logo + wordmark */}
          <div className="flex items-center gap-2 px-1 py-1">
            <Image
              src="/icon-192x192.png"
              alt="MemoMind"
              width={26}
              height={26}
              className="rounded-md shrink-0"
            />
            <span className="text-sm font-semibold text-foreground">MemoMind</span>
          </div>

          {/* Right side */}
          <div className="flex items-center">
            {/* Pricing + Sign in — hidden on mobile */}
            <div className="hidden sm:flex items-center">
              <div className="w-px h-4 bg-white/10 mx-3" />
              <Link
                href="/pricing"
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-xl transition-colors"
              >
                Pricing
              </Link>
              <div className="w-px h-4 bg-white/10 mx-2" />
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-xl transition-colors font-medium">
                    Sign in
                  </button>
                </SignInButton>
              </SignedOut>
            </div>

            {/* CTA — always visible */}
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="ml-2 px-3 sm:px-4 py-1.5 text-sm font-semibold bg-primary text-primary-foreground rounded-xl transition-all hover:bg-primary/90 hover:shadow-[0_0_16px_hsl(239_84%_67%/0.35)] whitespace-nowrap">
                  <span className="hidden sm:inline">Get started free</span>
                  <span className="sm:hidden">Start free</span>
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="ml-2 px-4 py-1.5 text-sm font-semibold bg-primary text-primary-foreground rounded-xl transition-all hover:bg-primary/90"
              >
                Dashboard
              </Link>
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center pt-24 sm:pt-28 pb-16 px-4 overflow-hidden">
        {/* Subtle grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' width='64' height='64' fill='none' stroke='rgba(255,255,255,0.025)'%3e%3cpath d='M0 .5H63.5V64'/%3e%3c/svg%3e")`,
          }}
        />
        {/* Aurora blobs */}
        <div className="absolute top-[-20%] left-[15%] w-[700px] h-[700px] rounded-full bg-primary/[0.07] blur-[140px] animate-aurora-1 pointer-events-none" />
        <div className="absolute top-0 right-[5%] w-[500px] h-[500px] rounded-full bg-violet-500/[0.05] blur-[120px] animate-aurora-2 pointer-events-none" />
        <div className="absolute bottom-[-15%] left-[-5%] w-[600px] h-[600px] rounded-full bg-indigo-400/[0.04] blur-[130px] animate-aurora-3 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-[1fr_400px] xl:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — text */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="text-center lg:text-left"
            >
              <motion.div
                variants={fadeUp}
                className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-8"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="text-primary text-sm font-medium">AI-Powered Learning</span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="font-bold text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight mb-6"
              >
                <span className="gradient-text">Never forget</span>
                <br />
                <span className="text-foreground">what you learn.</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed"
              >
                Build lasting knowledge with AI analysis and spaced repetition. Study smarter,
                retain more, achieve your goals.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="flex flex-col items-center sm:flex-row sm:items-start gap-3 justify-center lg:justify-start"
              >
                <SignedOut>
                  <SignUpButton mode="modal">
                    <button className="group inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-7 py-3.5 rounded-lg font-semibold text-sm transition-all hover:shadow-[0_0_28px_hsl(239_84%_67%/0.35)]">
                      Start for free
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </SignUpButton>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 border border-border hover:bg-secondary text-foreground px-7 py-3.5 rounded-lg font-semibold text-sm transition-colors"
                  >
                    View pricing
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link
                    href="/dashboard"
                    className="group inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-7 py-3.5 rounded-lg font-semibold text-sm transition-all hover:shadow-[0_0_28px_hsl(239_84%_67%/0.35)]"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </SignedIn>
              </motion.div>

              <motion.p variants={fadeUp} className="mt-6 text-sm text-muted-foreground">
                Free to start
                <span className="mx-2 opacity-40">·</span>
                No credit card
                <span className="mx-2 opacity-40">·</span>
                Cancel anytime
              </motion.p>
            </motion.div>

            {/* Right — carousel preview */}
            <div className="flex items-center justify-center mt-6 lg:mt-0">
              <CarouselPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="border-y border-border/50 bg-card/20 py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 divide-x divide-border/50">
          {[
            { value: '10K+', label: 'Notes Created', icon: FileText },
            { value: '98%', label: 'AI Accuracy', icon: Brain },
            { value: '5×', label: 'Better Retention', icon: TrendingUp },
          ].map(({ value, label, icon: Icon }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1, ease }}
              className="flex flex-col items-center gap-1 px-4"
            >
              <Icon className="w-4 h-4 text-primary mb-1 opacity-50" />
              <span className="text-2xl md:text-3xl font-bold text-foreground">{value}</span>
              <span className="text-xs text-muted-foreground text-center">{label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs font-semibold text-primary uppercase tracking-widest mb-3"
            >
              Features
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease }}
              className="text-3xl md:text-4xl font-bold text-foreground tracking-tight"
            >
              Everything you need to master any topic
            </motion.h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: FileText,
                title: 'Smart Notes',
                description:
                  'Create, organise, and manage your learning notes with a clean, distraction-free editor.',
              },
              {
                icon: Sparkles,
                title: 'AI Analysis',
                description:
                  'Get instant AI feedback on your understanding. Identify knowledge gaps and improve faster.',
                premium: true,
              },
              {
                icon: BookOpen,
                title: 'Daily Practice',
                description:
                  "Spaced-repetition flashcards. Never forget what you've learned with smart daily reviews.",
                premium: true,
              },
              {
                icon: BarChart3,
                title: 'Progress Tracking',
                description:
                  'Monitor review counts, completion stats, and daily challenge streaks at a glance.',
                premium: true,
              },
              {
                icon: Smartphone,
                title: 'Mobile Ready',
                description:
                  'Learn anywhere, anytime. Fully responsive design that works seamlessly on all devices.',
              },
              {
                icon: Shield,
                title: 'Secure & Private',
                description:
                  'Your notes are encrypted and private. Only you can access your learning data.',
              },
            ].map((f, i) => (
              <FeatureCard key={f.title} {...f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-24 px-4 bg-card/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs font-semibold text-primary uppercase tracking-widest mb-3"
            >
              Pricing
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease }}
              className="text-3xl md:text-4xl font-bold text-foreground tracking-tight"
            >
              Simple pricing
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="mt-3 text-muted-foreground text-base"
            >
              Start free, upgrade when you&apos;re ready.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Free */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease }}
              className="rounded-xl border border-border/50 bg-card p-7"
            >
              <h3 className="font-semibold text-foreground mb-1">Free</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-foreground">₹0</span>
                <span className="text-muted-foreground text-sm">/forever</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-sm text-foreground">
                  <Check className="w-4 h-4 text-primary shrink-0" /> Unlimited notes
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <X className="w-4 h-4 shrink-0" /> AI analysis
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <X className="w-4 h-4 shrink-0" /> Daily practice cards
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <X className="w-4 h-4 shrink-0" /> Progress tracking
                </li>
              </ul>
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="inline-flex items-center justify-center w-full gap-2 border border-border hover:bg-secondary text-foreground px-6 py-3 rounded-lg font-semibold text-sm transition-colors">
                    Start for free
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center w-full gap-2 border border-border hover:bg-secondary text-foreground px-6 py-3 rounded-lg font-semibold text-sm transition-colors"
                >
                  Dashboard
                </Link>
              </SignedIn>
            </motion.div>

            {/* Premium — gradient border trick */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1, ease }}
              className="relative p-[1px] rounded-xl bg-gradient-to-br from-primary/50 via-primary/20 to-violet-500/40"
            >
              <span className="absolute -top-3.5 left-6 z-10 text-xs font-semibold text-primary bg-background border border-primary/30 rounded-full px-3 py-1">
                Popular
              </span>
              <div className="rounded-[calc(0.75rem-1px)] bg-card p-7 h-full">
                <h3 className="font-semibold text-foreground mb-1">Premium</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold text-foreground">₹99</span>
                  <span className="text-muted-foreground text-sm">/mo</span>
                </div>
                <p className="text-xs text-muted-foreground mb-6">or ₹999/yr — save 16%</p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Everything in Free',
                    'AI-powered analysis',
                    'Daily practice cards',
                    'Progress tracking',
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-3 text-sm text-foreground">
                      <Check className="w-4 h-4 text-primary shrink-0" /> {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-semibold text-sm transition-all hover:shadow-[0_0_20px_hsl(239_84%_67%/0.3)]"
                >
                  Upgrade to Premium
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.04] to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[280px] bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="relative max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4">
            Ready to master your learning?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join learners who never forget what they study.
          </p>
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="group inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-7 py-3.5 rounded-lg font-semibold text-sm transition-all hover:shadow-[0_0_28px_hsl(239_84%_67%/0.35)]">
                Start for free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-7 py-3.5 rounded-lg font-semibold text-sm transition-all hover:shadow-[0_0_28px_hsl(239_84%_67%/0.35)]"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </SignedIn>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border/50 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            MemoMind
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
            <span className="font-normal text-muted-foreground">&copy; 2026</span>
          </span>
          <div className="flex items-center gap-5">
            <Link href="/pricing" className="hover:text-foreground transition-colors">
              Pricing
            </Link>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="hover:text-foreground transition-colors">Sign In</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="hover:text-foreground transition-colors">
                Dashboard
              </Link>
            </SignedIn>
          </div>
        </div>
      </footer>
    </div>
  );
}
