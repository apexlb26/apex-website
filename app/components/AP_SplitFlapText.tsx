"use client";

import { CSSProperties, HTMLAttributes, useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_WORDS = ["INITIALIZING", "SYNCING SYSTEMS", "APEX ONLINE"];
const CHARSETS = {
  alpha: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  alphanumeric: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  numeric: "0123456789",
} as const;

type CharsetName = keyof typeof CHARSETS;
type Tile = { current: string; next: string; flipping: boolean; tick: number };

type SplitFlapProps = Omit<HTMLAttributes<HTMLDivElement>, "style"> & {
  words?: string[];
  text?: string;
  flipDuration?: number;
  stagger?: number;
  cycleDelay?: number;
  charset?: CharsetName | string;
  flipsPerChar?: number;
  tileColor?: string;
  textColor?: string;
  tileRadius?: number | string;
  gap?: number | string;
  fontSize?: number | string;
  loop?: boolean;
  padTo?: number;
  style?: CSSProperties;
};

const toCssUnit = (value: number | string) => (typeof value === "number" ? `${value}px` : value);
const resolveCharset = (charset: string) => (charset in CHARSETS ? CHARSETS[charset as CharsetName] : charset.length > 0 ? charset : CHARSETS.alphanumeric);
const normalizePhrase = (phrase: string, width: number) => String(phrase ?? "").padEnd(width, " ").slice(0, width);
const createTiles = (phrase: string): Tile[] => phrase.split("").map((char) => ({ current: char, next: char, flipping: false, tick: 0 }));
const sampleChar = (charset: string) => charset.charAt(Math.floor(Math.random() * charset.length)) || " ";
const buildSequence = (target: string, flips: number, charset: string) => Array.from({ length: flips }, () => sampleChar(charset)).concat(target);

function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);
  useEffect(() => {
    if (!window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setPrefersReduced(mediaQuery.matches);
    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);
  return prefersReduced;
}

export default function AP_SplitFlapText({
  words = DEFAULT_WORDS,
  text,
  flipDuration = 0.105,
  stagger = 0.035,
  cycleDelay = 760,
  charset = "alphanumeric",
  flipsPerChar = 5,
  tileColor = "#171A1D",
  textColor = "#F8FAFC",
  tileRadius = 5,
  gap = 3,
  fontSize = 15,
  loop = false,
  padTo = 15,
  className = "",
  style = {},
  ...props
}: SplitFlapProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const rafRef = useRef<number | null>(null);
  const cycleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentTextRef = useRef("");

  const sourceWords = Array.isArray(words) && words.length > 0 ? words : DEFAULT_WORDS;
  const phrasesKey = typeof text === "string" ? text : sourceWords.map((word) => String(word ?? "")).join("\u001f");
  const phrases = useMemo(() => phrasesKey.split("\u001f"), [phrasesKey]);
  const width = useMemo(() => Math.max(1, Math.ceil(Number(padTo) || 0), phrases.reduce((max, phrase) => Math.max(max, phrase.length), 1)), [padTo, phrases]);
  const normalizedPhrases = useMemo(() => phrases.map((phrase) => normalizePhrase(phrase, width)), [phrases, width]);
  const [tiles, setTiles] = useState<Tile[]>(() => createTiles(normalizedPhrases[0] || ""));

  useEffect(() => {
    const clearAnimation = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current);
      rafRef.current = null;
      cycleTimerRef.current = null;
    };

    clearAnimation();
    const firstPhrase = normalizedPhrases[0] || "";
    currentTextRef.current = firstPhrase;
    setTiles(createTiles(firstPhrase));
    if (normalizedPhrases.length <= 1) return clearAnimation;

    let phraseIndex = 0;
    let cancelled = false;
    const safeFlipMs = Math.max(40, (Number(flipDuration) || 0.105) * 1000);
    const safeStaggerMs = Math.max(0, (Number(stagger) || 0) * 1000);
    const safeCycleDelay = Math.max(300, Number(cycleDelay) || 760);
    const safeFlips = Math.max(0, Math.floor(Number(flipsPerChar) || 0));
    const activeCharset = resolveCharset(charset);

    const animateTo = (targetPhrase: string) => {
      if (prefersReducedMotion) {
        currentTextRef.current = targetPhrase;
        setTiles(createTiles(targetPhrase));
        return 0;
      }

      const fromPhrase = normalizePhrase(currentTextRef.current, width);
      const plans = targetPhrase.split("").map((target, index) => {
        const from = fromPhrase[index] || " ";
        if (from === target) return null;
        return { index, from, target, sequence: buildSequence(target, safeFlips, activeCharset), start: index * safeStaggerMs, step: -1, done: false };
      }).filter(Boolean) as Array<{ index: number; from: string; target: string; sequence: string[]; start: number; step: number; done: boolean }>;

      if (!plans.length) return 0;
      const totalDuration = plans.reduce((max, plan) => Math.max(max, plan.start + plan.sequence.length * safeFlipMs), 0);
      const startedAt = performance.now();

      const tick = (now: number) => {
        if (cancelled) return;
        const elapsed = now - startedAt;
        const updates: Array<{ index: number; current: string; next: string; done: boolean }> = [];
        let shouldContinue = false;

        plans.forEach((plan) => {
          const localElapsed = elapsed - plan.start;
          if (localElapsed < 0) { shouldContinue = true; return; }
          const step = Math.floor(localElapsed / safeFlipMs);
          if (step < plan.sequence.length) {
            shouldContinue = true;
            if (step !== plan.step) {
              plan.step = step;
              updates.push({ index: plan.index, current: step === 0 ? plan.from : plan.sequence[step - 1], next: plan.sequence[step], done: false });
            }
          } else if (!plan.done) {
            plan.done = true;
            updates.push({ index: plan.index, current: plan.target, next: plan.target, done: true });
          }
        });

        if (updates.length) {
          setTiles((previous) => {
            const nextTiles = [...previous];
            updates.forEach((update) => {
              const tile = nextTiles[update.index];
              if (!tile) return;
              nextTiles[update.index] = { current: update.current, next: update.next, flipping: !update.done, tick: tile.tick + 1 };
            });
            return nextTiles;
          });
        }

        if (shouldContinue) rafRef.current = requestAnimationFrame(tick);
        else { currentTextRef.current = targetPhrase; rafRef.current = null; }
      };

      rafRef.current = requestAnimationFrame(tick);
      return totalDuration;
    };

    const scheduleNext = (delay: number) => {
      cycleTimerRef.current = setTimeout(() => {
        if (cancelled) return;
        const nextIndex = phraseIndex + 1;
        if (nextIndex >= normalizedPhrases.length && !loop) return;
        phraseIndex = nextIndex % normalizedPhrases.length;
        const animationDuration = animateTo(normalizedPhrases[phraseIndex]);
        scheduleNext(safeCycleDelay + animationDuration);
      }, delay);
    };

    scheduleNext(safeCycleDelay);
    return () => { cancelled = true; clearAnimation(); };
  }, [normalizedPhrases, width, loop, cycleDelay, flipDuration, stagger, flipsPerChar, charset, prefersReducedMotion]);

  const settledText = tiles.map((tile) => tile.current).join("").trimEnd();
  const componentStyle = {
    "--split-flap-tile-color": tileColor,
    "--split-flap-text-color": textColor,
    "--split-flap-radius": toCssUnit(tileRadius),
    "--split-flap-gap": toCssUnit(gap),
    "--split-flap-font-size": toCssUnit(fontSize),
    "--split-flap-flip-duration": `${Math.max(0.04, Number(flipDuration) || 0.105)}s`,
    ...style,
  } as CSSProperties;

  return (
    <div className={`split-flap-text ${className}`.trim()} style={componentStyle} role="text" aria-label={settledText || undefined} {...props}>
      {tiles.map((tile, index) => (
        <span className="split-flap-text__tile" aria-hidden="true" key={`${index}-${tiles.length}`}>
          <span className="split-flap-text__half split-flap-text__half--top"><span className="split-flap-text__char">{tile.current === " " ? "\u00A0" : tile.current}</span></span>
          <span className="split-flap-text__half split-flap-text__half--bottom"><span className="split-flap-text__char">{tile.flipping ? tile.next : tile.current}</span></span>
          {tile.flipping && <>
            <span className="split-flap-text__flap split-flap-text__flap--front" key={`front-${index}-${tile.tick}`}><span className="split-flap-text__char">{tile.current === " " ? "\u00A0" : tile.current}</span></span>
            <span className="split-flap-text__flap split-flap-text__flap--back" key={`back-${index}-${tile.tick}`}><span className="split-flap-text__char">{tile.next === " " ? "\u00A0" : tile.next}</span></span>
          </>}
        </span>
      ))}
    </div>
  );
}
