import { useEffect, useRef, useState } from "react";

// Animated count-up for a stat value. Jumps straight to the value when the
// user prefers reduced motion.
export default function StatCard({ value, label, sub }) {
  const [shown, setShown] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    const target = Number(value) || 0;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(target);
      return undefined;
    }
    const start = performance.now();
    const duration = 650;
    function step(now) {
      const progress = Math.min(1, (now - start) / duration);
      setShown(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) raf.current = requestAnimationFrame(step);
    }
    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [value]);

  return (
    <div className="stat">
      <b>{shown}</b>
      <span>{label}</span>
      {sub ? <small>{sub}</small> : null}
    </div>
  );
}
