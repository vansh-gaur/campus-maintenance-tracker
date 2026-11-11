import { useRef, useState } from "react";

// CSS-only 3D tilt: rotateX/rotateY driven by the pointer. The parent
// container supplies the perspective (see styles.css: .container, .grid,
// .list). Disabled on touch devices, small screens and reduced motion, so
// the card is always plain and usable without it.
export default function TiltCard({ children, className = "", delay = 0, as: Tag = "div" }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  function canTilt() {
    if (typeof window === "undefined") return false;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    if (window.matchMedia("(hover: none)").matches) return false;
    if (window.innerWidth < 720) return false;
    return true;
  }

  function onMove(e) {
    if (!canTilt() || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: -py * 6, ry: px * 8 });
  }

  return (
    <Tag
      ref={ref}
      className={`tilt rise ${className}`}
      style={{ "--rx": `${tilt.rx}deg`, "--ry": `${tilt.ry}deg`, "--delay": `${delay}ms` }}
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
    >
      <div className="tilt-inner">{children}</div>
    </Tag>
  );
}
