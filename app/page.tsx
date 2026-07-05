'use client';

import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useReducedMotion,
  AnimatePresence,
} from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';
import Logo from '@/app/components/Logo';
import Typewriter from '@/app/components/Typewriter';
import {
  FileText,
  Sparkles,
  BookOpen,
  BarChart3,
  Smartphone,
  Shield,
  Check,
  ArrowRight,
  Brain,
  PenLine,
  ScanLine,
  Repeat,
} from 'lucide-react';

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const carouselExamples = [
  {
    field: 'Biology',
    accent: '#4f7a52',
    title: 'Photosynthesis',
    content:
      'Plants convert sunlight, water and CO₂ into glucose via light-dependent reactions in the thylakoid membrane…',
    scores: [
      { label: 'Accuracy', pct: 92 },
      { label: 'Clarity', pct: 78 },
      { label: 'Depth', pct: 65 },
    ],
    overall: 92,
  },
  {
    field: 'History',
    accent: '#b07b3e',
    title: 'The French Revolution',
    content:
      'Rising inequality under Louis XVI triggered the 1789 uprising. The storming of the Bastille became a defining symbol of revolt…',
    scores: [
      { label: 'Accuracy', pct: 88 },
      { label: 'Clarity', pct: 82 },
      { label: 'Depth', pct: 75 },
    ],
    overall: 88,
  },
  {
    field: 'Physics',
    accent: '#3f6f8a',
    title: "Newton's Laws of Motion",
    content:
      'An object at rest stays at rest unless a net force acts on it. F = ma. Every action has an equal and opposite reaction…',
    scores: [
      { label: 'Accuracy', pct: 95 },
      { label: 'Clarity', pct: 85 },
      { label: 'Depth', pct: 72 },
    ],
    overall: 95,
  },
  {
    field: 'Economics',
    accent: '#a85a3c',
    title: 'Supply & Demand',
    content:
      'As price rises, demand falls — an inverse relationship. Markets reach equilibrium where the supply curve meets demand…',
    scores: [
      { label: 'Accuracy', pct: 85 },
      { label: 'Clarity', pct: 91 },
      { label: 'Depth', pct: 68 },
    ],
    overall: 85,
  },
];

const slideVariants = {
  enter: { opacity: 0, y: 14 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -14 },
};

function FloatingPreview() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % carouselExamples.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const example = carouselExamples[index];

  return (
    <div className="relative flex items-center justify-center py-10 sm:h-[480px] sm:py-0">
      <div className="absolute inset-x-8 inset-y-6 bg-primary/15 rounded-[2.5rem] blur-3xl pointer-events-none" />

      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: 32, rotate: -1 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease }}
          className="relative bg-card border border-border/60 rounded-[1.75rem] p-6 w-[320px] shadow-elevation-3"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.18em]">
                Learning Note
              </span>
            </div>
            <AnimatePresence mode="wait">
              <motion.span
                key={`field-${index}`}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.2 }}
                className="text-[10px] font-bold rounded-full px-2.5 py-1"
                style={{
                  color: example.accent,
                  background: `${example.accent}1f`,
                }}
              >
                {example.field}
              </motion.span>
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${index}`}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.32, ease }}
            >
              <h4 className="font-bold text-foreground text-lg mb-2 tracking-tight">
                {example.title}
              </h4>
              <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
                {example.content}
              </p>

              <div className="bg-secondary/60 rounded-2xl p-4 border border-border/40">
                <div className="flex items-center gap-1.5 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-bold text-foreground">AI Analysis</span>
                  <span className="ml-auto text-lg font-extrabold text-primary tabular-nums">
                    {example.overall}%
                  </span>
                </div>
                <div className="space-y-2.5">
                  {example.scores.map(({ label, pct }, i) => (
                    <div key={label} className="flex items-center gap-2.5">
                      <span className="text-[10px] font-medium text-muted-foreground w-12 shrink-0">
                        {label}
                      </span>
                      <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden">
                        <motion.div
                          key={`${index}-${label}`}
                          className="h-full rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1, ease }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-muted-foreground w-7 text-right tabular-nums">
                        {pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center items-center gap-1.5 mt-4">
            {carouselExamples.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Show example ${i + 1}`}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === index ? '18px' : '6px',
                  background: i === index ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                }}
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.1, ease }}
          className="hidden sm:flex absolute -top-4 -right-8 items-center gap-1.5 bg-card border border-border/60 rounded-full px-3.5 py-2 shadow-elevation-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold text-foreground whitespace-nowrap">Saved</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -24, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.3, ease }}
          className="hidden sm:block absolute -bottom-8 -left-12 bg-card border border-border/60 rounded-2xl p-3.5 w-44 shadow-elevation-2"
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <Brain className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-semibold text-muted-foreground">Daily Practice</span>
          </div>
          <p className="text-sm text-foreground font-bold">3 cards due today</p>
          <div className="mt-2 flex gap-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 h-1.5 bg-primary/50 rounded-full" />
            ))}
            <div className="flex-1 h-1.5 bg-border rounded-full" />
            <div className="flex-1 h-1.5 bg-border rounded-full" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const steps = [
  {
    n: '01',
    icon: PenLine,
    title: 'Write it in your words',
    body: 'After you learn something, explain it plainly — no copy-paste. The act of writing is where understanding begins.',
  },
  {
    n: '02',
    icon: ScanLine,
    title: 'See what you truly know',
    body: 'AI reads your explanation and reflects it back: what you nailed, what slipped, and a clear score you can trust.',
  },
  {
    n: '03',
    icon: Repeat,
    title: 'Return before you forget',
    body: 'Spaced-repetition cards resurface each idea at the perfect moment, turning fragile memory into lasting knowledge.',
  },
];

function StepRow({ step, index }: { step: (typeof steps)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const Icon = step.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.08, ease }}
      className="relative grid sm:grid-cols-[auto_1fr] gap-5 sm:gap-8 items-start"
    >
      <div className="flex sm:flex-col items-center gap-4">
        <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-card border border-border/60 shadow-elevation-1 text-primary shrink-0">
          <Icon className="w-6 h-6" />
        </div>
        <span className="font-mono text-sm font-bold text-primary/70 sm:mt-1">{step.n}</span>
      </div>
      <div className="pt-1">
        <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
          {step.title}
        </h3>
        <p className="mt-2 text-base text-muted-foreground leading-relaxed max-w-lg text-pretty">
          {step.body}
        </p>
      </div>
    </motion.div>
  );
}

const features = [
  {
    icon: FileText,
    title: 'Smart Notes',
    description:
      'A calm, distraction-free space to capture what you learn — organised and always within reach.',
  },
  {
    icon: Sparkles,
    title: 'AI Analysis',
    description:
      'Instant, honest feedback on your understanding. Find the gaps before they cost you.',
    premium: true,
  },
  {
    icon: BookOpen,
    title: 'Daily Practice',
    description:
      'Spaced-repetition flashcards that bring ideas back right when you are about to forget.',
    premium: true,
  },
  {
    icon: BarChart3,
    title: 'Progress Tracking',
    description:
      'Watch understanding compound. Review counts, completion, and streaks at a glance.',
    premium: true,
  },
  {
    icon: Smartphone,
    title: 'Learn Anywhere',
    description:
      'Installable, fast, and beautiful on every device. Your knowledge travels with you.',
  },
  {
    icon: Shield,
    title: 'Private by Design',
    description: 'Your notes are encrypted and yours alone. No selling, no snooping — ever.',
  },
];

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
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.06, ease }}
      whileHover={{ y: -4 }}
      className="group relative rounded-3xl border border-border/60 bg-card p-7 shadow-elevation-1 hover:shadow-elevation-2 transition-shadow duration-300"
    >
      <div className="flex items-start justify-between mb-5">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        {premium && (
          <span className="text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 rounded-full px-2.5 py-1">
            Pro
          </span>
        )}
      </div>
      <h3 className="text-lg font-bold text-foreground tracking-tight mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{description}</p>
    </motion.div>
  );
}

function Nav() {
  return (
    <nav className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center justify-between glass border border-border/60 rounded-2xl pl-2.5 pr-2 py-2 shadow-elevation-2 w-full sm:w-auto sm:min-w-[500px]">
        <div className="flex items-center gap-2.5 px-1">
          <Logo size={28} className="shrink-0" />
          <span className="text-[15px] font-extrabold text-foreground tracking-tight">
            MemoMind
          </span>
        </div>

        <div className="flex items-center">
          <div className="hidden sm:flex items-center">
            <Link
              href="/pricing"
              className="px-3.5 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-xl transition-colors"
            >
              Pricing
            </Link>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-3.5 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-xl transition-colors">
                  Sign in
                </button>
              </SignInButton>
            </SignedOut>
          </div>

          <SignedOut>
            <SignUpButton mode="modal">
              <button className="ml-1.5 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-xl transition-all hover:bg-primary/90 shadow-elevation-1 whitespace-nowrap">
                <span className="hidden sm:inline">Get started</span>
                <span className="sm:hidden">Start</span>
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="ml-1.5 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-xl transition-all hover:bg-primary/90 shadow-elevation-1"
            >
              Dashboard
            </Link>
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}

export default function WelcomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const blobY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 140]);
  const heroFade = useTransform(scrollYProgress, [0, 0.8], [1, reduce ? 1 : 0]);

  return (
    <div className="theme-paper min-h-screen bg-background text-foreground overflow-x-hidden">
      <Nav />

      <section
        ref={heroRef}
        className="paper-grain relative min-h-screen flex items-center pt-28 sm:pt-32 pb-16 px-4 overflow-hidden"
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-70"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 72 72' width='72' height='72' fill='none' stroke='hsl(30 20%25 50%25 / 0.06)'%3e%3cpath d='M0 .5H71.5V72'/%3e%3c/svg%3e")`,
          }}
        />
        <motion.div style={{ y: blobY }} className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-15%] left-[10%] w-[680px] h-[680px] rounded-full bg-primary/[0.12] blur-[150px] animate-aurora-1" />
          <div className="absolute top-[5%] right-[2%] w-[520px] h-[520px] rounded-full bg-amber-500/[0.08] blur-[130px] animate-aurora-2" />
          <div className="absolute bottom-[-15%] left-[-5%] w-[560px] h-[560px] rounded-full bg-orange-400/[0.06] blur-[140px] animate-aurora-3" />
        </motion.div>

        <motion.div style={{ opacity: heroFade }} className="relative max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-[1.1fr_380px] xl:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="text-center lg:text-left"
            >
              <motion.div
                variants={fadeUp}
                className="inline-flex items-center gap-2 bg-card/70 border border-border/60 rounded-full px-4 py-1.5 mb-8 shadow-elevation-1"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="text-foreground text-sm font-semibold">A calmer way to learn</span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="font-extrabold text-[2.5rem] sm:text-5xl lg:text-6xl leading-[1.05] tracking-[-0.03em] mb-6"
              >
                <span className="block text-foreground">Remember more of</span>
                <span className="block min-h-[1.15em]">
                  <Typewriter
                    words={[
                      'what you read.',
                      'what you learn.',
                      'what you study.',
                      'what you recall.',
                    ]}
                    className="gradient-text italic"
                  />
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed text-pretty"
              >
                MemoMind turns what you study into understanding that stays — with honest AI
                feedback and spaced repetition that meets you right before you forget.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="flex flex-col items-center sm:flex-row sm:items-start gap-3 justify-center lg:justify-start"
              >
                <SignedOut>
                  <SignUpButton mode="modal">
                    <button className="group inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-7 py-3.5 rounded-xl font-semibold transition-all shadow-elevation-2 hover:shadow-elevation-3">
                      Start for free
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </SignUpButton>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 border border-border bg-card/50 hover:bg-card text-foreground px-7 py-3.5 rounded-xl font-semibold transition-colors"
                  >
                    View pricing
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link
                    href="/dashboard"
                    className="group inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-7 py-3.5 rounded-xl font-semibold transition-all shadow-elevation-2 hover:shadow-elevation-3"
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

            <div className="flex items-center justify-center mt-6 lg:mt-0">
              <FloatingPreview />
            </div>
          </div>
        </motion.div>
      </section>

      <section className="border-y border-border/50 py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-6 sm:gap-4">
          {[
            { value: '10K+', label: 'Notes captured' },
            { value: '98%', label: 'Feedback accuracy' },
            { value: '5×', label: 'Better retention' },
          ].map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease }}
              className="flex flex-col items-center text-center"
            >
              <span className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight tabular-nums">
                {value}
              </span>
              <span className="mt-1.5 text-xs sm:text-sm text-muted-foreground">{label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-24 sm:py-32 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-14 lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4"
            >
              How it works
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease }}
              className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight text-balance"
            >
              Learning that finally sticks.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="mt-5 text-lg text-muted-foreground leading-relaxed max-w-md text-pretty"
            >
              Three quiet steps, repeated. No cramming, no highlighting theatre — just a rhythm that
              turns effort into memory.
            </motion.p>
          </div>

          <div className="space-y-12 sm:space-y-16">
            {steps.map((step, i) => (
              <StepRow key={step.n} step={step} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-14">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4"
            >
              Everything you need
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease }}
              className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight text-balance"
            >
              A workspace built for deep understanding.
            </motion.h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <FeatureCard key={f.title} {...f} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-28 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4"
            >
              Pricing
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease }}
              className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight"
            >
              Start free. Upgrade when it clicks.
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease }}
              className="rounded-3xl border border-border/60 bg-card p-8 shadow-elevation-1"
            >
              <h3 className="font-bold text-lg text-foreground mb-1">Free</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-foreground">₹0</span>
                <span className="text-muted-foreground text-sm">/forever</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Unlimited notes', 'Clean, focused editor', 'Access on any device'].map(
                  (feat) => (
                    <li key={feat} className="flex items-center gap-3 text-sm text-foreground">
                      <Check className="w-4 h-4 text-primary shrink-0" /> {feat}
                    </li>
                  ),
                )}
              </ul>
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="inline-flex items-center justify-center w-full border border-border hover:bg-accent text-foreground px-6 py-3 rounded-xl font-semibold transition-colors">
                    Start for free
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center w-full border border-border hover:bg-accent text-foreground px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  Dashboard
                </Link>
              </SignedIn>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease }}
              className="relative p-[1.5px] rounded-3xl bg-gradient-to-br from-primary/60 via-primary/25 to-amber-500/40 shadow-elevation-2"
            >
              <span className="absolute -top-3 left-8 z-10 text-[11px] font-bold text-primary-foreground bg-primary rounded-full px-3 py-1 shadow-elevation-1">
                Most popular
              </span>
              <div className="rounded-[calc(1.5rem-1.5px)] bg-card p-8 h-full">
                <h3 className="font-bold text-lg text-foreground mb-1">Premium</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-extrabold text-foreground">₹99</span>
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
                  className="inline-flex items-center justify-center w-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-xl font-semibold transition-all shadow-elevation-1 hover:shadow-elevation-2"
                >
                  Upgrade to Premium
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative py-28 px-4 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[320px] bg-primary/12 rounded-full blur-[100px] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease }}
          className="relative max-w-2xl mx-auto text-center"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight mb-5 text-balance">
            Your mind deserves a better system.
          </h2>
          <p className="text-lg text-muted-foreground mb-9 text-pretty">
            Join the learners who never lose what they work so hard to understand.
          </p>
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="group inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-xl font-semibold text-base transition-all shadow-elevation-2 hover:shadow-elevation-3">
                Start for free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-xl font-semibold text-base transition-all shadow-elevation-2 hover:shadow-elevation-3"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </SignedIn>
        </motion.div>
      </section>

      <footer className="border-t border-border/50 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span className="font-bold text-foreground flex items-center gap-2">
            <Logo size={22} />
            MemoMind
            <span className="font-normal text-muted-foreground ml-1">&copy; 2026</span>
          </span>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="hover:text-foreground transition-colors">
              Pricing
            </Link>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="hover:text-foreground transition-colors">Sign in</button>
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
