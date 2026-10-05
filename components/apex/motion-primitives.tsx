"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { EASE_OUT } from "@/lib/apex/styles";

type PointerField = {
  x: MotionValue<number>;
  y: MotionValue<number>;
};

const PointerFieldContext = createContext<PointerField | null>(null);

/**
 * Normalises pointer position inside its own bounds to -0.5 … 0.5 and shares a
 * single pair of spring-smoothed values with every descendant layer, so depth
 * is expressed purely as a multiplier on one event stream.
 */
export function PointerFieldProvider({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 110, damping: 20, mass: 0.7 });
  const y = useSpring(rawY, { stiffness: 110, damping: 20, mass: 0.7 });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const update = (clientX: number, clientY: number) => {
      const rect = host.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      rawX.set(clientX / rect.width - 0.5);
      rawY.set(clientY / rect.height - 0.5);
    };
    const onMove = (event: PointerEvent) => update(event.clientX, event.clientY);
    const onLeave = () => {
      rawX.set(0);
      rawY.set(0);
    };

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [rawX, rawY]);

  const field = useMemo(() => ({ x, y }), [x, y]);

  return (
    <PointerFieldContext.Provider value={field}>
      <div ref={hostRef} className={className}>
        {children}
      </div>
    </PointerFieldContext.Provider>
  );
}

/**
 * Derives translate / tilt offsets for one depth plane. `depth` drives how far
 * the layer travels, `tilt` adds a 3D rotation so stacked planes read as
 * volumetric rather than merely offset.
 */
export function useParallaxLayer(depth = 1, tilt = 0) {
  const field = useContext(PointerFieldContext);
  const fallbackX = useMotionValue(0);
  const fallbackY = useMotionValue(0);
  const sourceX = field?.x ?? fallbackX;
  const sourceY = field?.y ?? fallbackY;

  return {
    x: useTransform(sourceX, [-0.5, 0.5], [-depth * 28, depth * 28]),
    y: useTransform(sourceY, [-0.5, 0.5], [-depth * 22, depth * 22]),
    rotateX: useTransform(sourceY, [-0.5, 0.5], [tilt, -tilt]),
    rotateY: useTransform(sourceX, [-0.5, 0.5], [-tilt * 1.5, tilt * 1.5]),
  };
}

export function ParallaxLayer({
  depth = 1,
  tilt = 0,
  className,
  style,
  children,
}: {
  depth?: number;
  tilt?: number;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}) {
  const plane = useParallaxLayer(depth, tilt);
  return (
    <motion.div
      className={className}
      style={{ ...plane, transformPerspective: 1400, ...style }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Shares one scroll-progress signal (scoped to the provider's own bounds) with
 * every descendant `DriftLayer`, so a stack of layers can move at different
 * rates off a single scroll listener.
 */
type ScrollField = { progress: MotionValue<number> };

type ScrollOffset = NonNullable<
  NonNullable<Parameters<typeof useScroll>[0]>["offset"]
>;

const ScrollFieldContext = createContext<ScrollField | null>(null);

export function ScrollFieldProvider({
  children,
  className,
  offset = ["start end", "end start"],
}: {
  children: ReactNode;
  className?: string;
  offset?: ScrollOffset;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset });
  const field = useMemo(() => ({ progress: scrollYProgress }), [scrollYProgress]);

  return (
    <ScrollFieldContext.Provider value={field}>
      <div ref={ref} className={className}>
        {children}
      </div>
    </ScrollFieldContext.Provider>
  );
}

export function DriftLayer({
  from = 0,
  to = 0,
  damping = 28,
  className,
  children,
}: {
  from?: number;
  to?: number;
  damping?: number;
  className?: string;
  children: ReactNode;
}) {
  const field = useContext(ScrollFieldContext);
  const fallback = useMotionValue(0);
  const progress = field?.progress ?? fallback;
  const raw = useTransform(progress, [0, 1], [from, to]);
  const y = useSpring(raw, { stiffness: 120, damping, mass: 0.5 });

  return (
    <motion.div className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}

export function Reveal({
  children,
  delay = 0,
  y = 26,
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-80px 0px -80px 0px" }}
      transition={{ duration: 0.7, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Glass card that tracks the cursor with a radial spotlight. Pointer position is
 * written straight to CSS custom properties so the hover response never triggers
 * a React render.
 */
export function SpotlightCard({
  children,
  className,
  radius = 420,
  tone = "sky",
  as: TagName = "div",
}: {
  children: ReactNode;
  className?: string;
  radius?: number;
  tone?: "sky" | "violet";
  as?: "div" | "article" | "li";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const glow =
    tone === "sky" ? "rgba(56,189,248,0.16)" : "rgba(139,92,246,0.16)";
  const Tag = TagName as "div";

  const onMove = (event: React.PointerEvent<HTMLElement>) => {
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    element.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    element.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };

  const onLeave = () => {
    const element = ref.current;
    if (!element) return;
    element.style.setProperty("--mx", "50%");
    element.style.setProperty("--my", "0%");
  };

  return (
    <Tag
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`group relative isolate overflow-hidden ${className ?? ""}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(${radius}px circle at var(--mx, 50%) var(--my, 0%), ${glow}, transparent 70%)`,
        }}
      />
      {children}
    </Tag>
  );
}